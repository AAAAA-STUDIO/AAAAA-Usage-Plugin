Warning: truncated output (original token count: 34269)
Total output lines: 2883

window.__ModuleLoader__.load({
  id: 'AAAAA-Usage-Plugin',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const Codex = (function createCodexPanel(React) {
      const h = React.createElement

    /** Locale namespace owned by this plugin. */
    const NS = 'codexUsage'
    /** Panel id shared by the sidebar entry and the central page. */
    const PANEL_ID = 'codex-usage'
    /** Client polling period while the page is open. */
    const POLL_MS = 30000

    const zh = {
      'panel.title': 'Codex 用量',
      'panel.subtitle': '5 小时与每周额度、重置时间与重置券',
      'action.refresh': '刷新',
      'action.refreshing': '刷新中',
      'meta.updated': '更新于 {time}',
      'meta.never': '尚未更新',
      'meta.plan': '{plan} 计划',
      'meta.source.live': '实时接口',
      'meta.source.session': '本地会话',
      'meta.stale': '可能已过期',
      'window.primary': '5 小时窗口',
      'window.secondary': '每周窗口',
      'window.spanHours': '{n} 小时窗口',
      'window.spanDays': '{n} 天窗口',
      'window.used': '已用',
      'window.remaining': '剩余 {percent}%',
      'window.resetAt': '重置于 {time}',
      'window.resetIn': '还有 {left}',
      'window.noReset': '重置时间未知',
      'window.status.ok': '正常',
      'window.status.warn': '接近上限',
      'window.status.limit': '已达上限',
      'window.missing': '暂无数据',
      'time.daysHours': '{days} 天 {hours} 小时',
      'time.hoursMinutes': '{hours} 小时 {minutes} 分',
      'time.minutes': '{n} 分钟',
      'time.lessThanMinute': '不到 1 分钟',
      'time.soon': '即将重置',
      'details.title': '额度详情',
      'details.resetCredits': '重置券',
      'details.resetCreditsValue': '{available} 张可用 · {applicable} 张当前适用',
      'details.credits': '额外用量余额',
      'details.creditsUnlimited': '不限量',
      'details.creditsNone': '未开通',
      'details.creditsOverage': '已超出上限',
      'details.spendControl': '消费上限',
      'details.reached': '已达到',
      'details.notReached': '未达到',
      'details.plan': '套餐',
      'details.account': '账号',
      'details.unknown': '未知',
      'details.source': '数据源',
      'details.poll': '自动刷新',
      'details.pollValue': '每隔 {seconds} 秒',
      'state.loading': '正在读取 Codex 用量…',
      'state.errorTitle': '读取失败',
      'state.retry': '重试',
      'notice.fallback': '实时接口不可用，当前显示本地 Codex 会话记录：{message}',
      'notice.error': '刷新失败：{message}',
      'footer.hint': '数据来自 OpenAI 用量接口；页面打开时每 30 秒自动刷新。',
    }

    const en = {
      'panel.title': 'Codex usage',
      'panel.subtitle': 'Five-hour and weekly limits, reset times, and reset credits',
      'action.refresh': 'Refresh',
      'action.refreshing': 'Refreshing',
      'meta.updated': 'Updated {time}',
      'meta.never': 'Not updated yet',
      'meta.plan': '{plan} plan',
      'meta.source.live': 'Live API',
      'meta.source.session': 'Local session',
      'meta.stale': 'May be stale',
      'window.primary': 'Five-hour window',
      'window.secondary': 'Weekly window',
      'window.spanHours': '{n}-hour window',
      'window.spanDays': '{n}-day window',
      'window.used': 'used',
      'window.remaining': '{percent}% left',
      'window.resetAt': 'Resets {time}',
      'window.resetIn': '{left} to go',
      'window.noReset': 'Reset time unknown',
      'window.status.ok': 'Healthy',
      'window.status.warn': 'Near limit',
      'window.status.limit': 'Limit reached',
      'window.missing': 'No data',
      'time.daysHours': '{days}d {hours}h',
      'time.hoursMinutes': '{hours}h {minutes}m',
      'time.minutes': '{n}m',
      'time.lessThanMinute': 'under a minute',
      'time.soon': 'Resetting now',
      'details.title': 'Limit details',
      'details.resetCredits': 'Reset credits',
      'details.resetCreditsValue': '{available} available · {applicable} applicable now',
      'details.credits': 'Extra usage balance',
      'details.creditsUnlimited': 'Unlimited',
      'details.creditsNone': 'Not enabled',
      'details.creditsOverage': 'Overage limit reached',
      'details.spendControl': 'Spend control',
      'details.reached': 'Reached',
      'details.notReached': 'Not reached',
      'details.plan': 'Plan',
      'details.account': 'Account',
      'details.unknown': 'Unknown',
      'details.source': 'Data source',
      'details.poll': 'Auto refresh',
      'details.pollValue': 'Every {seconds}s',
      'state.loading': 'Reading Codex usage…',
      'state.errorTitle': 'Could not read usage',
      'state.retry': 'Retry',
      'notice.fallback': 'Live endpoint unavailable; showing the newest local Codex session record: {message}',
      'notice.error': 'Refresh failed: {message}',
      'footer.hint': 'Read from the OpenAI usage endpoint; refreshes every 30 seconds while this page is open.',
    }

    const CSS = `
.cu-page{display:flex;width:100%;height:100%;min-height:0;min-width:0;overflow:hidden;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6}
.cu-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable}
.cu-content{max-width:960px;margin:0 auto;padding:0 24px 48px}
.cu-heading{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;padding-top:28px;margin-bottom:16px}
[data-platform=darwin] .cu-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.cu-heading h1{margin:0;font-size:20px;font-weight:500;line-height:28px}
.cu-sub{margin:2px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.cu-heading-actions{display:flex;align-items:center;gap:10px;flex:none}
.cu-toolbar{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:10px;padding-top:20px;margin-bottom:12px}
.cu-updated{color:var(--dsw-alias-label-secondary);font-size:12px;font-variant-numeric:tabular-nums}
.cu-button{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 14px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;transition:background .15s,border-color .15s}
.cu-button:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.cu-button:disabled{cursor:default;color:var(--dsw-alias-label-secondary)}
.cu-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.cu-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:20px}
.cu-chip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cu-chip-strong{color:var(--dsw-alias-label-primary)}
.cu-chip-warn{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
.cu-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary);flex:none}
.cu-dot-warn{background:var(--dsw-alias-state-warn-primary)}
.cu-dot-error{background:var(--dsw-alias-state-error-primary)}
.cu-notice{display:flex;gap:8px;align-items:flex-start;margin:0 0 16px;padding:10px 14px;border-radius:10px;border-left:2px solid var(--dsw-alias-state-warn-primary);background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px}
.cu-notice-error{border-left-color:var(--dsw-alias-state-error-primary)}
.cu-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:16px}
.cu-card{border:.5px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);padding:18px 20px 16px;min-width:0}
.cu-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
.cu-card-title{margin:0;font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary);line-height:20px}
.cu-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:18px;padding:1px 9px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.cu-status-ok{color:var(--dsw-alias-state-success-primary)}
.cu-status-warn{color:var(--dsw-alias-state-warn-primary)}
.cu-status-limit{color:var(--dsw-alias-state-error-primary)}
.cu-figure{display:flex;align-items:baseline;gap:8px;margin:2px 0 0}
.cu-percent{font-size:40px;line-height:46px;font-weight:500;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.cu-percent-unit{font-size:14px;color:var(--dsw-alias-label-secondary)}
.cu-figure-meta{margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:12px;font-variant-numeric:tabular-nums}
.cu-meter{position:relative;height:8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;margin:12px 0 12px}
.cu-meter-fill{position:absolute;inset:0 auto 0 0;border-radius:999px;background:var(--dsw-alias-brand-primary);transition:width .45s ease}
.cu-meter-fill-warn{background:var(--dsw-alias-state-warn-primary)}
.cu-meter-fill-limit{background:var(--dsw-alias-state-error-primary)}
.cu-reset{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.cu-reset strong{color:var(--dsw-alias-label-primary);font-weight:500;font-variant-numeric:tabular-nums}
.cu-reset-left{margin-left:auto;font-variant-numeric:tabular-nums}
.cu-details{margin-bottom:16px}
.cu-rows{margin:0;display:flex;flex-direction:column}
.cu-row{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:.5px solid var(--dsw-alias-border-l1);font-size:13px;line-height:20px}
.cu-row:last-child{border-bottom:0;padding-bottom:0}
.cu-row dt{margin:0;color:var(--dsw-alias-label-secondary);flex:none}
.cu-row dd{margin:0;text-align:right;min-width:0;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
.cu-footer{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.cu-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:72px 16px;color:var(--dsw-alias-label-secondary)}
.cu-empty h2{margin:0;font-size:15px;font-weight:500;color:var(--dsw-alias-label-primary)}
.cu-empty p{margin:0;max-width:52ch;font-size:13px;line-height:20px;overflow-wrap:anywhere}
.cu-empty .cu-button{margin-top:6px}
.cu-spinner{width:18px;height:18px;border-radius:50%;border:2px solid var(--dsw-alias-bg-layer-2);border-top-color:var(--dsw-alias-brand-primary);animation:cu-spin .9s linear infinite}
@keyframes cu-spin{to{transform:rotate(360deg)}}
@media (max-width:560px){.cu-percent{font-size:34px;line-height:40px}.cu-reset-left{margin-left:0;flex-basis:100%}}
@media (prefers-reduced-motion:reduce){.cu-meter-fill{transition:none}.cu-spinner{animation-duration:2s}}
`

    /**
     * Build the request path from the page's own base URL, so a mounted
     * sub-path keeps working.
     * @returns an absolute same-origin pathname for the plugin's usage route.
     */
    function apiPath() {
      const relative = 'api/dsh-codex-usage'
      if (typeof document === 'undefined') return `/${relative}`
      return new URL(relative, document.baseURI).pathname
    }

    /** `HH:MM` in the browser locale. */
    function clockOf(timestamp) {
      return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(timestamp)
    }

    /** `M/D HH:MM` for a reset outside today. */
    function dateClockOf(timestamp) {
      return new Intl.DateTimeFormat(undefined, {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(timestamp)
    }

    /** `HH:MM:SS` for the "updated at" label. */
    function secondsClockOf(timestamp) {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(timestamp)
    }

    /** Human duration built from translated parts. */
    function durationText(milliseconds, t) {
      if (!(milliseconds > 0)) return t('time.soon')
      const minutes = Math.floor(milliseconds / 60000)
      if (minutes < 1) return t('time.lessThanMinute')
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      const rest = minutes % 60
      if (days > 0) return t('time.daysHours', { days, hours })
      if (hours > 0) return t('time.hoursMinutes', { hours, minutes: rest })
      return t('time.minutes', { n: rest })
    }

    /** Window length label, e.g. "5 小时窗口". */
    function spanText(windowSeconds, t) {
      if (!Number.isFinite(windowSeconds) || windowSeconds <= 0) return ''
      if (windowSeconds >= 86400) return t('window.spanDays', { n: Math.round(windowSeconds / 86400) })
      return t('window.spanHours', { n: Math.round(windowSeconds / 3600) })
    }

    /** Severity of one window. */
    function severityOf(usedPercent) {
      if (usedPercent >= 100) return 'limit'
      if (usedPercent >= 80) return 'warn'
      return 'ok'
    }

    /** One rate-limit window card. */
    function WindowCard(props) {
      const { title, window: usage, t, now } = props
      const used = usage === null || usage === undefined ? null : usage.usedPercent
      if (used === null) {
        return h('section', { className: 'cu-card' },
          h('div', { className: 'cu-card-head' }, h('h2', { className: 'cu-card-title' }, title)),
          h('div', { className: 'cu-empty' }, h('p', null, t('window.missing'))))
      }
      const severity = severityOf(used)
      const width = Math.max(0, Math.min(100, used))
      const remaining = Math.max(0, 100 - used)
      const percent = Math.round(used)
      const resetIn = usage.resetAtMs === null ? null : usage.resetAtMs - now
      const resetLabel = usage.resetAtMs === null
        ? t('window.noReset')
        : t('window.resetAt', {
          time: new Date(usage.resetAtMs).toDateString() === new Date(now).toDateString()
            ? clockOf(usage.resetAtMs)
            : dateClockOf(usage.resetAtMs),
        })
      const meterClass = severity === 'limit'
        ? 'cu-meter-fill cu-meter-fill-limit'
        : severity === 'warn'
          ? 'cu-meter-fill cu-meter-fill-warn'
          : 'cu-meter-fill'
      return h('section', { className: 'cu-card' },
        h('div', { className: 'cu-card-head' },
          h('h2', { className: 'cu-card-title' }, title),
          h('span', { className: `cu-status cu-status-${severity}` },
            h('span', { className: `cu-dot${severity === 'ok' ? '' : severity === 'warn' ? ' cu-dot-warn' : ' cu-dot-error'}` }),
            t(`window.status.${severity}`))),
        h('div', { className: 'cu-figure' },
          h('span', { className: 'cu-percent' }, percent),
          h('span', { className: 'cu-percent-unit' }, '%'),
          h('span', { className: 'cu-figure-meta' }, t('window.remaining', { percent: Math.round(remaining) }))),
        h('div', {
          className: 'cu-meter',
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': percent,
          'aria-label': title,
        }, h('div', { className: meterClass, style: { width: `${width}%` } })),
        h('div', { className: 'cu-reset' },
          h('span', null, resetLabel),
          resetIn === null
            ? null
            : h('span', { className: 'cu-reset-left' }, t('window.resetIn', { left: durationText(resetIn, t) }))))
    }

    /** One label/value row of the details card. */
    function Row(props) {
      return h('div', { className: 'cu-row' },
        h('dt', null, props.label),
        h('dd', null, props.value))
    }

    /** The central Codex usage page. */
    function CodexUsagePage(props) {
      const t = props.codexT ?? props.t
      const [state, setState] = React.useState({ status: 'loading', data: null, error: null })
      const [now, setNow] = React.useState(() => Date.now())
      const [busy, setBusy] = React.useState(false)

      const load = React.useCallback(async (force) => {
        if (force) setBusy(true)
        try {
          const query = force ? '?force=1' : ''
          const response = await fetch(`${apiPath()}${query}`, { cache: 'no-store', credentials: 'same-origin' })
          const body = await response.json().catch(() => null)
          if (body !== null && body.ok === true) {
            setState({ status: 'ready', data: body.data, error: null })
          } else {
            const message = body !== null && typeof body.error === 'string' ? body.error : `HTTP ${response.status}`
            setState((previous) => ({ status: previous.data === null ? 'error' : 'ready', data: previous.data, error: message }))
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          setState((previous) => ({ status: previous.data === null ? 'error' : 'ready', data: previous.data, error: message }))
        } finally {
          if (force) setBusy(false)
        }
      }, [])

      React.useEffect(() => {
        let cancelled = false
        const tick = async () => {
          await load(false)
          if (cancelled) return
        }
        void tick()
        const timer = setInterval(() => { void tick() }, POLL_MS)
        return () => {
          cancelled = true
          clearInterval(timer)
        }
      }, [load])

      React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
      }, [])

      const data = state.data
      const error = state.error

      let body
      if (data === null && state.status === 'loading') {
        body = h('div', { className: 'cu-empty' },
          h('div', { className: 'cu-spinner', 'aria-hidden': true }),
          h('p', null, t('state.loading')))
      } else if (data === null) {
        body = h('div', { className: 'cu-empty' },
          h('h2', null, t('state.errorTitle')),
          h('p', null, error ?? t('details.unknown')),
          h('button', { type: 'button', className: 'cu-button', onClick: () => { void load(true) }, disabled: busy },
            t('state.retry')))
      } else {
        const plan = data.account?.planType
        const email = data.account?.email
        const chips = []
        if (typeof plan === 'string' && plan !== '') {
          chips.push(h('span', { key: 'plan', className: 'cu-chip cu-chip-strong' }, t('meta.plan', { plan: plan.charAt(0).toUpperCase() + plan.slice(1) })))
        }
        if (typeof email === 'string' && email !== '') {
          chips.push(h('span', { key: 'account', className: 'cu-chip' }, email))
        }
        chips.push(h('span', { key: 'source', className: 'cu-chip' },
          h('span', { className: `cu-dot${data.source === 'live' ? '' : ' cu-dot-warn'}` }),
          data.source === 'live' ? t('meta.source.live') : t('meta.source.session')))
        if (data.stale === true) {
          chips.push(h('span', { key: 'stale', className: 'cu-chip cu-chip-warn' }, t('meta.stale')))
        }

        const creditsValue = data.credits?.unlimited === true
          ? t('details.creditsUnlimited')
          : typeof data.credits?.balance === 'string' && data.credits.balance !== ''
            ? data.credits.balance
            : data.credits?.overageLimitReached === true
              ? t('details.creditsOverage')
              : t('details.creditsNone')

        body = h(React.Fragment, null,
          h('div', { className: 'cu-chips' }, chips),
          error === null
            ? null
            : h('div', {
              className: `cu-notice${data.source === 'live' ? ' cu-notice-error' : ''}`,
              role: 'status',
            }, h('span', null, data.source === 'live'
              ? t('notice.error', { message: error })
              : t('notice.fallback', { message: error }))),
          h('div', { className: 'cu-grid' },
            h(WindowCard, { title: t('window.primary'), window: data.windows?.primary ?? null, t, now }),
            h(WindowCard, { title: t('window.secondary'), window: data.windows?.secondary ?? null, t, now })),
          h('section', { className: 'cu-card cu-details' },
            h('div', { className: 'cu-card-head' }, h('h2', { className: 'cu-card-title' }, t('details.title'))),
            h('dl', { className: 'cu-rows' },
              h(Row, {
                label: t('details.resetCredits'),
                value: t('details.resetCreditsValue', {
                  available: data.resetCredits?.available ?? 0,
                  applicable: data.resetCredits?.applicable ?? 0,
                }),
              }),
              h(Row, { label: t('details.credits'), value: creditsValue }),
              h(Row, {
                label: t('details.spendControl'),
                value: data.spendControlReached === true ? t('details.reached') : t('details.notReached'),
              }),
              h(Row, { label: t('details.plan'), value: typeof plan === 'string' && plan !== '' ? plan : t('details.unknown') }),
              h(Row, { label: t('details.account'), value: typeof email === 'string' && email !== '' ? email : t('details.unknown') }),
              h(Row, {
                label: t('details.source'),
                value: data.source === 'live' ? t('meta.source.live') : t('meta.source.session'),
              }),
              h(Row, { label: t('details.poll'), value: t('details.pollValue', { seconds: POLL_MS / 1000 }) }))),
          h('p', { className: 'cu-footer' }, t('footer.hint')))
      }

      const updated = data !== null && typeof data.updatedAt === 'number'
        ? t('meta.updated', { time: secondsClockOf(data.updatedAt) })
        : t('meta.never')

      return h('div', { className: 'cu-page' },
        h('style', null, CSS),
        h('div', { className: 'cu-scroll' },
          h('div', { className: 'cu-content' },
            h('div', { className: 'cu-toolbar' },
              h('span', { className: 'cu-updated' }, updated),
              h('button', {
                type: 'button',
                className: 'cu-button',
                onClick: () => { void load(true) },
                disabled: busy,
              }, busy ? t('action.refreshing') : t('action.refresh'))),
            body)))

    }

    /** The sidebar entry's glyph. */
    function CodexUsageIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 20
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { display: 'block' },
      },
        h('path', {
          d: 'M4.25 16.25a7.75 7.75 0 0 1 15.5 0',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M12 16.25 15.75 11.5',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('circle', { cx: 12, cy: 16.25, r: 1.4, fill: 'currentColor' }))
    }


    return { Page: CodexUsagePage, locales: { zh, en } }
    })(React)

    const Deepseek = (function createDeepseekPanel(React) {
      const h = React.createElement

    /** Locale namespace owned by this panel. */
    const NS = 'deepseek-usage'
    /** Browser-relative form of the Host route. */
    const ROUTE = 'api/dsh-deepseek-usage'
    /** Official spend has its own exact-Fetch route because query parameters are not preserved. */
    const OFFICIAL_ROUTE = 'api/dsh-deepseek-official-spend'
    /** Sidebar list id and matching main-panel key. */
    const PANEL_ID = 'deepseek-usage'

    const zh = {
      'panel.label': 'DeepSeek 用量',
      'panel.title': 'DeepSeek 用量',
      'panel.subtitle': '账户余额与本地会话的 token 消耗。',
      'action.refresh': '刷新',
      'action.usage': '用量明细',
      'action.topUp': '充值',
      'state.loading': '正在读取…',
      'state.failed': '无法读取用量数据。',
      'state.retry': '重试',
      'account.title': '账户与余额',
      'account.signedOut': '未登录',
      'account.signedOutHint': '请在「设置 → 账户」中登录后查看余额。',
      'account.unavailable': '账户服务不可用',
      'account.unnamed': 'DeepSeek 账户',
      'balance.recharge': '充值余额',
      'balance.bonus': '赠送余额',
      'balance.total': '总余额',
      'balance.failed': '余额读取失败',
      'tokens.title': 'Token 用量',
      'tokens.input': '输入',
      'tokens.cached': '缓存输入',
      'tokens.output': '输出',
      'tokens.total': '合计',
      'tokens.empty': '还没有会话。开始对话后即可看到 token 用量。',
      'tokens.truncated': '显示最近 {shown} / {total} 个会话。',
      'tokens.note': '统计来自本机会话日志，仅供参考，不作为计费依据。',
      'cost.title': '累计消费金额（官方）',
      'cost.loading': '读取官方数据…',
      'cost.failed': '官方累计消费暂不可用',
      'cost.empty': '暂无官方累计消费金额',
      'cost.signedOut': '请在 DSH 中登录 DeepSeek 账户。',
      'cost.note': '金额来自 DeepSeek 官方账户用量数据，可能有最多 5 分钟延迟；会话行费用仍为本地估算。',
      'column.session': '会话',
      'column.tokens': 'Token',
      'column.context': '上下文',
      'column.updated': '更新时间',
      'badge.live': '进行中',
      'badge.subagent': '子会话',
      'untitled': '未命名会话',
      'updated.at': '更新于 {time}',
    }

    const en = {
      'panel.label': 'DeepSeek usage',
      'panel.title': 'DeepSeek usage',
      'panel.subtitle': "Account balance and token consumption from this device's sessions.",
      'action.refresh': 'Refresh',
      'action.usage': 'Usage details',
      'action.topUp': 'Top up',
      'state.loading': 'Loading…',
      'state.failed': 'Could not load usage data.',
      'state.retry': 'Retry',
      'account.title': 'Account and balance',
      'account.signedOut': 'Not signed in',
      'account.signedOutHint': 'Sign in from Settings → Account to see your balance.',
      'account.unavailable': 'Account service unavailable',
      'account.unnamed': 'DeepSeek account',
      'balance.recharge': 'Recharge balance',
      'balance.bonus': 'Bonus',
      'balance.failed': 'Balance unavailable',
      'balance.total': 'Total balance',
      'tokens.title': 'Token usage',
      'tokens.input': 'Input',
      'tokens.cached': 'Cached input',
      'tokens.output': 'Output',
      'tokens.total': 'Total',
      'tokens.empty': 'No sessions yet. Start a conversation to see token usage.',
      'tokens.truncated': 'Showing the latest {shown} of {total} sessions.',
      'tokens.note': "Folded from this device's session logs. Informational only, not a billing record.",
      'cost.title': 'Cumulative spend (official)',
      'cost.loading': 'Reading official usage…',
      'cost.failed': 'Official cumulative spend unavailable',
      'cost.empty': 'No official cumulative spend yet',
      'cost.signedOut': 'Sign in to DeepSeek in DSH to read the official total.',
      'cost.note': "From DeepSeek's official account usage data; it may lag by up to five minutes. Per-session costs remain local estimates.",
      'column.session': 'Session',
      'column.tokens': 'Tokens',
      'column.context': 'Context',
      'column.updated': 'Updated',
      'badge.live': 'Live',
      'badge.subagent': 'Sub-session',
      'untitled': 'Untitled session',
      'updated.at': 'Updated {time}',
    }

    const ja = {
      'panel.label': 'DeepSeek 使用量',
      'panel.title': 'DeepSeek 使用量',
      'panel.subtitle': 'アカウント残高と、このデバイスのセッションにおけるトークン消費。',
      'action.refresh': '更新',
      'action.usage': '使用明細',
      'action.topUp': 'チャージ',
      'state.loading': '読み込み中…',
      'state.failed': '使用量データを取得できませんでした。',
      'state.retry': '再試行',
      'account.title': 'アカウントと残高',
      'account.signedOut': '未サインイン',
      'account.signedOutHint': '設定 → アカウントからサインインすると残高を表示できます。',
      'account.unavailable': 'アカウントサービスを利用できません',
      'account.unnamed': 'DeepSeek アカウント',
      'balance.recharge': 'チャージ残高',
      'balance.bonus': 'ボーナス',
      'balance.total': '合計残高',
      'balance.failed': '残高を取得できません',
      'tokens.title': 'トークン使用量',
      'tokens.input': '入力',
      'tokens.cached': 'キャッシュ入力',
      'tokens.output': '出力',
      'tokens.total': '合計',
      'tokens.empty': 'セッションはまだありません。会話を開始するとトークン使用量が表示されます。',
      'tokens.truncated': '最新 {shown} / {total} セッションを表示しています。',
      'tokens.note': 'このデバイスのセッションログから集計した参考値です。請求記録ではありません。',
      'cost.title': '累計消費額（公式）',
      …19269 tokens truncated…, { message: error, t, onRetry }))
      }

      const account = data.account ?? null
      const status = typeof account?.status === 'string' ? account.status : null
      const signedIn = status === 'credential-stored'
      const groups = signedIn ? groupWallets(account) : []
      const primary = groups[0] ?? null
      const tokens = data.tokens ?? null
      const totals = tokens?.totals ?? null
      const scanned = Number.isFinite(tokens?.scanned) ? tokens.scanned : 0
      const sessionCount = Number.isFinite(tokens?.total) ? tokens.total : scanned
      const truncated = tokens?.truncated === true && sessionCount > scanned
      const tokenTotal = Number.isFinite(totals?.totalTokens) ? totals.totalTokens : 0
      const uncached = Math.max(0, Number.isFinite(totals?.uncachedInputTokens)
        ? totals.uncachedInputTokens
        : (totals?.inputTokens ?? 0) - (totals?.cacheReadTokens ?? 0) - (totals?.cacheWriteTokens ?? 0))
      const cached = Math.max(0, (totals?.cacheReadTokens ?? 0) + (totals?.cacheWriteTokens ?? 0))
      const output = Math.max(0, totals?.outputTokens ?? 0)
      const composition = uncached + cached + output

      let balance
      if (!signedIn) {
        balance = h('div', { className: 'uh-muted' },
          status === 'signed-out' ? t('ds.signedOut') : status === 'unavailable' ? t('ds.unavailable') : t('ds.balanceFailed'))
      } else if (primary === null) {
        balance = h('div', { className: 'uh-muted' },
          account?.balanceFailed === true ? t('ds.balanceFailed') : '—')
      } else {
        const total = primary.recharge + primary.bonus
        const split = groups
          .map((group) => `${t('ds.recharge', { amount: moneyOf(group.recharge, group.currency) })} · ${t('ds.bonus', { amount: moneyOf(group.bonus, group.currency) })}`)
          .join('   ')
        balance = h('div', { className: 'uh-balance' },
          h('div', { className: 'uh-balance-main' },
            h('span', { className: 'uh-balance-value', title: `${exactOf(total)} ${primary.currency}` },
              moneyOf(total, primary.currency)),
            h('span', { className: 'uh-balance-label' }, t('ds.balance'))),
          h('div', { className: 'uh-split', title: split }, split))
      }

      const segments = composition > 0
        ? [
          h('span', { key: 'input', className: 'uh-seg-input', style: { width: `${(uncached / composition) * 100}%` } }),
          h('span', { key: 'cached', className: 'uh-seg-cached', style: { width: `${(cached / composition) * 100}%` } }),
          h('span', { key: 'output', className: 'uh-seg-output', style: { width: `${(output / composition) * 100}%` } }),
        ]
        : null

      const legend = [
        h('span', { key: 'input' }, h('i', { className: 'uh-key uh-key-input' }), `${t('ds.input')} ${compactOf(uncached)}`),
        h('span', { key: 'cached' }, h('i', { className: 'uh-key uh-key-cached' }), `${t('ds.cached')} ${compactOf(cached)}`),
        h('span', { key: 'output' }, h('i', { className: 'uh-key uh-key-output' }), `${t('ds.output')} ${compactOf(output)}`),
      ]

      const liveSession = Array.isArray(tokens?.sessions)
        ? tokens.sessions.find((session) => session !== null
          && typeof session === 'object'
          && session.live === true
          && Number.isFinite(session.contextWindow)
          && session.contextWindow > 0
          && Number.isFinite(session.contextTokens)) ?? null
        : null
      const context = liveSession === null
        ? null
        : h('div', { className: 'uh-context' },
          h('span', null, t('ds.context', {
            percent: Math.round(clamp((liveSession.contextTokens / liveSession.contextWindow) * 100, 0, 100)),
          })),
          h(Meter, {
            value: clamp((liveSession.contextTokens / liveSession.contextWindow) * 100, 0, 100),
            tone: 'ok',
            thin: true,
            label: t('ds.contextLabel'),
          }))

      const tokenBody = tokens !== null && tokens.available === false
        ? h('div', { className: 'uh-muted' }, t('ds.empty'))
        : tokenTotal === 0 && sessionCount === 0
          ? h('div', { className: 'uh-muted' }, t('ds.empty'))
          : h(React.Fragment, null,
            h('div', { className: 'uh-metric' },
              h('div', { className: 'uh-metric-top' },
                h('span', { className: 'uh-metric-label' }, t('ds.tokens')),
                h('span', { className: 'uh-metric-value', title: `${exactOf(tokenTotal)} tokens` }, compactOf(tokenTotal))),
              h('div', { className: 'uh-stack' }, segments),
              h('div', { className: 'uh-legend' }, legend)),
            h('div', { className: 'uh-sub' },
              h('span', null, truncated
                ? t('ds.sessionsRecent', { shown: scanned, total: sessionCount })
                : t('ds.sessions', { n: sessionCount }))),
            context)

      const notice = error === null
        ? null
        : h('p', { className: 'uh-note uh-note-error', title: error }, error)
      const accountError = signedIn === false && typeof account?.error === 'string' && account.error !== ''
        ? h('p', { className: 'uh-note', title: account.error }, account.error)
        : null
      const tokenError = typeof tokens?.error === 'string' && tokens.error !== ''
        ? h('p', { className: 'uh-note', title: tokens.error }, tokens.error)
        : null

      return h('section', { className: 'uh-sec' },
        head,
        balance,
        tokenBody,
        notice,
        accountError,
        tokenError)
    }

    /** The floating surface registered into `shell.overlay`. */
    function UsageHudContent(props) {
      const t = translatorOf(props.t)
      const [ui, setUi] = React.useState(readUiState)
      const [codex, setCodex] = React.useState(null)
      const [codexError, setCodexError] = React.useState(null)
      const [deepseek, setDeepseek] = React.useState(null)
      const [deepseekError, setDeepseekError] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [dragging, setDragging] = React.useState(false)
      const [, setTick] = React.useState(0)
      const rootRef = React.useRef(null)
      const cardRef = React.useRef(null)
      const dragRef = React.useRef(null)

      /** The positioned layer the root's left/top are measured against. */
      const layerOf = () => {
        const root = rootRef.current
        return root === null ? document.body : root.offsetParent ?? document.body
      }

      const load = React.useCallback(async (force) => {
        if (force) setBusy(true)
        try {
          const [codexResult, deepseekResult] = await Promise.allSettled([
            readCodex(force),
            readDeepseek(force),
          ])
          if (codexResult.status === 'fulfilled') {
            setCodex(codexResult.value)
            setCodexError(typeof codexResult.value.error === 'string' && codexResult.value.error !== ''
              ? codexResult.value.error
              : null)
          } else {
            setCodexError(errorText(codexResult.reason))
          }
          if (deepseekResult.status === 'fulfilled') {
            setDeepseek(deepseekResult.value)
            setDeepseekError(null)
          } else {
            setDeepseekError(errorText(deepseekResult.reason))
          }
        } finally {
          if (force) setBusy(false)
        }
      }, [])

      React.useEffect(() => {
        void load(false)
        const timer = window.setInterval(() => {
          if (document.visibilityState === 'visible') void load(false)
        }, POLL_MS)
        const onVisibility = () => {
          if (document.visibilityState === 'visible') void load(false)
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [load])

      React.useEffect(() => {
        const timer = window.setInterval(() => setTick((value) => value + 1), TICK_MS)
        return () => window.clearInterval(timer)
      }, [])

      React.useEffect(() => {
        writeUiState(ui)
      }, [ui])

      React.useLayoutEffect(() => {
        const card = cardRef.current
        if (card === null) return
        const layer = layerOf()
        const apply = () => {
          const maxX = Math.max(8, layer.clientWidth - card.offsetWidth - 8)
          const minY = topClearance()
          const maxY = Math.max(minY, layer.clientHeight - card.offsetHeight - 8)
          setUi((previous) => {
            const currentX = previous.collapsed && previous.capsuleX !== null
              ? previous.capsuleX
              : previous.x === null
              ? layer.clientWidth - card.offsetWidth - 16
              : previous.x
            const currentY = previous.collapsed && previous.capsuleY !== null
              ? previous.capsuleY
              : previous.y === null
              ? layer.clientHeight - card.offsetHeight - 16
              : previous.y
            const nextX = clamp(currentX, 8, maxX)
            const nextY = clamp(currentY, minY, maxY)
            return nextX === previous.x && nextY === previous.y
              && (!previous.collapsed
                || (previous.capsuleX === nextX && previous.capsuleY === nextY))
              ? previous
              : withUiPosition(previous, nextX, nextY)
          })
        }
        apply()
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(apply) : null
        observer?.observe(card)
        observer?.observe(layer)
        window.addEventListener('resize', apply)
        return () => {
          observer?.disconnect()
          window.removeEventListener('resize', apply)
        }
      }, [ui.collapsed])

      const beginDrag = (event, tap) => {
        if (event.button !== 0) return
        const root = rootRef.current
        const card = cardRef.current
        if (root === null || card === null) return
        const rootRect = root.getBoundingClientRect()
        const cardRect = card.getBoundingClientRect()
        const layerRect = layerOf().getBoundingClientRect()
        dragRef.current = {
          id: event.pointerId,
          dx: event.clientX - rootRect.left,
          dy: event.clientY - rootRect.top,
          baseLeft: layerRect.left,
          baseTop: layerRect.top,
          width: cardRect.width,
          height: cardRect.height,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
          tap,
        }
        if (typeof event.currentTarget.setPointerCapture === 'function') {
          event.currentTarget.setPointerCapture(event.pointerId)
        }
        setDragging(true)
        if (event.cancelable) event.preventDefault()
      }

      const moveDrag = (event) => {
        const drag = dragRef.current
        if (drag === null || drag.id !== event.pointerId) return
        if (!drag.moved) {
          if (Math.abs(event.clientX - drag.startX) < 3 && Math.abs(event.clientY - drag.startY) < 3) return
          drag.moved = true
        }
        const layer = layerOf()
        const minY = topClearance()
        const maxX = Math.max(8, layer.clientWidth - drag.width - 8)
        const maxY = Math.max(minY, layer.clientHeight - drag.height - 8)
        const x = clamp(event.clientX - drag.baseLeft - drag.dx, 8, maxX)
        const y = clamp(event.clientY - drag.baseTop - drag.dy, minY, maxY)
        setUi((previous) => {
          return previous.x === x && previous.y === y
            && (!previous.collapsed || (previous.capsuleX === x && previous.capsuleY === y))
            ? previous
            : withUiPosition(previous, x, y)
        })
      }

      const endDrag = (event) => {
        const drag = dragRef.current
        if (drag === null || drag.id !== event.pointerId) return
        dragRef.current = null
        setDragging(false)
        if (!drag.moved && typeof drag.tap === 'function') drag.tap()
      }

      const cancelDrag = () => {
        dragRef.current = null
        setDragging(false)
      }

      const now = Date.now()
      const updatedAt = Math.max(
        Number.isFinite(codex?.updatedAt) ? codex.updatedAt : 0,
        Number.isFinite(deepseek?.generatedAt) ? deepseek.generatedAt : 0,
      )
      const tone = codexError !== null && deepseekError !== null
        ? 'error'
        : codexError !== null || deepseekError !== null
          ? 'warn'
          : codex !== null && deepseek !== null
            ? 'ok'
            : 'idle'
      const position = ui.x === null || ui.y === null ? { right: 16, bottom: 16 } : { left: ui.x, top: ui.y }

      const codexPrimary = codex?.windows?.primary?.usedPercent
      const deepseekPrimacy = deepseek?.account?.status === 'credential-stored' ? groupWallets(deepseek.account)[0] : null
      const refresh = () => { void load(true) }
      const collapse = () => setUi((previous) => {
        if (previous.collapsed) return previous
        const capsuleX = previous.capsuleX ?? previous.x
        const capsuleY = previous.capsuleY ?? previous.y
        return {
          ...previous,
          x: capsuleX,
          y: capsuleY,
          capsuleX,
          capsuleY,
          collapsed: true,
        }
      })
      const expand = () => setUi((previous) => {
        if (!previous.collapsed) return previous
        return {
          ...previous,
          collapsed: false,
          x: previous.capsuleX ?? previous.x,
          y: previous.capsuleY ?? previous.y,
        }
      })

      if (ui.collapsed) {
        const primaryText = Number.isFinite(codexPrimary) ? `${percentOf(codexPrimary)}%` : '—'
        const balanceText = deepseekPrimacy === null
          ? '—'
          : moneyOf(deepseekPrimacy.recharge + deepseekPrimacy.bonus, deepseekPrimacy.currency)
        return h('div', { className: `uh-root${dragging ? ' uh-drag' : ''}`, style: position, ref: rootRef },
          h('style', null, CSS),
          h('div', {
            className: 'uh-pill',
            ref: cardRef,
            role: 'button',
            tabIndex: 0,
            title: `${t('action.expand')} · ${t('hud.drag')}`,
            'aria-label': t('action.expand'),
            onPointerDown: (event) => beginDrag(event, expand),
            onPointerMove: moveDrag,
            onPointerUp: endDrag,
            onPointerCancel: cancelDrag,
            onLostPointerCapture: cancelDrag,
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                expand()
              }
            },
          },
          h('span', { className: 'uh-dot', 'data-tone': tone, 'aria-hidden': true }),
          h('span', { className: 'uh-pill-k' }, t('pill.codex')),
          h('span', { className: 'uh-pill-v' }, primaryText),
          h('span', { className: 'uh-pill-sep', 'aria-hidden': true }),
          h('span', { className: 'uh-pill-k' }, t('pill.ds')),
          h('span', { className: 'uh-pill-v' }, balanceText),
          h('span', { className: 'uh-pill-chev', 'aria-hidden': true }, h(ExpandIcon)))
        )
      }

      const foot = h('div', { className: 'uh-foot' },
        h('span', null, updatedAt > 0 ? t('footer.updated', { time: clockSecondsOf(updatedAt) }) : t('footer.never')),
        h('span', null, t('footer.poll', { seconds: POLL_MS / 1000 })))

      return h('div', { className: `uh-root${dragging ? ' uh-drag' : ''}`, style: position, ref: rootRef },
        h('style', null, CSS),
        h('div', { className: 'uh-card', ref: cardRef },
          h('div', {
            className: 'uh-head',
            title: t('hud.drag'),
            onPointerDown: (event) => beginDrag(event, null),
            onPointerMove: moveDrag,
            onPointerUp: endDrag,
            onPointerCancel: cancelDrag,
            onLostPointerCapture: cancelDrag,
          },
          h('span', { className: 'uh-dot', 'data-tone': tone, 'aria-hidden': true }),
          h('span', { className: 'uh-title' }, t('hud.title')),
          h('div', { className: 'uh-actions' },
            h('button', {
              type: 'button',
              className: 'uh-icon',
              title: t('action.refresh'),
              'aria-label': t('action.refresh'),
              'data-busy': busy ? 'true' : 'false',
              disabled: busy,
              onPointerDown: (event) => event.stopPropagation(),
              onClick: refresh,
            }, h(RefreshIcon)),
            h('button', {
              type: 'button',
              className: 'uh-icon',
              title: t('action.collapse'),
              'aria-label': t('action.collapse'),
              onPointerDown: (event) => event.stopPropagation(),
              onClick: collapse,
            }, h(CollapseIcon)))),
          h('div', { className: 'uh-body' },
            h(CodexSection, { data: codex, error: codexError, now, t, onRetry: refresh }),
            h(DeepseekSection, { data: deepseek, error: deepseekError, t, onRetry: refresh })),
          foot))
    }


    function useHudEnabled() {
      const [enabled, setEnabled] = React.useState(() => readUiState().enabled)
      React.useEffect(() => {
        const syncFromStorage = () => setEnabled(readUiState().enabled)
        const onEnabledChange = (event) => {
          if (typeof event.detail === 'boolean') setEnabled(event.detail)
          else syncFromStorage()
        }
        const onStorage = (event) => {
          if (event.key === STORAGE_KEY) syncFromStorage()
        }
        window.addEventListener(ENABLE_EVENT, onEnabledChange)
        window.addEventListener('storage', onStorage)
        return () => {
          window.removeEventListener(ENABLE_EVENT, onEnabledChange)
          window.removeEventListener('storage', onStorage)
        }
      }, [])

      const updateEnabled = React.useCallback((next) => {
        writeUiState({ ...readUiState(), enabled: next })
        window.dispatchEvent(new CustomEvent(ENABLE_EVENT, { detail: next }))
      }, [])
      return [enabled, updateEnabled]
    }

    /** Keep the overlay slot mounted while removing its polling UI when disabled. */
    function UsageHud(props) {
      const [enabled] = useHudEnabled()
      return enabled ? h(UsageHudContent, props) : null
    }

    function HudToggle(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const [enabled, updateEnabled] = useHudEnabled()
      return h('div', { className: 'uc-hud-control' },
        h('span', { className: 'uc-hud-control-label' }, t('hud.label')),
        h('button', {
          type: 'button',
          role: 'switch',
          className: 'uc-hud-switch',
          'aria-label': t('hud.label'),
          'aria-checked': enabled,
          title: enabled ? t('hud.enabled') : t('hud.disabled'),
          onClick: () => updateEnabled(!enabled),
        },
          h('span', { className: 'uc-hud-track', 'aria-hidden': true },
            h('span', { className: 'uc-hud-knob' })),
          h('span', { className: 'uc-hud-state' }, enabled ? t('hud.enabled') : t('hud.disabled'))),
      )
    }

      return { Page: UsageHud, Toggle: HudToggle, locales: { zh, en } }
    })(React)

    const STORAGE_KEY = 'dsh-usage-center:tab'
    const TAB_IDS = { codex: 'usage-center-tab-codex', deepseek: 'usage-center-tab-deepseek' }
    const PANEL_IDS = { codex: 'usage-center-panel-codex', deepseek: 'usage-center-panel-deepseek' }

    const shellLocales = {
      zh: {
        'panel.title': 'AAAAA 用量',
        'panel.subtitle': 'Codex / DeepSeek 双标签用量页，另含悬浮窗',
        'hud.label': '用量悬浮窗',
        'hud.enabled': '已开启',
        'hud.disabled': '已关闭',
        'tab.codex': 'Codex',
        'tab.deepseek': 'DeepSeek',
      },
      en: {
        'panel.title': 'AAAAA Usage',
        'panel.subtitle': 'Codex / DeepSeek usage tabs with a floating HUD',
        'hud.label': 'Usage HUD',
        'hud.enabled': 'On',
        'hud.disabled': 'Off',
        'tab.codex': 'Codex',
        'tab.deepseek': 'DeepSeek',
      },
    }

    const SHELL_CSS = `
.uc-root{display:flex;flex-direction:column;width:100%;height:100%;min-height:0;min-width:0;overflow:hidden;box-sizing:border-box;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.5}
.uc-header{flex:none;width:100%;box-sizing:border-box;padding:20px clamp(16px,4vw,32px) 12px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
[data-platform=darwin] .uc-header{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}
.uc-header-inner{max-width:960px;margin:0 auto}
.uc-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}
.uc-title{margin:0;font-size:20px;font-weight:600;line-height:1.3;letter-spacing:-.01em}
.uc-subtitle{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.uc-hud-control{display:flex;align-items:center;gap:8px;flex:none}
.uc-hud-control-label{color:var(--dsw-alias-label-secondary);font-size:13px}
.uc-hud-switch{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:4px 10px 4px 5px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;transition:border-color .15s,background .15s}
.uc-hud-switch:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.uc-hud-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.uc-hud-track{display:flex;align-items:center;width:32px;height:18px;padding:2px;box-sizing:border-box;border-radius:999px;background:var(--dsw-alias-bg-layer-2);transition:background .15s}
.uc-hud-switch[aria-checked=true] .uc-hud-track{background:var(--dsw-alias-brand-primary)}
.uc-hud-knob{width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-bg-base);box-shadow:0 1px 2px rgba(0,0,0,.2);transform:translateX(0);transition:transform .15s}
.uc-hud-switch[aria-checked=true] .uc-hud-knob{transform:translateX(14px)}
.uc-hud-state{min-width:3em;text-align:left}
.uc-tabs{display:flex;flex-wrap:wrap;gap:4px;width:min(100%,320px);box-sizing:border-box;margin-top:14px;padding:4px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1)}
.uc-tab{flex:1 1 100px;min-width:0;min-height:36px;padding:7px 14px;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;font-weight:500;line-height:20px;cursor:pointer;overflow-wrap:anywhere;transition:background .15s,color .15s,border-color .15s}
.uc-tab:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.uc-tab[aria-selected=true]{border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.uc-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.uc-panels{position:relative;flex:1;min-height:0;min-width:0;overflow:hidden}
.uc-panel{width:100%;height:100%;min-height:0;min-width:0;overflow:hidden}
.uc-panel[hidden]{display:none!important}
.uc-toolbar{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:10px;padding-top:16px;margin-bottom:16px}
@media (max-width:420px){.uc-header{padding-left:16px;padding-right:16px}.uc-tabs{width:100%}.uc-tab{flex-basis:90px}}
@media (prefers-reduced-motion:reduce){.uc-tab{transition:none}}
`

    function readInitialTab() {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return stored === 'deepseek' ? 'deepseek' : 'codex'
      } catch {
        return 'codex'
      }
    }

    function UsageCenterIcon(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 20
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        focusable: 'false',
        style: { display: 'block' },
      },
        h('path', {
          d: 'M3.5 13a8.5 8.5 0 1 1 17 0',
          stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M12 13 16.2 8.8',
          stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round',
        }),
        h('circle', { cx: 12, cy: 13, r: 1.35, fill: 'currentColor' }),
        h('path', {
          d: 'M4.5 19.5h15',
          stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round',
        }),
        h('rect', { x: 6, y: 16.5, width: 2.5, height: 3, rx: .6, fill: 'currentColor' }),
        h('rect', { x: 10.75, y: 15, width: 2.5, height: 4.5, rx: .6, fill: 'currentColor', opacity: .8 }),
        h('rect', { x: 15.5, y: 13.5, width: 2.5, height: 6, rx: .6, fill: 'currentColor', opacity: .65 }),
      )
    }

    function UsageCenterPage(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const [activeTab, setActiveTab] = React.useState(readInitialTab)
      const tabRefs = React.useRef({})

      function selectTab(tab, focus) {
        setActiveTab(tab)
        try { window.localStorage.setItem(STORAGE_KEY, tab) } catch {}
        if (focus && tabRefs.current[tab] !== undefined) tabRefs.current[tab].focus()
      }

      function onTabKeyDown(event, current) {
        let next = null
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = current === 'codex' ? 'deepseek' : 'codex'
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = current === 'deepseek' ? 'codex' : 'deepseek'
        else if (event.key === 'Home') next = 'codex'
        else if (event.key === 'End') next = 'deepseek'
        if (next === null) return
        event.preventDefault()
        selectTab(next, true)
      }

      return h('div', { className: 'uc-root' },
        h('style', null, SHELL_CSS),
        h('header', { className: 'uc-header' },
          h('div', { className: 'uc-header-inner' },
            h('div', { className: 'uc-heading' },
              h('div', null,
                h('h1', { className: 'uc-title' }, t('panel.title')),
                h('p', { className: 'uc-subtitle' }, t('panel.subtitle')),
              ),
              h(Hud.Toggle, { t }),
            ),
            h('div', { className: 'uc-tabs', role: 'tablist', 'aria-label': t('panel.title') },
              h('button', {
                ref: (node) => { tabRefs.current.codex = node },
                type: 'button',
                className: 'uc-tab',
                role: 'tab',
                id: TAB_IDS.codex,
                'aria-selected': activeTab === 'codex',
                'aria-controls': PANEL_IDS.codex,
                tabIndex: activeTab === 'codex' ? 0 : -1,
                onClick: () => selectTab('codex', false),
                onKeyDown: (event) => onTabKeyDown(event, 'codex'),
              }, t('tab.codex')),
              h('button', {
                ref: (node) => { tabRefs.current.deepseek = node },
                type: 'button',
                className: 'uc-tab',
                role: 'tab',
                id: TAB_IDS.deepseek,
                'aria-selected': activeTab === 'deepseek',
                'aria-controls': PANEL_IDS.deepseek,
                tabIndex: activeTab === 'deepseek' ? 0 : -1,
                onClick: () => selectTab('deepseek', false),
                onKeyDown: (event) => onTabKeyDown(event, 'deepseek'),
              }, t('tab.deepseek')),
            ),
          ),
        ),
        h('div', { className: 'uc-panels' },
          h('section', {
            className: 'uc-panel',
            role: 'tabpanel',
            id: PANEL_IDS.codex,
            'aria-labelledby': TAB_IDS.codex,
            hidden: activeTab !== 'codex',
            tabIndex: 0,
          }, h(Codex.Page, { codexT: props.codexT })),
          h('section', {
            className: 'uc-panel',
            role: 'tabpanel',
            id: PANEL_IDS.deepseek,
            'aria-labelledby': TAB_IDS.deepseek,
            hidden: activeTab !== 'deepseek',
            tabIndex: 0,
          }, h(Deepseek.Page, { deepseekT: props.deepseekT })),
        ),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('usageCenter', shellLocales), 'usage-center: shell dictionaries')
        ctx.effect(() => ctx.locale.register('usageCenterCodex', Codex.locales), 'usage-center: Codex dictionaries')
        ctx.effect(() => ctx.locale.register('usageCenterDeepseek', Deepseek.locales), 'usage-center: DeepSeek dictionaries')
        ctx.effect(() => ctx.locale.register('usageHud', Hud.locales), 'usage-center: HUD dictionaries')

        const t = ctx.locale.bind('usageCenter')
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'usage',
          locale: 'usageCenter',
          inject: () => ({
            codexT: ctx.locale.bind('usageCenterCodex'),
            deepseekT: ctx.locale.bind('usageCenterDeepseek'),
          }),
        }, UsageCenterPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'usage',
          order: 20,
          locale: 'usageCenter',
          label: () => t('panel.title'),
        }, UsageCenterIcon))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'usage-hud',
          order: 50,
          locale: 'usageHud',
        }, Hud.Page))
      },
    }
  },
})
