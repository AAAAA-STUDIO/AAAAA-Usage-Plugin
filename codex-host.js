/**
 * Host half of the Codex usage monitor.
 *
 * Reads the Codex credentials from `~/.codex/auth.json`, asks the ChatGPT
 * usage endpoint (`/backend-api/wham/usage`) for the current 5-hour and weekly
 * rate-limit windows, and falls back to the newest local Codex rollout record
 * when that request cannot be made. The snapshot is served to the Client half
 * over one same-origin JSON route; the access token never leaves this process.
 *
 * @module @local/dsh-codex-usage
 */
import { open, readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** Default ChatGPT usage endpoint used by the Codex clients. */
const DEFAULT_ENDPOINT = 'https://chatgpt.com/backend-api/wham/usage'

/** How many day directories under `sessions/` the local fallback inspects. */
const SESSION_SCAN_DAYS = 14

/** Bytes read from the tail of one rollout file. */
const ROLLOUT_TAIL_BYTES = 384 * 1024

/** Exact Connection Fetch path; the Client reads it with a relative `api/...` URL. */
const ROUTE_PATH = '/api/dsh-codex-usage'

/** Tunable values; the row's `config` wins over these environment variables. */
const DEFAULTS = {
  codexHome: '',
  endpoint: DEFAULT_ENDPOINT,
  refreshSeconds: 30,
  timeoutMs: 8000,
}

/**
 * Merge the row config, the environment overrides, and the defaults.
 * @param config - raw row config, when the patch supplies one.
 * @returns `{ codexHome, endpoint, refreshSeconds, timeoutMs }`.
 */
function resolveOptions(config) {
  const env = process.env
  const pickNumber = (value, fallback, min, max) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(max, Math.max(min, parsed))
  }
  const row = config !== null && typeof config === 'object' ? config : {}
  const codexHome = typeof row.codexHome === 'string' && row.codexHome.trim() !== ''
    ? row.codexHome.trim()
    : typeof env.DSH_CODEX_USAGE_HOME === 'string' && env.DSH_CODEX_USAGE_HOME.trim() !== ''
      ? env.DSH_CODEX_USAGE_HOME.trim()
      : DEFAULTS.codexHome
  const endpoint = typeof row.endpoint === 'string' && row.endpoint.trim() !== ''
    ? row.endpoint.trim()
    : typeof env.DSH_CODEX_USAGE_ENDPOINT === 'string' && env.DSH_CODEX_USAGE_ENDPOINT.trim() !== ''
      ? env.DSH_CODEX_USAGE_ENDPOINT.trim()
      : DEFAULTS.endpoint
  return {
    codexHome,
    endpoint,
    refreshSeconds: pickNumber(row.refreshSeconds ?? env.DSH_CODEX_USAGE_REFRESH_SECONDS, DEFAULTS.refreshSeconds, 5, 3600),
    timeoutMs: pickNumber(row.timeoutMs ?? env.DSH_CODEX_USAGE_TIMEOUT_MS, DEFAULTS.timeoutMs, 1000, 30000),
  }
}

/**
 * Resolve the configured Codex home directory.
 * @param config - validated plugin config.
 * @returns an absolute directory path.
 */
function codexHomeOf(config) {
  const configured = typeof config.codexHome === 'string' ? config.codexHome.trim() : ''
  return configured === '' ? join(homedir(), '.codex') : configured
}

/** Two-digit zero padding. */
function pad(value) {
  return String(value).padStart(2, '0')
}

/**
 * Read the ChatGPT session from the Codex credential file.
 * @param codexHome - Codex home directory.
 * @returns `{ status: 'chatgpt', accessToken, accountId }`, `{ status: 'api-key' }`,
 * or `{ status: 'missing', reason }`.
 */
async function readAuth(codexHome) {
  let raw
  try {
    raw = await readFile(join(codexHome, 'auth.json'), 'utf8')
  } catch (error) {
    return { status: 'missing', reason: error.code === 'ENOENT' ? 'auth.json not found' : String(error.message ?? error) }
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { status: 'missing', reason: 'auth.json is not valid JSON' }
  }
  const tokens = parsed?.tokens ?? {}
  if (typeof tokens.access_token !== 'string' || tokens.access_token === '') {
    return parsed?.OPENAI_API_KEY
      ? { status: 'api-key', reason: 'auth.json holds an API key, not a ChatGPT session' }
      : { status: 'missing', reason: 'auth.json holds no ChatGPT access token' }
  }
  return {
    status: 'chatgpt',
    accessToken: tokens.access_token,
    accountId: typeof tokens.account_id === 'string' ? tokens.account_id : undefined,
  }
}

/**
 * Normalize one usage window from the HTTP response.
 * @param window - `primary_window` or `secondary_window`.
 * @param fallbackSeconds - window length used when the payload omits it.
 * @returns a normalized window, or null.
 */
function liveWindowOf(window, fallbackSeconds) {
  if (window === null || typeof window !== 'object') return null
  const used = Number(window.used_percent)
  const seconds = Number(window.limit_window_seconds)
  const resetAt = Number(window.reset_at)
  const resetAfter = Number(window.reset_after_seconds)
  return {
    usedPercent: Number.isFinite(used) ? used : 0,
    windowSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : fallbackSeconds,
    resetAtMs: Number.isFinite(resetAt) && resetAt > 0
      ? resetAt * 1000
      : Number.isFinite(resetAfter) && resetAfter > 0
        ? Date.now() + resetAfter * 1000
        : null,
  }
}

/**
 * Normalize one usage window from a local Codex rollout record.
 * @param window - `primary` or `secondary` of `rate_limits`.
 * @param fallbackSeconds - window length used when the payload omits it.
 * @returns a normalized window, or null.
 */
function sessionWindowOf(window, fallbackSeconds) {
  if (window === null || typeof window !== 'object') return null
  const used = Number(window.used_percent)
  const minutes = Number(window.window_minutes)
  const resetsAt = Number(window.resets_at)
  return {
    usedPercent: Number.isFinite(used) ? used : 0,
    windowSeconds: Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : fallbackSeconds,
    resetAtMs: Number.isFinite(resetsAt) && resetsAt > 0 ? resetsAt * 1000 : null,
  }
}

/**
 * Ask the ChatGPT usage endpoint for one account's limit snapshot.
 * @param auth - result of {@link readAuth} with `status: 'chatgpt'`.
 * @param config - validated plugin config.
 * @returns the parsed response body.
 */
async function fetchLiveUsage(auth, config) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.timeoutMs)
  try {
    const headers = {
      authorization: `Bearer ${auth.accessToken}`,
      accept: 'application/json',
      'user-agent': 'dsh-codex-usage/1.0',
      originator: 'codex_cli_rs',
    }
    if (auth.accountId !== undefined) headers['chatgpt-account-id'] = auth.accountId
    const response = await fetch(config.endpoint, { method: 'GET', headers, signal: controller.signal })
    const text = await response.text()
    if (!response.ok) {
      const detail = text.replace(/\s+/g, ' ').slice(0, 180)
      throw new Error(`HTTP ${response.status}${detail === '' ? '' : ` ${detail}`}`)
    }
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('usage endpoint returned invalid JSON')
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Read the newest `rate_limits` record from one rollout file.
 * @param path - absolute rollout JSONL path.
 * @returns the record and its own timestamp, or null.
 */
async function scanRollout(path) {
  let handle
  try {
    handle = await open(path, 'r')
  } catch {
    return null
  }
  try {
    const info = await handle.stat()
    const length = Math.min(info.size, ROLLOUT_TAIL_BYTES)
    if (length <= 0) return null
    const buffer = Buffer.alloc(length)
    await handle.read(buffer, 0, length, info.size - length)
    const lines = buffer.toString('utf8').split('\n')
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const line = lines[index]
      if (!line.includes('"rate_limits"')) continue
      let record
      try {
        record = JSON.parse(line)
      } catch {
        continue
      }
      const limits = record?.payload?.rate_limits
      if (limits === null || typeof limits !== 'object') continue
      const at = Date.parse(record?.timestamp ?? '')
      return { limits, atMs: Number.isFinite(at) ? at : info.mtimeMs }
    }
    return null
  } catch {
    return null
  } finally {
    await handle.close()
  }
}

/**
 * Find the freshest local Codex rate-limit record, newest day first.
 * @param codexHome - Codex home directory.
 * @returns `{ limits, atMs }`, or null when no rollout carries limits.
 */
async function readSessionUsage(codexHome) {
  const root = join(codexHome, 'sessions')
  const today = new Date()
  for (let offset = 0; offset < SESSION_SCAN_DAYS; offset += 1) {
    const day = new Date(today.getTime() - offset * 86400000)
    const directory = join(root, String(day.getFullYear()), pad(day.getMonth() + 1), pad(day.getDate()))
    let entries
    try {
      entries = await readdir(directory)
    } catch {
      continue
    }
    const files = []
    for (const entry of entries) {
      if (!entry.endsWith('.jsonl')) continue
      const path = join(directory, entry)
      try {
        const info = await stat(path)
        files.push({ path, mtimeMs: info.mtimeMs })
      } catch {
        // A rollout removed between readdir and stat is simply skipped.
      }
    }
    files.sort((left, right) => right.mtimeMs - left.mtimeMs)
    for (const file of files.slice(0, 3)) {
      const found = await scanRollout(file.path)
      if (found !== null) return found
    }
  }
  return null
}

/**
 * Build the client-facing snapshot from a live usage response.
 * @param body - parsed usage response.
 * @returns a normalized snapshot.
 */
function snapshotFromLive(body) {
  const limit = body?.rate_limit ?? {}
  const credits = body?.credits ?? {}
  return {
    source: 'live',
    updatedAt: Date.now(),
    account: {
      email: typeof body?.email === 'string' ? body.email : null,
      planType: typeof body?.plan_type === 'string' ? body.plan_type : null,
    },
    windows: {
      primary: liveWindowOf(limit.primary_window, 5 * 3600),
      secondary: liveWindowOf(limit.secondary_window, 7 * 86400),
    },
    credits: {
      hasCredits: credits.has_credits === true,
      unlimited: credits.unlimited === true,
      balance: typeof credits.balance === 'string' ? credits.balance : null,
      overageLimitReached: credits.overage_limit_reached === true,
    },
    resetCredits: {
      available: Number(body?.rate_limit_reset_credits?.available_count) || 0,
      applicable: Number(body?.rate_limit_reset_credits?.applicable_available_count) || 0,
    },
    rateLimitReached: limit.limit_reached === true,
    spendControlReached: body?.spend_control?.reached === true,
    error: null,
  }
}

/**
 * Build the client-facing snapshot from a local rollout record.
 * @param found - result of {@link readSessionUsage}.
 * @param reason - why the live request did not produce the snapshot.
 * @param account - account facts already known from `auth.json`.
 * @returns a normalized snapshot.
 */
function snapshotFromSession(found, reason, account) {
  return {
    source: 'session',
    updatedAt: found.atMs,
    account: { email: null, planType: null, ...account },
    windows: {
      primary: sessionWindowOf(found.limits.primary, 5 * 3600),
      secondary: sessionWindowOf(found.limits.secondary, 7 * 86400),
    },
    credits: { hasCredits: false, unlimited: false, balance: null, overageLimitReached: false },
    resetCredits: { available: 0, applicable: 0 },
    rateLimitReached: false,
    spendControlReached: false,
    error: reason,
  }
}

/**
 * Account facts that `auth.json` can supply without a network call.
 * @param codexHome - Codex home directory.
 * @returns `{ email, planType }` with nulls when unavailable.
 */
async function readAccountHints(codexHome) {
  const hints = { email: null, planType: null }
  try {
    const raw = await readFile(join(codexHome, 'auth.json'), 'utf8')
    const parsed = JSON.parse(raw)
    const token = parsed?.tokens?.id_token
    if (typeof token !== 'string') return hints
    const payload = token.split('.')[1]
    if (payload === undefined) return hints
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    const auth = claims?.['https://api.openai.com/auth'] ?? {}
    if (typeof claims?.email === 'string') hints.email = claims.email
    if (typeof auth.chatgpt_plan_type === 'string') hints.planType = auth.chatgpt_plan_type
  } catch {
    // Hints are cosmetic; a missing or malformed token never fails the snapshot.
  }
  return hints
}

/**
 * Own the cached snapshot and the single in-flight refresh.
 * @param config - validated plugin config.
 * @returns `{ get(force) }`.
 */
function createUsageMonitor(config) {
  const codexHome = codexHomeOf(config)
  const refreshMs = config.refreshSeconds * 1000
  let snapshot = null
  let inflight = null

  async function compute() {
    const auth = await readAuth(codexHome)
    if (auth.status === 'chatgpt') {
      try {
        const body = await fetchLiveUsage(auth, config)
        snapshot = { ...snapshotFromLive(body), fetchedAt: Date.now(), stale: false }
        return
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        const found = await readSessionUsage(codexHome)
        if (found !== null) {
          const hints = await readAccountHints(codexHome)
          snapshot = { ...snapshotFromSession(found, `live request failed: ${reason}`, hints), fetchedAt: Date.now(), stale: false }
          return
        }
        if (snapshot !== null) {
          snapshot = { ...snapshot, stale: true, error: `live request failed: ${reason}` }
          return
        }
        throw new Error(`live request failed: ${reason} and no local Codex record was found`)
      }
    }
    if (auth.status === 'api-key') {
      throw new Error('Codex is signed in with an API key; ChatGPT rate limits are unavailable')
    }
    const found = await readSessionUsage(codexHome)
    const hints = await readAccountHints(codexHome)
    if (found !== null) {
      snapshot = { ...snapshotFromSession(found, auth.reason, hints), fetchedAt: Date.now(), stale: false }
      return
    }
    throw new Error(`${auth.reason}; no local Codex record was found`)
  }

  return {
    get(force) {
      if (inflight !== null) return inflight
      if (!force && snapshot !== null && Date.now() - snapshot.fetchedAt < refreshMs) return Promise.resolve(snapshot)
      inflight = compute()
        .then(() => snapshot)
        .finally(() => {
          inflight = null
        })
      return inflight
    },
  }
}

/**
 * Answer one usage request with the cached snapshot.
 * @param monitor - usage monitor owned by this plugin.
 * @param request - authenticated exact-Fetch request.
 * @returns a JSON response.
 */
async function respond(monitor, request) {
  const headers = {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  }
  if (request.method === 'HEAD') return new Response(null, { headers })
  const force = new URL(request.url).searchParams.get('force') === '1'
  try {
    const data = await monitor.get(force)
    return new Response(JSON.stringify({ ok: true, data }), { headers })
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }), { status: 503, headers })
  }
}

/** The Connection service owns the authenticated `/api` exact-Fetch registry. */
export const inject = ['connection']

/**
 * Mount the usage monitor and its one JSON route.
 *
 * The route lives on the Host Connection exact-Fetch registry, so the page's
 * signed browser cookie authenticates it and the access token never reaches
 * the browser.
 *
 * @param ctx - Host context carrying the Connection service.
 * @param config - raw row config, when the patch supplies one.
 */
export function apply(ctx, config) {
  const monitor = createUsageMonitor(resolveOptions(config))
  ctx.effect(() => ctx.connection.fetch.register({
    path: ROUTE_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: (request) => respond(monitor, request),
  }), 'codex-usage: usage route')
}
