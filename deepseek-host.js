/**
 * Host half of the DeepSeek usage panel.
 *
 * Serves one authenticated, document-relative JSON route that the browser half
 * reads:
 *
 * - `account` comes from the mounted `deepseekAccount` service: sign-in state,
 *   profile, and the recharge/bonus wallet balances fetched from Platform.
 * - `officialSpend` reads cumulative spend from Platform's account summary;
 *   the session logs never substitute for that billing amount.
 * - `tokens` is folded from this device's session logs through
 *   `sessionQuery`: per-Session and aggregate input, cached-input, output, and
 *   reasoning token counts, plus the provider-reported context pressure for
 *   live Sessions when `sessionProjections` exposes it. Each call also carries
 *   an estimated CNY cost from DeepSeek's published prices; the legacy
 *   `scope=cumulative` response remains a local estimate for compatibility.
 *
 * Routes are registered on the Host Connection exact-Fetch registry, so the
 * page's signed browser cookie authenticates them. Results are cached briefly
 * to keep an open panel from re-reading logs on every render.
 *
 * @module
 */

/** Absolute registration path; the browser addresses its relative form. */
const ROUTE_PATH = '/api/dsh-deepseek-usage'

/** Separate exact-Fetch route for official spend; query parameters are not preserved. */
const OFFICIAL_SPEND_ROUTE_PATH = '/api/dsh-deepseek-official-spend'

/** Newest Sessions whose full logs are folded on one refresh. */
const MAX_SESSIONS = 12

/** Parallel Session-log reads per refresh. */
const READ_CONCURRENCY = 4

/** Reuse a folded token result for this long unless `refresh=1`. */
const TOKEN_CACHE_MS = 30_000

/** Reuse account/balance data for this long unless `refresh=1`. */
const BALANCE_CACHE_MS = 15_000

/** Reuse Platform's official cumulative spend briefly between UI refreshes. */
const OFFICIAL_SPEND_CACHE_MS = 60_000

/** The official account portal origin; credentials are never sent elsewhere. */
const PLATFORM_ORIGIN = 'https://platform.deepseek.com'

/** Reuse the all-Session cumulative estimate for this long unless `refresh=1`. */
const CUMULATIVE_CACHE_MS = 10 * 60_000

/** Sessions folded for one cumulative estimate. */
const MAX_CUMULATIVE_SESSIONS = 200

/** Official DeepSeek CNY prices per million tokens. */
const PRICES = {
  flash: {
    peak: { hit: 0.04, miss: 2, out: 8 },
    offPeak: { hit: 0.02, miss: 1, out: 4 },
  },
  pro: {
    peak: { hit: 0.3, miss: 9, out: 27 },
    offPeak: { hit: 0.15, miss: 4.5, out: 13.5 },
  },
}

/** Public price page the estimate follows. */
const PRICING_SOURCE = 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing'

/** Beijing is UTC+8 year-round. */
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000

/** Reported to Platform as the requesting UI's client version. */
const CLIENT_VERSION = '0.1.0'

/** Mirror DSH's Platform client identity without sending a desktop-only value on Linux. */
const CLIENT_PLATFORM = typeof process === 'object'
  ? process.platform === 'darwin'
    ? 'desktop-mac'
    : process.platform === 'win32'
      ? 'desktop-win'
      : 'web'
  : 'web'

/** @type {{ at: number, value: unknown }} */
let tokenCache = { at: 0, value: null }

/** @type {{ at: number, value: unknown }} */
let balanceCache = { at: 0, value: null }

/** @type {{ at: number, userId: string | null, value: unknown }} */
let officialSpendCache = { at: 0, userId: null, value: null }

/** @type {{ at: number, value: unknown }} */
let cumulativeCache = { at: 0, value: null }

export const inject = ['connection']

/**
 * Register the usage route for this profile.
 * @param ctx - Host context carrying the Connection service.
 */
export function apply(ctx) {
  tokenCache = { at: 0, value: null }
  balanceCache = { at: 0, value: null }
  officialSpendCache = { at: 0, userId: null, value: null }
  cumulativeCache = { at: 0, value: null }
  ctx.effect(() => ctx.connection.fetch.register({
    path: ROUTE_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: (request) => respond(ctx, request),
  }), 'deepseek-usage: exact usage route')
  ctx.effect(() => ctx.connection.fetch.register({
    path: OFFICIAL_SPEND_ROUTE_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: (request) => respond(ctx, request, 'official'),
  }), 'deepseek-usage: official spend route')
}

/**
 * Answer one usage request.
 * @param ctx - Host context.
 * @param request - authenticated exact-Fetch request.
 * @param route - optional route scope fixed by the registered path.
 * @returns a JSON response with account and token data.
 */
async function respond(ctx, request, route = null) {
  const headers = {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  }
  if (request.method === 'HEAD') return new Response(null, { headers })

  const url = new URL(request.url)
  const client = {
    version: CLIENT_VERSION,
    locale: normalizeLocale(request.headers.get('x-dsh-usage-locale')
      ?? url.searchParams.get('locale')),
    timezoneOffsetSeconds: normalizeTimezone(request.headers.get('x-dsh-usage-timezone-offset')
      ?? url.searchParams.get('tz')),
  }
  const force = request.headers.get('x-dsh-usage-refresh') === '1'
    || url.searchParams.get('refresh') === '1'

  try {
    if (route === 'official' || url.searchParams.get('scope') === 'official') {
      const officialSpend = await readOfficialSpend(ctx, client, force, Date.now())
      return new Response(JSON.stringify({
        version: 1,
        generatedAt: Date.now(),
        officialSpend,
      }), { headers })
    }
    if (url.searchParams.get('scope') === 'cumulative') {
      const cumulative = await readCumulative(ctx, force, Date.now())
      return new Response(JSON.stringify({
        version: 1,
        generatedAt: Date.now(),
        cumulative,
      }), { headers })
    }
    const payload = await buildPayload(ctx, client, force)
    return new Response(JSON.stringify(payload), { headers })
  } catch (error) {
    return new Response(JSON.stringify({
      version: 1,
      generatedAt: Date.now(),
      error: errorMessage(error),
    }), { status: 500, headers })
  }
}

/**
 * Build one complete payload; account and token failures stay isolated.
 * @param ctx - Host context.
 * @param client - requesting-UI metadata for Platform calls.
 * @param force - whether to bypass both caches.
 * @returns the JSON payload.
 */
async function buildPayload(ctx, client, force) {
  const generatedAt = Date.now()
  const [account, tokens] = await Promise.all([
    readAccount(ctx, client, force, generatedAt),
    readTokens(ctx, force, generatedAt),
  ])
  return { version: 1, generatedAt, account, tokens }
}

// ---------------------------------------------------------------------------
// Account and balance
// ---------------------------------------------------------------------------

/**
 * Read sign-in state, profile, and wallet balances.
 * @param ctx - Host context.
 * @param client - requesting-UI metadata.
 * @param force - whether to bypass the balance cache.
 * @param now - request timestamp.
 * @returns the account projection.
 */
async function readAccount(ctx, client, force, now) {
  const service = ctx.get('deepseekAccount')
  if (service === undefined) {
    return {
      available: false,
      status: 'unavailable',
      links: null,
      profile: null,
      balance: null,
      profileFailed: false,
      balanceFailed: false,
    }
  }

  if (!force && balanceCache.value !== null && now - balanceCache.at < BALANCE_CACHE_MS) {
    return balanceCache.value
  }

  let state
  try {
    state = await service.getState()
  } catch (error) {
    return {
      available: true,
      status: 'error',
      error: errorMessage(error),
      links: null,
      profile: null,
      balance: null,
      profileFailed: false,
      balanceFailed: false,
    }
  }

  const links = readLinks(state)
  if (state === null || typeof state !== 'object' || state.status !== 'credential-stored') {
    const value = {
      available: true,
      status: 'signed-out',
      links,
      profile: null,
      balance: null,
      profileFailed: false,
      balanceFailed: false,
    }
    balanceCache = { at: now, value }
    return value
  }

  const [profileResult, balanceResult] = await Promise.allSettled([
    service.getProfile(client),
    service.getBalance(client),
  ])
  const profile = profileResult.status === 'fulfilled'
    ? unwrapProfile(profileResult.value)
    : { value: null, failed: true }
  const balance = balanceResult.status === 'fulfilled'
    ? unwrapBalance(balanceResult.value)
    : { value: null, failed: true }

  const value = {
    available: true,
    status: 'credential-stored',
    links,
    profile: profile.value,
    profileFailed: profile.failed,
    balance: balance.value,
    balanceFailed: balance.failed,
  }
  balanceCache = { at: now, value }
  return value
}

/**
 * Read the cumulative spend from the account summary used by DeepSeek's usage
 * page. This page endpoint is not part of the public API docs and may change.
 * The account credential stays in the Host and only validated currency/amount
 * pairs cross the local route.
 * @param ctx - Host context.
 * @param client - requesting-UI metadata for Platform.
 * @param force - whether to bypass the short success cache.
 * @param now - request timestamp.
 * @returns the official cumulative spend projection, or an explicit unavailable state.
 */
async function readOfficialSpend(ctx, client, force, now) {
  const unavailable = (status, error) => ({
    available: false,
    status,
    totalCosts: [],
    updatedAt: now,
    ...(error === undefined ? {} : { error }),
  })

  const service = ctx.get('deepseekAccount')
  if (service === undefined || service === null
    || typeof service.getPlatformSession !== 'function') {
    return unavailable('unavailable', 'account-service')
  }

  let platformSession
  try {
    platformSession = await service.getPlatformSession()
  } catch {
    return unavailable('unavailable', 'account-session')
  }
  if (platformSession === null || typeof platformSession !== 'object'
    || typeof platformSession.token !== 'string' || platformSession.token === '') {
    officialSpendCache = { at: 0, userId: null, value: null }
    return unavailable('signed-out', 'signed-out')
  }

  const userId = typeof platformSession.userId === 'string' && platformSession.userId !== ''
    ? platformSession.userId
    : null
  let origin
  try {
    origin = new URL(platformSession.origin).origin
  } catch {
    return unavailable('unavailable', 'unsupported-origin')
  }
  if (origin !== PLATFORM_ORIGIN) return unavailable('unavailable', 'unsupported-origin')
  if (!force && userId !== null && officialSpendCache.value !== null
    && officialSpendCache.userId === userId
    && now - officialSpendCache.at < OFFICIAL_SPEND_CACHE_MS) {
    return officialSpendCache.value
  }

  const headers = new Headers(platformSession.requestHeaders ?? undefined)
  headers.set('accept', 'application/json')
  headers.set('x-client-bundle-id', '')
  headers.set('x-client-platform', CLIENT_PLATFORM)
  headers.set('x-client-version', client.version)
  headers.set('x-client-locale', client.locale)
  headers.set('x-client-timezone-offset', String(client.timezoneOffsetSeconds))
  headers.set('x-dsh-auth-token', platformSession.token)

  let response
  try {
    response = await fetch(`${PLATFORM_ORIGIN}/api/v0/users/get_user_summary`, {
      method: 'GET',
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return unavailable('error', 'request-failed')
  }
  if (response.status === 401) {
    await response.body?.cancel().catch(() => undefined)
    return unavailable('signed-out', 'unauthorized')
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined)
    return unavailable('error', 'request-failed')
  }

  let payload
  try {
    const body = await response.text()
    if (body.length > 65_536) return unavailable('error', 'response-too-large')
    payload = JSON.parse(body)
  } catch {
    return unavailable('error', 'invalid-response')
  }

  if (payload === null || typeof payload !== 'object') {
    return unavailable('error', 'invalid-response')
  }
  if (payload.code === 40003) return unavailable('signed-out', 'unauthorized')
  const data = payload.data
  const business = data !== null && typeof data === 'object' ? data.biz_data : null
  if (payload.code !== 0 || data === null || typeof data !== 'object'
    || data.biz_code !== 0 || business === null || typeof business !== 'object'
    || !Array.isArray(business.total_costs)) {
    return unavailable('error', 'invalid-response')
  }

  const totalCosts = sanitizeOfficialCosts(business.total_costs)
  if (totalCosts === null) return unavailable('error', 'invalid-response')

  let currentSession
  try {
    currentSession = await service.getPlatformSession()
  } catch {
    return unavailable('unavailable', 'account-session')
  }
  if (currentSession === null || currentSession.token !== platformSession.token) {
    officialSpendCache = { at: 0, userId: null, value: null }
    return unavailable('unavailable', 'session-changed')
  }

  const value = {
    available: true,
    status: 'ready',
    totalCosts,
    updatedAt: now,
  }
  if (userId !== null) officialSpendCache = { at: now, userId, value }
  return value
}

/**
 * Keep only official currency/decimal pairs from Platform's total_costs list.
 * @param values - untrusted Platform summary values.
 * @returns sanitized amounts or null if the response is malformed.
 */
function sanitizeOfficialCosts(values) {
  const totals = []
  for (const item of values) {
    if (item === null || typeof item !== 'object'
      || !['CNY', 'USD'].includes(item.currency)) return null
    const amount = typeof item.amount === 'number' && Number.isFinite(item.amount)
      ? String(item.amount)
      : item.amount
    if (typeof amount !== 'string'
      || !/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(amount)
      || !Number.isFinite(Number(amount))) return null
    totals.push({ currency: item.currency, amount })
  }
  return totals
}

/**
 * Extract the account's Platform links.
 * @param state - account view, possibly absent.
 * @returns usage and top-up URLs, or null.
 */
function readLinks(state) {
  if (state === null || typeof state !== 'object') return null
  const links = state.links
  if (links === null || typeof links !== 'object') return null
  const usageUrl = typeof links.usageUrl === 'string' ? links.usageUrl : null
  const topUpUrl = typeof links.topUpUrl === 'string' ? links.topUpUrl : null
  if (usageUrl === null && topUpUrl === null) return null
  return { usageUrl, topUpUrl }
}

/**
 * Project the profile outcome onto plain JSON.
 * @param outcome - `getProfile` result.
 * @returns the profile value and whether the query failed.
 */
function unwrapProfile(outcome) {
  if (outcome === null || typeof outcome !== 'object') return { value: null, failed: false }
  if (outcome.status === 'ready' && outcome.value !== null && typeof outcome.value === 'object') {
    const profile = outcome.value
    return {
      value: {
        name: typeof profile.name === 'string' ? profile.name : null,
        contact: typeof profile.contact === 'string' ? profile.contact : null,
        avatarUrl: typeof profile.avatarUrl === 'string' ? profile.avatarUrl : null,
      },
      failed: false,
    }
  }
  return { value: null, failed: outcome.status === 'failed' }
}

/**
 * Project the balance outcome onto plain JSON.
 * @param outcome - `getBalance` result.
 * @returns wallet lists and whether the query failed.
 */
function unwrapBalance(outcome) {
  if (outcome === null || typeof outcome !== 'object') return { value: null, failed: false }
  if (outcome.status === 'ready') {
    return {
      value: {
        wallets: readWallets(outcome.value),
        bonusWallets: readWallets(outcome.bonusWallets),
      },
      failed: false,
    }
  }
  return { value: null, failed: outcome.status === 'failed' }
}

/**
 * Keep only well-formed wallet pairs; Platform's original decimal strings stay.
 * @param list - a wallet array from the account service.
 * @returns sanitized wallets.
 */
function readWallets(list) {
  if (!Array.isArray(list)) return []
  const wallets = []
  for (const wallet of list) {
    if (wallet === null || typeof wallet !== 'object') continue
    if (typeof wallet.balance !== 'string') continue
    wallets.push({
      currency: wallet.currency === 'USD' ? 'USD' : 'CNY',
      balance: wallet.balance,
    })
  }
  return wallets
}

// ---------------------------------------------------------------------------
// Token usage
// ---------------------------------------------------------------------------

/**
 * Fold recent Session logs into per-Session and aggregate token counts.
 * @param ctx - Host context.
 * @param force - whether to bypass the token cache.
 * @param now - request timestamp.
 * @returns the token projection.
 */
async function readTokens(ctx, force, now) {
  if (!force && tokenCache.value !== null && now - tokenCache.at < TOKEN_CACHE_MS) {
    return tokenCache.value
  }

  const query = ctx.get('sessionQuery')
  if (query === undefined) {
    return emptyTokenProjection(false)
  }

  let records
  try {
    records = await query.listSessions()
  } catch (error) {
    return { ...emptyTokenProjection(false), error: errorMessage(error) }
  }

  const ordered = records
    .filter((record) => record !== null && typeof record === 'object' && record.header !== undefined)
    .slice()
    .sort((left, right) => numberOrZero(right.header.createdAt) - numberOrZero(left.header.createdAt))
  const selected = ordered.slice(0, MAX_SESSIONS)
  const live = liveSessions(ctx)
  const projections = ctx.get('sessionProjections')

  const sessions = await mapLimit(selected, READ_CONCURRENCY, (record) => (
    readOneSession(query, projections, live, record)
  ))
  sessions.sort((left, right) => {
    const leftFailed = left.error !== null
    const rightFailed = right.error !== null
    if (leftFailed !== rightFailed) return leftFailed ? 1 : -1
    return numberOrZero(right.lastActivityAt ?? right.createdAt)
      - numberOrZero(left.lastActivityAt ?? left.createdAt)
  })

  const value = {
    available: true,
    sessions,
    totals: sumTotals(sessions),
    scanned: sessions.length,
    total: ordered.length,
    truncated: ordered.length > sessions.length,
  }
  tokenCache = { at: now, value }
  return value
}

/**
 * Read the live Session objects the Host currently holds.
 * @param ctx - Host context.
 * @returns a map from Session id to live Session.
 */
function liveSessions(ctx) {
  const store = ctx.get('sessions')
  if (store === undefined || typeof store.list !== 'function') return new Map()
  const sessions = new Map()
  try {
    for (const session of store.list()) sessions.set(String(session.id), session)
  } catch {
    // A store that refuses listing simply contributes no live context.
  }
  return sessions
}

/**
 * Fold one Session's complete log into a panel row.
 * @param query - session-query service.
 * @param projections - optional projection registry for context pressure.
 * @param live - live Session map.
 * @param record - corpus record from `listSessions`.
 * @returns one session row; read failures stay on the row.
 */
async function readOneSession(query, projections, live, record) {
  const id = String(record.header.id)
  const base = {
    id,
    title: null,
    live: record.live === true,
    subagent: record.header.parentSession !== undefined,
    model: null,
    createdAt: typeof record.header.createdAt === 'number' ? record.header.createdAt : null,
    lastActivityAt: null,
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    contextTokens: null,
    contextWindow: null,
    contextApprox: true,
    error: null,
  }

  let snapshot
  try {
    snapshot = await query.readSession(record.header.id)
  } catch {
    return { ...base, error: 'read-failed' }
  }

  const inherited = typeof snapshot.inheritedEventCount === 'number'
    && snapshot.inheritedEventCount > 0
    ? snapshot.inheritedEventCount
    : 0
  const result = { ...base, ...foldEvents(snapshot.events, inherited) }
  const session = live.get(id)
  if (session !== undefined && projections !== undefined) {
    try {
      const cut = projections.snapshot(session, ['contextPressure'])
      const pressure = cut !== undefined && cut.values !== undefined
        ? cut.values.contextPressure
        : undefined
      if (pressure !== null && typeof pressure === 'object') {
        if (typeof pressure.contextWindow === 'number' && pressure.contextWindow > 0) {
          result.contextWindow = pressure.contextWindow
        }
        if (typeof pressure.pressureTokens === 'number') {
          result.contextTokens = pressure.pressureTokens
          result.contextApprox = false
        }
      }
    } catch {
      // Context pressure is an enhancement; the folded log stays authoritative.
    }
  }
  return result
}

/**
 * Fold one Session's own events into usage counters and an estimated cost.
 * Inherited fork history is skipped for billing counters because the parent
 * already paid for it; metadata still reads the whole log.
 * @param events - complete committed event log.
 * @param inheritedCount - leading events copied from the parent Session.
 * @returns folded counters; `contextTokens` is the newest provider prompt size.
 */
function foldEvents(events, inheritedCount = 0) {
  const folded = {
    title: null,
    model: null,
    lastActivityAt: null,
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    cost: 0,
    contextTokens: null,
    contextWindow: null,
  }
  if (!Array.isArray(events)) return folded

  let lastPrompt = null
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]
    if (event === null || typeof event !== 'object') continue

    if (typeof event.time === 'number') {
      folded.lastActivityAt = folded.lastActivityAt === null
        ? event.time
        : Math.max(folded.lastActivityAt, event.time)
    }

    const data = event.data
    if (data === null || typeof data !== 'object') continue

    if (event.type === 'session/title') {
      if (typeof data.title === 'string') folded.title = data.title
      continue
    }
    if (event.type === 'request/context') {
      if (typeof data.model === 'string' && data.model !== '') folded.model = data.model
      if (typeof data.contextWindow === 'number' && data.contextWindow > 0) {
        folded.contextWindow = data.contextWindow
      }
      continue
    }
    if (event.type !== 'assistant/message') continue

    const message = data.message
    if (message !== null && typeof message === 'object'
      && message.source !== null && typeof message.source === 'object'
      && typeof message.source.model === 'string') {
      folded.model = message.source.model
    }
    if (index < inheritedCount) continue

    const usage = data.usage
    if (usage !== null && typeof usage === 'object') {
      folded.calls += 1
      folded.inputTokens += numberOrZero(usage.inputTokens)
      folded.outputTokens += numberOrZero(usage.outputTokens)
      folded.cacheReadTokens += numberOrZero(usage.cacheReadTokens)
      folded.cacheWriteTokens += numberOrZero(usage.cacheWriteTokens)
      folded.reasoningTokens += numberOrZero(usage.reasoningTokens)
      const prompt = numberOrZero(usage.inputTokens)
        + numberOrZero(usage.cacheReadTokens)
        + numberOrZero(usage.cacheWriteTokens)
      if (prompt > 0) lastPrompt = prompt
      const billedModel = message !== null && typeof message === 'object'
        && message.source !== null && typeof message.source === 'object'
        && typeof message.source.model === 'string'
        ? message.source.model
        : folded.model
      folded.cost += callCost(usage, billedModel, event.time)
    }
  }

  folded.cost = roundCost(folded.cost)
  folded.contextTokens = lastPrompt
  return folded
}

/**
 * Sum the token counter fields of every scanned Session.
 * @param sessions - panel rows.
 * @returns aggregate counters.
 */
function sumTotals(sessions) {
  const totals = emptyTotals()
  for (const session of sessions) {
    totals.calls += numberOrZero(session.calls)
    totals.inputTokens += numberOrZero(session.inputTokens)
    totals.outputTokens += numberOrZero(session.outputTokens)
    totals.cacheReadTokens += numberOrZero(session.cacheReadTokens)
    totals.cacheWriteTokens += numberOrZero(session.cacheWriteTokens)
    totals.reasoningTokens += numberOrZero(session.reasoningTokens)
    totals.cost += numberOrZero(session.cost)
  }
  totals.totalTokens = totals.inputTokens
    + totals.cacheWriteTokens
    + totals.cacheReadTokens
    + totals.outputTokens
  totals.uncachedInputTokens = totals.inputTokens + totals.cacheWriteTokens
  totals.cost = roundCost(totals.cost)
  return totals
}

/**
 * The zero value for aggregate counters.
 * @returns a fresh totals object.
 */
function emptyTotals() {
  return {
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    totalTokens: 0,
    uncachedInputTokens: 0,
    cost: 0,
  }
}

/**
 * The projection returned when no Session source is mounted.
 * @param available - whether the token source exists.
 * @returns an empty token projection.
 */
function emptyTokenProjection(available) {
  return {
    available,
    sessions: [],
    totals: emptyTotals(),
    scanned: 0,
    total: 0,
    truncated: false,
  }
}

/**
 * Fold every stored Session into one cumulative estimated spend.
 * @param ctx - Host context.
 * @param force - whether to bypass the cumulative cache.
 * @param now - request timestamp.
 * @returns the cumulative projection.
 */
async function readCumulative(ctx, force, now) {
  if (!force && cumulativeCache.value !== null && now - cumulativeCache.at < CUMULATIVE_CACHE_MS) {
    return cumulativeCache.value
  }

  const query = ctx.get('sessionQuery')
  if (query === undefined) {
    return {
      available: false,
      currency: 'CNY',
      cost: 0,
      sessions: 0,
      failedSessions: 0,
      totalSessions: 0,
      truncated: false,
    }
  }

  let records
  try {
    records = await query.listSessions()
  } catch (error) {
    return {
      available: false,
      currency: 'CNY',
      cost: 0,
      sessions: 0,
      failedSessions: 0,
      totalSessions: 0,
      truncated: false,
      error: errorMessage(error),
    }
  }

  const ordered = records
    .filter((record) => record !== null && typeof record === 'object' && record.header !== undefined)
    .slice()
    .sort((left, right) => numberOrZero(right.header.createdAt) - numberOrZero(left.header.createdAt))
  const selected = ordered.slice(0, MAX_CUMULATIVE_SESSIONS)
  const folded = await mapLimit(selected, READ_CONCURRENCY + 2, async (record) => {
    try {
      const snapshot = await query.readSession(record.header.id)
      const inherited = typeof snapshot.inheritedEventCount === 'number'
        && snapshot.inheritedEventCount > 0
        ? snapshot.inheritedEventCount
        : 0
      return foldEvents(snapshot.events, inherited)
    } catch {
      return null
    }
  })

  const value = {
    available: true,
    currency: 'CNY',
    cost: 0,
    calls: 0,
    inputTokens: 0,
    cachedTokens: 0,
    outputTokens: 0,
    sessions: 0,
    failedSessions: 0,
    totalSessions: ordered.length,
    truncated: ordered.length > selected.length,
    pricing: {
      source: PRICING_SOURCE,
      currency: 'CNY',
      peakAware: true,
      holidayAware: false,
    },
  }
  for (const row of folded) {
    if (row === null) {
      value.failedSessions += 1
      continue
    }
    value.sessions += 1
    value.calls += row.calls
    value.inputTokens += row.inputTokens
    value.cachedTokens += row.cacheReadTokens
    value.outputTokens += row.outputTokens
    value.cost += row.cost
  }
  value.cost = roundCost(value.cost)
  cumulativeCache = { at: now, value }
  return value
}

/**
 * Resolve the official per-million-token prices for one model id.
 * @param model - provider model id.
 * @returns the matching price rows.
 */
function pricingFor(model) {
  return typeof model === 'string' && model.toLowerCase().includes('v4-pro')
    ? PRICES.pro
    : PRICES.flash
}

/**
 * Whether one instant falls in a DeepSeek peak window (Beijing time, weekdays).
 * Chinese statutory holidays are not modeled and price as peak weekdays.
 * @param time - epoch milliseconds.
 * @returns whether peak pricing applies.
 */
function isPeakBeijing(time) {
  if (typeof time !== 'number' || !Number.isFinite(time)) return false
  const date = new Date(time + BEIJING_OFFSET_MS)
  const day = date.getUTCDay()
  if (day === 0 || day === 6) return false
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes()
  return (minutes >= 9 * 60 && minutes < 12 * 60) || (minutes >= 14 * 60 && minutes < 18 * 60)
}

/**
 * Estimate one call's CNY cost from its provider usage sample.
 * @param usage - token usage reported for the call.
 * @param model - model billed for the call.
 * @param time - event timestamp used for peak pricing.
 * @returns the estimated cost in CNY.
 */
function callCost(usage, model, time) {
  const cached = numberOrZero(usage.cacheReadTokens)
  const missed = numberOrZero(usage.inputTokens) + numberOrZero(usage.cacheWriteTokens)
  const output = numberOrZero(usage.outputTokens)
  const price = pricingFor(model)[isPeakBeijing(time) ? 'peak' : 'offPeak']
  return (cached * price.hit + missed * price.miss + output * price.out) / 1_000_000
}

/**
 * Keep a cost sum at six decimal places so JSON stays readable.
 * @param value - raw sum.
 * @returns the rounded sum.
 */
function roundCost(value) {
  return Math.round(value * 1_000_000) / 1_000_000
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Run an async mapper over a list with a fixed concurrency ceiling.
 * @param items - input list.
 * @param limit - maximum concurrently running mappers.
 * @param mapper - async work per item.
 * @returns results in input order.
 */
async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next
      next += 1
      if (index >= items.length) return
      results[index] = await mapper(items[index])
    }
  })
  await Promise.all(workers)
  return results
}

/**
 * Coerce a counter to a finite non-negative number.
 * @param value - untrusted counter.
 * @returns the counter or zero.
 */
function numberOrZero(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * Reduce a locale tag to the two Platform header values.
 * @param value - raw locale query parameter.
 * @returns `zh_CN` or `en_US`.
 */
function normalizeLocale(value) {
  return typeof value === 'string' && value.toLowerCase().startsWith('zh') ? 'zh_CN' : 'en_US'
}

/**
 * Coerce the browser's UTC offset to whole seconds.
 * @param value - raw offset query parameter.
 * @returns the offset in seconds, or zero.
 */
function normalizeTimezone(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0
}

/**
 * Render an unknown rejection as one line of text.
 * @param error - unknown rejection.
 * @returns a message safe for a JSON payload.
 */
function errorMessage(error) {
  if (error instanceof Error && error.message !== '') return error.message
  return String(error)
}
