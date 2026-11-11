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
      'cost.loading': '公式データを読み込み中…',
      'cost.failed': '公式累計消費額を取得できません',
      'cost.empty': '公式累計消費額はありません',
      'cost.signedOut': 'DSH で DeepSeek にサインインしてください。',
      'cost.note': 'DeepSeek 公式アカウントの使用量データです。最大 5 分ほど遅れる場合があります。セッションごとの費用はローカル推定です。',
      'column.session': 'セッション',
      'column.tokens': 'トークン',
      'column.context': 'コンテキスト',
      'column.updated': '更新',
      'badge.live': '実行中',
      'badge.subagent': 'サブセッション',
      'untitled': '無題のセッション',
      'updated.at': '{time} に更新',
    }

    const es = {
      'panel.label': 'Uso de DeepSeek',
      'panel.title': 'Uso de DeepSeek',
      'panel.subtitle': 'Saldo de la cuenta y consumo de tokens de las sesiones de este dispositivo.',
      'action.refresh': 'Actualizar',
      'action.usage': 'Detalle de uso',
      'action.topUp': 'Recargar',
      'state.loading': 'Cargando…',
      'state.failed': 'No se pudieron cargar los datos de uso.',
      'state.retry': 'Reintentar',
      'account.title': 'Cuenta y saldo',
      'account.signedOut': 'Sesión no iniciada',
      'account.signedOutHint': 'Inicia sesión en Ajustes → Cuenta para ver tu saldo.',
      'account.unavailable': 'Servicio de cuenta no disponible',
      'account.unnamed': 'Cuenta de DeepSeek',
      'balance.recharge': 'Saldo de recarga',
      'balance.bonus': 'Bono',
      'balance.total': 'Saldo total',
      'balance.failed': 'Saldo no disponible',
      'tokens.title': 'Uso de tokens',
      'tokens.input': 'Entrada',
      'tokens.cached': 'Entrada en caché',
      'tokens.output': 'Salida',
      'tokens.total': 'Total',
      'tokens.empty': 'Aún no hay sesiones. Inicia una conversación para ver el uso de tokens.',
      'tokens.truncated': 'Mostrando las últimas {shown} de {total} sesiones.',
      'tokens.note': 'Calculado a partir de los registros de sesión de este dispositivo. Solo informativo, no es un registro de facturación.',
      'cost.title': 'Gasto acumulado (oficial)',
      'cost.loading': 'Leyendo el uso oficial…',
      'cost.failed': 'El gasto acumulado oficial no está disponible',
      'cost.empty': 'Aún no hay gasto acumulado oficial',
      'cost.signedOut': 'Inicia sesión en DeepSeek desde DSH para leer el total oficial.',
      'cost.note': 'Procede de los datos oficiales de uso de la cuenta DeepSeek y puede retrasarse hasta cinco minutos. Los costes por sesión siguen siendo estimaciones locales.',
      'column.session': 'Sesión',
      'column.tokens': 'Tokens',
      'column.context': 'Contexto',
      'column.updated': 'Actualizado',
      'badge.live': 'En vivo',
      'badge.subagent': 'Subsesión',
      'untitled': 'Sesión sin título',
      'updated.at': 'Actualizado a las {time}',
    }

    const fr = {
      'panel.label': 'Usage DeepSeek',
      'panel.title': 'Usage DeepSeek',
      'panel.subtitle': "Solde du compte et consommation de tokens des sessions de cet appareil.",
      'action.refresh': 'Actualiser',
      'action.usage': "Détail de l'usage",
      'action.topUp': 'Recharger',
      'state.loading': 'Chargement…',
      'state.failed': "Impossible de charger les données d'usage.",
      'state.retry': 'Réessayer',
      'account.title': 'Compte et solde',
      'account.signedOut': 'Non connecté',
      'account.signedOutHint': 'Connectez-vous dans Réglages → Compte pour voir votre solde.',
      'account.unavailable': 'Service de compte indisponible',
      'account.unnamed': 'Compte DeepSeek',
      'balance.recharge': 'Solde de rechargement',
      'balance.bonus': 'Bonus',
      'balance.total': 'Solde total',
      'balance.failed': 'Solde indisponible',
      'tokens.title': 'Usage des tokens',
      'tokens.input': 'Entrée',
      'tokens.cached': 'Entrée en cache',
      'tokens.output': 'Sortie',
      'tokens.total': 'Total',
      'tokens.empty': "Aucune session pour l'instant. Lancez une conversation pour voir l'usage des tokens.",
      'tokens.truncated': 'Affichage des {shown} dernières sessions sur {total}.',
      'tokens.note': "Calculé à partir des journaux de session de cet appareil. Informatif uniquement, pas un relevé de facturation.",
      'cost.title': 'Dépense cumulée (officielle)',
      'cost.loading': 'Lecture des données officielles…',
      'cost.failed': 'Dépense cumulée officielle indisponible',
      'cost.empty': 'Aucune dépense cumulée officielle pour le moment',
      'cost.signedOut': 'Connectez-vous à DeepSeek dans DSH pour lire le total officiel.',
      'cost.note': 'Données officielles d’utilisation du compte DeepSeek, avec jusqu’à cinq minutes de retard. Les coûts par session restent des estimations locales.',
      'column.session': 'Session',
      'column.tokens': 'Tokens',
      'column.context': 'Contexte',
      'column.updated': 'Mis à jour',
      'badge.live': 'En direct',
      'badge.subagent': 'Sous-session',
      'untitled': 'Session sans titre',
      'updated.at': 'Mis à jour à {time}',
    }

    const de = {
      'panel.label': 'DeepSeek-Nutzung',
      'panel.title': 'DeepSeek-Nutzung',
      'panel.subtitle': 'Kontostand und Token-Verbrauch der Sitzungen auf diesem Gerät.',
      'action.refresh': 'Aktualisieren',
      'action.usage': 'Nutzungsdetails',
      'action.topUp': 'Aufladen',
      'state.loading': 'Wird geladen…',
      'state.failed': 'Nutzungsdaten konnten nicht geladen werden.',
      'state.retry': 'Erneut versuchen',
      'account.title': 'Konto und Guthaben',
      'account.signedOut': 'Nicht angemeldet',
      'account.signedOutHint': 'Melden Sie sich unter Einstellungen → Konto an, um Ihr Guthaben zu sehen.',
      'account.unavailable': 'Kontodienst nicht verfügbar',
      'account.unnamed': 'DeepSeek-Konto',
      'balance.recharge': 'Aufladeguthaben',
      'balance.bonus': 'Bonus',
      'balance.total': 'Gesamtguthaben',
      'balance.failed': 'Guthaben nicht verfügbar',
      'tokens.title': 'Token-Nutzung',
      'tokens.input': 'Eingabe',
      'tokens.cached': 'Zwischengespeicherte Eingabe',
      'tokens.output': 'Ausgabe',
      'tokens.total': 'Gesamt',
      'tokens.empty': 'Noch keine Sitzungen. Starten Sie eine Unterhaltung, um die Token-Nutzung zu sehen.',
      'tokens.truncated': 'Die neuesten {shown} von {total} Sitzungen werden angezeigt.',
      'tokens.note': 'Aus den Sitzungsprotokollen dieses Geräts berechnet. Nur zur Information, keine Abrechnung.',
      'cost.title': 'Kumulierte Ausgaben (offiziell)',
      'cost.loading': 'Offizielle Daten werden gelesen…',
      'cost.failed': 'Offizielle kumulierte Ausgaben nicht verfügbar',
      'cost.empty': 'Noch keine offiziellen kumulierten Ausgaben',
      'cost.signedOut': 'Melden Sie sich in DSH bei DeepSeek an, um den offiziellen Gesamtbetrag zu lesen.',
      'cost.note': 'Aus den offiziellen DeepSeek-Kontodaten; möglicherweise bis zu fünf Minuten verzögert. Kosten pro Sitzung bleiben lokale Schätzungen.',
      'column.session': 'Sitzung',
      'column.tokens': 'Tokens',
      'column.context': 'Kontext',
      'column.updated': 'Aktualisiert',
      'badge.live': 'Live',
      'badge.subagent': 'Untersitzung',
      'untitled': 'Unbenannte Sitzung',
      'updated.at': 'Aktualisiert um {time}',
    }

    const ru = {
      'panel.label': 'Использование DeepSeek',
      'panel.title': 'Использование DeepSeek',
      'panel.subtitle': 'Баланс аккаунта и расход токенов в сессиях на этом устройстве.',
      'action.refresh': 'Обновить',
      'action.usage': 'Детали использования',
      'action.topUp': 'Пополнить',
      'state.loading': 'Загрузка…',
      'state.failed': 'Не удалось загрузить данные об использовании.',
      'state.retry': 'Повторить',
      'account.title': 'Аккаунт и баланс',
      'account.signedOut': 'Вход не выполнен',
      'account.signedOutHint': 'Войдите в «Настройки → Аккаунт», чтобы увидеть баланс.',
      'account.unavailable': 'Сервис аккаунта недоступен',
      'account.unnamed': 'Аккаунт DeepSeek',
      'balance.recharge': 'Баланс пополнения',
      'balance.bonus': 'Бонус',
      'balance.total': 'Общий баланс',
      'balance.failed': 'Баланс недоступен',
      'tokens.title': 'Расход токенов',
      'tokens.input': 'Ввод',
      'tokens.cached': 'Ввод из кэша',
      'tokens.output': 'Вывод',
      'tokens.total': 'Всего',
      'tokens.empty': 'Сессий пока нет. Начните диалог, чтобы увидеть расход токенов.',
      'tokens.truncated': 'Показаны последние {shown} из {total} сессий.',
      'tokens.note': 'Рассчитано по журналам сессий этого устройства. Только для справки, не является биллинговой записью.',
      'cost.title': 'Общий расход (официальные данные)',
      'cost.loading': 'Загрузка официальных данных…',
      'cost.failed': 'Официальный общий расход недоступен',
      'cost.empty': 'Официальных данных о расходах пока нет',
      'cost.signedOut': 'Войдите в DeepSeek в DSH, чтобы получить официальный итог.',
      'cost.note': 'Данные официального аккаунта DeepSeek; задержка может составлять до пяти минут. Расход по сессиям остаётся локальной оценкой.',
      'column.session': 'Сессия',
      'column.tokens': 'Токены',
      'column.context': 'Контекст',
      'column.updated': 'Обновлено',
      'badge.live': 'Активна',
      'badge.subagent': 'Подсессия',
      'untitled': 'Сессия без названия',
      'updated.at': 'Обновлено в {time}',
    }

    const pt = {
      'panel.label': 'Uso do DeepSeek',
      'panel.title': 'Uso do DeepSeek',
      'panel.subtitle': 'Saldo da conta e consumo de tokens das sessões deste dispositivo.',
      'action.refresh': 'Atualizar',
      'action.usage': 'Detalhes de uso',
      'action.topUp': 'Recarregar',
      'state.loading': 'Carregando…',
      'state.failed': 'Não foi possível carregar os dados de uso.',
      'state.retry': 'Tentar novamente',
      'account.title': 'Conta e saldo',
      'account.signedOut': 'Não conectado',
      'account.signedOutHint': 'Entre em Configurações → Conta para ver seu saldo.',
      'account.unavailable': 'Serviço de conta indisponível',
      'account.unnamed': 'Conta DeepSeek',
      'balance.recharge': 'Saldo de recarga',
      'balance.bonus': 'Bônus',
      'balance.total': 'Saldo total',
      'balance.failed': 'Saldo indisponível',
      'tokens.title': 'Uso de tokens',
      'tokens.input': 'Entrada',
      'tokens.cached': 'Entrada em cache',
      'tokens.output': 'Saída',
      'tokens.total': 'Total',
      'tokens.empty': 'Ainda não há sessões. Inicie uma conversa para ver o uso de tokens.',
      'tokens.truncated': 'Mostrando as últimas {shown} de {total} sessões.',
      'tokens.note': 'Calculado a partir dos registros de sessão deste dispositivo. Apenas informativo, não é um registro de cobrança.',
      'cost.title': 'Gasto acumulado (oficial)',
      'cost.loading': 'Lendo dados oficiais…',
      'cost.failed': 'Gasto acumulado oficial indisponível',
      'cost.empty': 'Ainda não há gasto acumulado oficial',
      'cost.signedOut': 'Entre no DeepSeek pelo DSH para consultar o total oficial.',
      'cost.note': 'Vem dos dados oficiais de uso da conta DeepSeek e pode atrasar até cinco minutos. Os custos por sessão continuam sendo estimativas locais.',
      'column.session': 'Sessão',
      'column.tokens': 'Tokens',
      'column.context': 'Contexto',
      'column.updated': 'Atualizado',
      'badge.live': 'Ao vivo',
      'badge.subagent': 'Subsessão',
      'untitled': 'Sessão sem título',
      'updated.at': 'Atualizado às {time}',
    }

    const groupedFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
    const compactFormatter = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 })

    const CSS = `
.dsu-root{height:100%;overflow:auto;padding:24px 24px 32px;box-sizing:border-box;color:var(--dsw-alias-label-primary);background:transparent}
.dsu-inner{max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.dsu-header{display:flex;align-items:flex-start;justify-content:flex-end;gap:16px;flex-wrap:wrap}
.dsu-title{margin:0;font-size:20px;line-height:1.3;font-weight:600;letter-spacing:-.01em}
.dsu-subtitle{margin:4px 0 0;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-secondary);max-width:56ch}
.dsu-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsu-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1;cursor:pointer;text-decoration:none;white-space:nowrap}
.dsu-btn:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.dsu-btn:disabled{opacity:.6;cursor:default}
.dsu-btn svg{width:14px;height:14px;flex:none}
.dsu-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:16px}
.dsu-summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:stretch}
.dsu-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.dsu-h2{margin:0;font-size:14px;font-weight:600;line-height:1.4}
.dsu-muted{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5;margin:0}
.dsu-profile{display:flex;align-items:center;gap:10px;margin-bottom:14px;min-width:0}
.dsu-avatar{width:36px;height:36px;border-radius:50%;flex:none;object-fit:cover;background:var(--dsw-alias-bg-layer-2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1)}
.dsu-profile-name{font-size:14px;font-weight:600;line-height:1.4;word-break:break-word}
.dsu-profile-contact{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.4;word-break:break-word}
.dsu-wallets{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.dsu-wallet{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px;background:var(--dsw-alias-bg-layer-2);min-width:0}
.dsu-wallet-label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--dsw-alias-label-secondary)}
.dsu-wallet-value{margin-top:4px;font-size:20px;font-weight:600;line-height:1.25;font-variant-numeric:tabular-nums;word-break:break-word}
.dsu-wallet-currency{font-size:11px;color:var(--dsw-alias-label-secondary);font-weight:500;margin-left:4px}
.dsu-wallet-split{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:6px;font-size:11px;line-height:1.4;color:var(--dsw-alias-label-secondary)}
.dsu-wallet-split b{font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.dsu-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px}
.dsu-stat{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px;background:var(--dsw-alias-bg-layer-2);min-width:0}
.dsu-stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--dsw-alias-label-secondary)}
.dsu-stat-value{margin-top:4px;font-size:18px;font-weight:600;line-height:1.25;font-variant-numeric:tabular-nums;word-break:break-word}
.dsu-list{display:flex;flex-direction:column}
.dsu-row{display:grid;grid-template-columns:minmax(0,1fr) 96px 112px 78px;gap:10px;align-items:center;padding:9px 4px;border-top:1px solid var(--dsw-alias-border-l1);font-size:13px}
.dsu-row-head{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--dsw-alias-label-secondary);border-top:0;padding-top:0;padding-bottom:4px}
.dsu-session{min-width:0}
.dsu-session-title{display:flex;align-items:center;gap:6px;min-width:0;font-weight:500}
.dsu-session-title>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsu-session-meta{margin-top:2px;font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsu-badge{flex:none;font-size:10px;line-height:1;padding:2px 5px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);font-weight:600;letter-spacing:.02em}
.dsu-badge-live{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}
.dsu-num{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.dsu-num small{display:block;font-size:10px;color:var(--dsw-alias-label-secondary)}
.dsu-bar{display:flex;align-items:center;gap:6px;justify-content:flex-end}
.dsu-bar-track{width:52px;height:4px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;flex:none}
.dsu-bar-fill{height:100%;border-radius:999px;background:var(--dsw-alias-brand-primary)}
.dsu-bar-fill.is-warn{background:var(--dsw-alias-state-warn-primary)}
.dsu-bar-label{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;width:36px;text-align:right}
.dsu-empty{padding:18px 4px;font-size:13px;color:var(--dsw-alias-label-secondary)}
.dsu-note{margin:0;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dsu-notes{display:flex;flex-direction:column;gap:4px}
.dsu-cost{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px;margin-bottom:14px;background:var(--dsw-alias-bg-base)}
.dsu-cost-label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--dsw-alias-label-secondary)}
.dsu-cost-value{display:flex;align-items:baseline;gap:8px;font-size:20px;font-weight:600;line-height:1.25;font-variant-numeric:tabular-nums}
.dsu-cost-card .dsu-cost-value{font-size:28px;line-height:1.3;flex-wrap:wrap;overflow-wrap:anywhere}
.dsu-cost-card .dsu-cost-value.dsu-muted{font-size:13px;font-weight:400}
.dsu-balance-groups{display:flex;flex-direction:column;gap:8px}
.dsu-cost-count{font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.dsu-error{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border:1px solid var(--dsw-alias-state-error-primary);border-radius:10px;padding:10px 12px;font-size:13px}
.dsu-error-text{min-width:0;word-break:break-word}
.dsu-status{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dsu-spin{width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:dsu-spin .8s linear infinite;flex:none}
@keyframes dsu-spin{to{transform:rotate(360deg)}}
@media (max-width:640px){
.dsu-root{padding:16px}
.dsu-summary-grid{grid-template-columns:minmax(0,1fr)}
.dsu-row{grid-template-columns:minmax(0,1fr) 84px 84px}
.dsu-col-updated{display:none}
}
@media (prefers-reduced-motion:reduce){.dsu-spin{animation:none}}
`

    /**
     * Resolve a translation function even if locale injection is unavailable.
     * @param translate - component's `t` prop.
     * @returns a key-based translator.
     */
    function translatorOf(translate) {
      return typeof translate === 'function' ? translate : (key) => key
    }

    /**
     * Fill `{name}` placeholders in one localized template.
     * @param template - localized text.
     * @param values - replacement values.
     * @returns the filled text.
     */
    function fill(template, values) {
      let text = String(template)
      for (const [name, value] of Object.entries(values)) {
        text = text.replaceAll(`{${name}}`, String(value))
      }
      return text
    }

    /**
     * Format one token count for a card or a table cell.
     * @param value - count, possibly absent.
     * @returns localized text.
     */
    function count(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      if (value >= 100000) return compactFormatter.format(value)
      return groupedFormatter.format(value)
    }

    /**
     * Format a full count for a tooltip.
     * @param value - count.
     * @returns grouped text.
     */
    function exact(value) {
      return typeof value === 'number' && Number.isFinite(value) ? groupedFormatter.format(value) : '—'
    }

    /**
     * Render Platform's decimal balance string without its trailing padding.
     * @param value - original balance string.
     * @returns display text.
     */
    function amount(value) {
      const text = String(value)
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return text
      const parsed = Number(text)
      if (!Number.isFinite(parsed)) return text
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(parsed)
    }

    /**
     * Render one estimated CNY cost, keeping four decimals below one yuan.
     * @param value - estimated cost.
     * @returns display text with a yuan sign.
     */
    function costText(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      const digits = value > 0 && value < 1 ? 4 : 2
      return `¥${new Intl.NumberFormat(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value)}`
    }

    /**
     * Format the official cumulative amount to the two decimals shown by Platform.
     * @param value - official decimal amount.
     * @param currency - official currency code.
     * @returns a currency symbol and amount.
     */
    function officialCostText(value, currency) {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) return '—'
      const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parsed)
      return `${currencySymbol(currency)}${formatted}`
    }

    /**
     * The symbol shown before a wallet amount.
     * @param currency - wallet currency.
     * @returns the symbol.
     */
    function currencySymbol(currency) {
      if (currency === 'USD') return '$'
      if (currency === 'CNY') return '¥'
      return ''
    }

    /**
     * Format a timestamp as a local clock time or date.
     * @param value - epoch milliseconds.
     * @returns display text or an em dash.
     */
    function clock(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      const date = new Date(value)
      const now = new Date()
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    /**
     * The context-usage percentage for one session row.
     * @param row - session row from the Host.
     * @returns an integer percentage, or null when unknown.
     */
    function contextPercent(row) {
      if (typeof row.contextTokens !== 'number' || typeof row.contextWindow !== 'number') return null
      if (row.contextWindow <= 0) return null
      return Math.max(0, Math.min(100, Math.round((row.contextTokens / row.contextWindow) * 100)))
    }

    /**
     * A session row's combined billed token count.
     * @param row - session row.
     * @returns input plus output tokens.
     */
    function sessionTotal(row) {
      const input = typeof row.inputTokens === 'number' ? row.inputTokens : 0
      const cached = typeof row.cacheReadTokens === 'number' ? row.cacheReadTokens : 0
      const written = typeof row.cacheWriteTokens === 'number' ? row.cacheWriteTokens : 0
      const output = typeof row.outputTokens === 'number' ? row.outputTokens : 0
      return input + cached + written + output
    }

    /**
     * The browser's preferred locale for Platform client metadata.
     * @returns a locale tag.
     */
    function preferredLocale() {
      const documentLocale = typeof document !== 'undefined'
        ? document.documentElement.getAttribute('lang')
        : null
      if (typeof documentLocale === 'string' && documentLocale !== '') return documentLocale
      return typeof navigator !== 'undefined' && typeof navigator.language === 'string'
        ? navigator.language
        : 'en'
    }

    function refreshIcon() {
      return h('svg', { viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M13 6.5A5.25 5.25 0 1 0 13.2 9.6',
          stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M13 2.8v3.9H9.1',
          stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
        }),
      )
    }

    function externalIcon() {
      return h('svg', { viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M9.5 3h3.5v3.5M12.8 3.2 7.4 8.6',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M12 9.6v2.15A1.25 1.25 0 0 1 10.75 13h-6.5A1.25 1.25 0 0 1 3 11.75v-6.5A1.25 1.25 0 0 1 4.25 4H6.4',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round',
        }),
      )
    }

    /**
     * The sidebar cell: one 16px mark that follows the host's color.
     * @param props - owner icon props.
     * @returns the icon element.
     */
    function PanelIcon(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 16
      const active = props.active === true
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': true,
        focusable: 'false',
        style: { display: 'block' },
      },
      h('rect', {
        x: 1.75, y: 3.4, width: 12.5, height: 9.2, rx: 2.4,
        stroke: 'currentColor', strokeWidth: active ? 1.6 : 1.4,
        opacity: active ? 1 : 0.9,
      }),
      h('path', {
        d: 'M1.9 6.2h12.2',
        stroke: 'currentColor', strokeWidth: 1.3, opacity: 0.75,
      }),
      h('circle', {
        cx: 11.1, cy: 8.9, r: 1.05,
        fill: 'currentColor', opacity: active ? 1 : 0.8,
      }),
      )
    }

    /**
     * The DeepSeek usage page in the main column.
     * @param props - locale `t` and standard slot props.
     * @returns the panel element.
     */
    function UsagePanel(props) {
      const t = translatorOf(props.deepseekT ?? props.t)
      const [version, setVersion] = React.useState(0)
      const forceRef = React.useRef(false)
      const [state, setState] = React.useState({ status: 'loading', data: null, error: null })
      const [officialSpend, setOfficialSpend] = React.useState({ status: 'loading', data: null, error: null })

      React.useEffect(() => {
        const controller = new AbortController()
        let alive = true
        const force = forceRef.current
        setState((previous) => ({
          status: previous.data === null ? 'loading' : 'refreshing',
          data: previous.data,
          error: null,
        }))
        fetch(ROUTE, {
          signal: controller.signal,
          credentials: 'same-origin',
          headers: {
            accept: 'application/json',
            'x-dsh-usage-locale': preferredLocale(),
            'x-dsh-usage-timezone-offset': String(-new Date().getTimezoneOffset() * 60),
            'x-dsh-usage-refresh': force ? '1' : '0',
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
          })
          .then((data) => {
            if (!alive) return
            if (data !== null && typeof data === 'object' && typeof data.error === 'string') {
              throw new Error(data.error)
            }
            setState({ status: 'ready', data, error: null })
          })
          .catch((error) => {
            if (!alive || (error !== null && typeof error === 'object' && error.name === 'AbortError')) return
            setState((previous) => ({
              status: previous.data === null ? 'error' : 'ready',
              data: previous.data,
              error: error instanceof Error ? error.message : String(error),
            }))
          })
        return () => {
          alive = false
          controller.abort()
        }
      }, [version])

      React.useEffect(() => {
        const controller = new AbortController()
        let alive = true
        setOfficialSpend((previous) => ({
          status: previous.data === null ? 'loading' : 'refreshing',
          data: previous.data,
          error: null,
        }))
        fetch(OFFICIAL_ROUTE, {
          signal: controller.signal,
          credentials: 'same-origin',
          headers: {
            accept: 'application/json',
            'x-dsh-usage-locale': preferredLocale(),
            'x-dsh-usage-timezone-offset': String(-new Date().getTimezoneOffset() * 60),
            'x-dsh-usage-refresh': forceRef.current ? '1' : '0',
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
          })
          .then((payload) => {
            if (!alive) return
            if (payload !== null && typeof payload === 'object' && typeof payload.error === 'string') {
              throw new Error(payload.error)
            }
            const value = payload !== null && typeof payload === 'object' ? payload.officialSpend : null
            if (value === null || typeof value !== 'object') throw new Error('malformed official spend payload')
            setOfficialSpend({ status: 'ready', data: value, error: null })
          })
          .catch((error) => {
            if (!alive || (error !== null && typeof error === 'object' && error.name === 'AbortError')) return
            setOfficialSpend((previous) => ({
              status: previous.data === null ? 'error' : 'ready',
              data: previous.data,
              error: error instanceof Error ? error.message : String(error),
            }))
          })
        return () => {
          alive = false
          controller.abort()
        }
      }, [version])

      React.useEffect(() => {
        const timer = window.setInterval(() => {
          if (document.visibilityState !== 'visible') return
          forceRef.current = false
          setVersion((value) => value + 1)
        }, 60_000)
        return () => window.clearInterval(timer)
      }, [])

      const refreshing = state.status === 'loading' || state.status === 'refreshing'
      const data = state.data
      const account = data !== null && data !== undefined && typeof data === 'object'
        ? data.account
        : null
      const tokens = data !== null && data !== undefined && typeof data === 'object'
        ? data.tokens
        : null

      function refresh() {
        forceRef.current = true
        setVersion((value) => value + 1)
      }

      function errorBanner(message) {
        return h('div', { className: 'dsu-error', role: 'alert' },
          h('span', { className: 'dsu-error-text' }, `${t('state.failed')} ${message}`),
          h('button', { type: 'button', className: 'dsu-btn', onClick: refresh }, t('state.retry')),
        )
      }

      function accountLinks(links) {
        if (links === null || typeof links !== 'object') return null
        const items = []
        if (typeof links.usageUrl === 'string' && links.usageUrl !== '') {
          items.push(h('a', {
            key: 'usage',
            className: 'dsu-btn',
            href: links.usageUrl,
            target: '_blank',
            rel: 'noreferrer',
          }, externalIcon(), t('action.usage')))
        }
        if (typeof links.topUpUrl === 'string' && links.topUpUrl !== '') {
          items.push(h('a', {
            key: 'topup',
            className: 'dsu-btn',
            href: links.topUpUrl,
            target: '_blank',
            rel: 'noreferrer',
          }, externalIcon(), t('action.topUp')))
        }
        if (items.length === 0) return null
        return h('div', { className: 'dsu-actions' }, items)
      }

      function numeric(value) {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
      }

      function groupedWallets(wallets, bonusWallets) {
        const groups = new Map()
        const ensure = (currency) => {
          const key = currency === 'USD' ? 'USD' : 'CNY'
          let group = groups.get(key)
          if (group === undefined) {
            group = { currency: key, recharge: 0, bonus: 0 }
            groups.set(key, group)
          }
          return group
        }
        for (const wallet of wallets) {
          if (wallet === null || typeof wallet !== 'object') continue
          ensure(wallet.currency).recharge += numeric(wallet.balance)
        }
        for (const wallet of bonusWallets) {
          if (wallet === null || typeof wallet !== 'object') continue
          ensure(wallet.currency).bonus += numeric(wallet.balance)
        }
        const ordered = []
        for (const currency of ['CNY', 'USD']) {
          const group = groups.get(currency)
          if (group !== undefined) ordered.push(group)
        }
        return ordered
      }

      function money(currency, value) {
        return `${currencySymbol(currency)}${amount(String(value))}`
      }

      function walletCard(group) {
        const total = group.recharge + group.bonus
        return h('div', { className: 'dsu-balance-group', key: group.currency },
          h('div', { className: 'dsu-cost-value' },
            h('span', null, money(group.currency, total)),
            h('span', { className: 'dsu-wallet-currency' }, group.currency),
          ),
          h('div', { className: 'dsu-wallet-split' },
            h('span', null, `${t('balance.recharge')} `, h('b', null, money(group.currency, group.recharge))),
            h('span', null, `${t('balance.bonus')} `, h('b', null, money(group.currency, group.bonus))),
          ),
        )
      }

      function emptyWalletCard() {
        return h('div', { className: 'dsu-balance-group' },
          h('div', { className: 'dsu-cost-value' }, '—'),
          h('div', { className: 'dsu-wallet-split' },
            h('span', null, `${t('balance.recharge')} —`),
            h('span', null, `${t('balance.bonus')} —`),
          ),
        )
      }

      function balanceSection(groups, message) {
        const body = message !== null
          ? h('div', { className: 'dsu-cost-value dsu-muted' }, message)
          : h('div', { className: 'dsu-balance-groups' },
            groups.length > 0 ? groups.map(walletCard) : [emptyWalletCard()],
          )
        return h('section', { className: 'dsu-card dsu-cost-card' },
          h('div', { className: 'dsu-section-head' },
            h('h2', { className: 'dsu-h2' }, t('balance.total'))),
          body,
        )
      }

      function accountSection() {
        const head = h('div', { className: 'dsu-section-head' },
          h('h2', { className: 'dsu-h2' }, t('account.title')),
          account !== null && typeof account === 'object' ? accountLinks(account.links) : null,
        )

        let details = null
        let balanceMessage = null
        let groups = []

        if (account === null || account === undefined) {
          details = h('p', { className: 'dsu-muted' }, t('state.loading'))
          balanceMessage = t('state.loading')
        } else if (account.available === false) {
          details = h('p', { className: 'dsu-muted' }, t('account.unavailable'))
          balanceMessage = t('account.unavailable')
        } else if (account.status === 'signed-out') {
          details = h('div', null,
            h('div', { className: 'dsu-profile-name' }, t('account.signedOut')),
            h('p', { className: 'dsu-muted' }, t('account.signedOutHint')))
          balanceMessage = t('account.signedOut')
        } else if (account.status === 'error') {
          details = h('p', { className: 'dsu-muted' }, `${t('account.unavailable')} ${account.error || ''}`)
          balanceMessage = account.error || t('account.unavailable')
        } else {
          const profile = account.profile !== null && typeof account.profile === 'object' ? account.profile : null
          const name = profile !== null && typeof profile.name === 'string' && profile.name !== ''
            ? profile.name
            : t('account.unnamed')
          const contact = profile !== null && typeof profile.contact === 'string' && profile.contact !== ''
            ? profile.contact
            : null
          const avatarUrl = profile !== null && typeof profile.avatarUrl === 'string' ? profile.avatarUrl : null
          const initial = name.trim().slice(0, 1).toUpperCase()

          details = h('div', { className: 'dsu-profile' },
            avatarUrl !== null
              ? h('img', { className: 'dsu-avatar', src: avatarUrl, alt: '', referrerPolicy: 'no-referrer' })
              : h('div', { className: 'dsu-avatar', 'aria-hidden': true }, initial),
            h('div', { style: { minWidth: 0 } },
              h('div', { className: 'dsu-profile-name' }, name),
              contact !== null ? h('div', { className: 'dsu-profile-contact' }, contact) : null,
            ),
          )

          const balance = account.balance !== null && typeof account.balance === 'object' ? account.balance : null
          const wallets = balance !== null && Array.isArray(balance.wallets) ? balance.wallets : []
          const bonusWallets = balance !== null && Array.isArray(balance.bonusWallets) ? balance.bonusWallets : []
          groups = groupedWallets(wallets, bonusWallets)
          if (account.balanceFailed === true) balanceMessage = t('balance.failed')
        }

        return h('section', { className: 'dsu-card' },
          head,
          details,
          h('div', { className: 'dsu-summary-grid' },
            balanceSection(groups, balanceMessage),
            costSection(),
          ),
        )
      }

      function stat(label, value, hint) {
        return h('div', { className: 'dsu-stat' },
          h('div', { className: 'dsu-stat-label' }, label),
          h('div', { className: 'dsu-stat-value' }, value,
            hint !== undefined ? h('small', null, hint) : null),
        )
      }

      function sessionRow(row) {
        const percent = contextPercent(row)
        const warn = percent !== null && percent >= 80
        const meta = []
        if (typeof row.model === 'string' && row.model !== '') meta.push(row.model)
        if (typeof row.calls === 'number' && row.calls > 0) meta.push(`${exact(row.calls)} ${row.calls === 1 ? 'call' : 'calls'}`)
        if (typeof row.cost === 'number' && row.cost > 0) meta.push(`≈${costText(row.cost)}`)
        if (row.contextApprox === true && percent !== null) meta.push('≈')
        if (row.error === 'read-failed') meta.push(t('state.failed'))

        return h('div', { className: 'dsu-row', role: 'row', key: row.id },
          h('div', { className: 'dsu-session', role: 'cell' },
            h('div', { className: 'dsu-session-title' },
              h('span', { title: row.id }, typeof row.title === 'string' && row.title !== '' ? row.title : t('untitled')),
              row.live === true ? h('span', { className: 'dsu-badge dsu-badge-live' }, t('badge.live')) : null,
              row.subagent === true ? h('span', { className: 'dsu-badge' }, t('badge.subagent')) : null,
            ),
            meta.length > 0 ? h('div', { className: 'dsu-session-meta' }, meta.join(' · ')) : null,
          ),
          h('div', {
            className: 'dsu-num',
            role: 'cell',
            title: `${exact(sessionTotal(row))} tokens · in ${exact(row.inputTokens)} · cached ${exact(row.cacheReadTokens)} · out ${exact(row.outputTokens)}`,
          },
            count(sessionTotal(row)),
            h('small', null, `${count(row.inputTokens)} / ${count(row.outputTokens)}`),
          ),
          h('div', { role: 'cell' },
            percent === null
              ? h('div', { className: 'dsu-bar' }, h('span', { className: 'dsu-bar-label' }, '—'))
              : h('div', { className: 'dsu-bar', title: `${exact(row.contextTokens)} / ${exact(row.contextWindow)}` },
                h('div', { className: 'dsu-bar-track' },
                  h('div', {
                    className: warn ? 'dsu-bar-fill is-warn' : 'dsu-bar-fill',
                    style: { width: `${Math.max(2, percent)}%` },
                  })),
                h('span', { className: 'dsu-bar-label' }, `${row.contextApprox === true ? '≈' : ''}${percent}%`),
              ),
          ),
          h('div', { className: 'dsu-num dsu-col-updated', role: 'cell' }, clock(row.lastActivityAt ?? row.createdAt)),
        )
      }

      function costSection() {
        const data = officialSpend.data
        const ready = data !== null && typeof data === 'object'
          && data.available === true && Array.isArray(data.totalCosts)
        const totals = ready ? data.totalCosts : []
        const unavailable = data !== null && typeof data === 'object' && data.available === false
        const value = ready
          ? totals.length === 0
            ? h('div', { className: 'dsu-cost-value dsu-muted' }, t('cost.empty'))
            : h('div', { className: 'dsu-cost-value' }, totals.map((total) =>
              h('span', {
                key: total.currency,
                title: `${total.amount} ${total.currency}`,
              }, `${officialCostText(total.amount, total.currency)} ${total.currency}`),
            ))
          : unavailable || officialSpend.status === 'error'
            ? h('div', { className: 'dsu-cost-value dsu-muted' },
              data?.status === 'signed-out' ? t('cost.signedOut') : t('cost.failed'))
            : h('div', { className: 'dsu-cost-value' },
              h('span', { className: 'dsu-spin', 'aria-hidden': true }),
              t('cost.loading'))
        return h('section', { className: 'dsu-card dsu-cost-card' },
          h('div', { className: 'dsu-section-head' },
            h('h2', { className: 'dsu-h2' }, t('cost.title'))),
          value,
        )
      }

      function tokenSection() {
        const totals = tokens !== null && typeof tokens === 'object' && tokens.totals !== null
          ? tokens.totals
          : { inputTokens: 0, uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, reasoningTokens: 0, totalTokens: 0, calls: 0 }

        const head = h('div', { className: 'dsu-section-head' },
          h('h2', { className: 'dsu-h2' }, t('tokens.title')),
          tokens !== null && typeof tokens === 'object' && tokens.available === true && tokens.truncated === true
            ? h('span', { className: 'dsu-muted' }, fill(t('tokens.truncated'), {
              shown: tokens.scanned,
              total: tokens.total,
            }))
            : null,
        )

        if (tokens === null || tokens === undefined) {
          return h('section', { className: 'dsu-card' }, head, h('p', { className: 'dsu-muted' }, t('state.loading')))
        }
        if (tokens.available === false) {
          return h('section', { className: 'dsu-card' }, head,
            h('p', { className: 'dsu-muted' }, tokens.error || t('state.failed')))
        }

        const rows = Array.isArray(tokens.sessions) ? tokens.sessions : []
        const header = h('div', { className: 'dsu-row dsu-row-head', role: 'row' },
          h('div', { role: 'columnheader' }, t('column.session')),
          h('div', { className: 'dsu-num', role: 'columnheader' }, t('column.tokens')),
          h('div', { role: 'columnheader', style: { textAlign: 'right' } }, t('column.context')),
          h('div', { className: 'dsu-num dsu-col-updated', role: 'columnheader' }, t('column.updated')),
        )

        const extra = []
        if (typeof totals.cacheWriteTokens === 'number' && totals.cacheWriteTokens > 0) {
          extra.push(`cache write ${count(totals.cacheWriteTokens)}`)
        }
        if (typeof totals.reasoningTokens === 'number' && totals.reasoningTokens > 0) {
          extra.push(`reasoning ${count(totals.reasoningTokens)}`)
        }

        return h('section', { className: 'dsu-card' },
          head,
          h('div', { className: 'dsu-stats' },
            stat(t('tokens.input'), count(totals.uncachedInputTokens)),
            stat(t('tokens.cached'), count(totals.cacheReadTokens)),
            stat(t('tokens.output'), count(totals.outputTokens)),
            stat(t('tokens.total'), count(totals.totalTokens)),
          ),
          extra.length > 0 ? h('p', { className: 'dsu-muted', style: { marginTop: -6, marginBottom: 10 } }, extra.join(' · ')) : null,
          rows.length === 0
            ? h('p', { className: 'dsu-empty' }, t('tokens.empty'))
            : h('div', { className: 'dsu-list', role: 'table', 'aria-label': t('tokens.title') },
              header,
              rows.map(sessionRow),
            ),
        )
      }

      return h('div', { className: 'dsu-root' },
        h('style', null, CSS),
        h('div', { className: 'dsu-inner' },
          h('header', { className: 'dsu-header' },
            h('div', { className: 'dsu-actions' },
              h('div', { className: 'dsu-status' },
                refreshing ? h('span', { className: 'dsu-spin', 'aria-hidden': true }) : null,
                data !== null && data !== undefined && typeof data.generatedAt === 'number'
                  ? fill(t('updated.at'), { time: clock(data.generatedAt) })
                  : null,
              ),
              h('button', {
                type: 'button',
                className: 'dsu-btn',
                onClick: refresh,
                disabled: refreshing,
                'aria-busy': refreshing,
              }, refreshIcon(), t('action.refresh')),
            ),
          ),
          state.error !== null ? errorBanner(state.error) : null,
          accountSection(),
          tokenSection(),
          h('div', { className: 'dsu-notes' },
            h('p', { className: 'dsu-note' }, t('tokens.note')),
            h('p', { className: 'dsu-note' }, t('cost.note')),
          ),
        ),
      )

    }


    return { Page: UsagePanel, locales: { zh, en, ja, es, fr, de, ru, pt } }
    })(React)

    const Hud = (function createUsageHud(React) {
      const h = React.createElement

    /** Locale namespace owned by the HUD. */
    const NS = 'usageHud'
    /** Overlay entry id; also the slot key used by layout. */
    const ID = 'usage-hud'
    /** Polling period while the surface is expanded or collapsed. */
    const POLL_MS = 30000
    /** Countdown repaint period; resets are shown to the minute. */
    const TICK_MS = 15000
    /** Where the position and collapse state live. */
    const STORAGE_KEY = 'dsh-usage-hud:v1'
    const ENABLE_EVENT = 'dsh-usage-hud:enabled'

    const zh = {
      'hud.title': '用量监控',
      'hud.drag': '拖动移动',
      'action.refresh': '刷新数据',
      'action.collapse': '收起为胶囊',
      'action.expand': '展开用量监控',
      'state.loading': '读取中…',
      'state.failed': '读取失败',
      'state.retry': '重试',
      'footer.updated': '更新于 {time}',
      'footer.never': '尚未更新',
      'footer.poll': '每 {seconds} 秒刷新',
      'codex.primary': '5 小时',
      'codex.secondary': '每周',
      'codex.plan': '{plan}',
      'codex.source.live': '实时',
      'codex.source.session': '本地',
      'codex.stale': '可能过期',
      'codex.limit': '已达上限',
      'codex.resetAt': '{time} 重置',
      'codex.resetIn': '剩 {left}',
      'codex.noReset': '重置时间未知',
      'codex.empty': '暂无数据',
      'codex.fallback': '实时接口不可用，显示本地记录：{message}',
      'codex.staleNote': '刷新失败，显示上次结果：{message}',
      'time.soon': '即将重置',
      'time.lessThanMinute': '不到 1 分钟',
      'time.minutes': '{n} 分钟',
      'time.hoursMinutes': '{hours} 小时 {minutes} 分',
      'time.daysHours': '{days} 天 {hours} 小时',
      'ds.balance': '总余额',
      'ds.recharge': '充值 {amount}',
      'ds.bonus': '赠送 {amount}',
      'ds.balanceFailed': '余额读取失败',
      'ds.signedIn': '已连接',
      'ds.signedOut': '未登录',
      'ds.unavailable': '账户不可用',
      'ds.tokens': 'Token 合计',
      'ds.input': '输入',
      'ds.cached': '缓存',
      'ds.output': '输出',
      'ds.sessions': '{n} 个会话',
      'ds.sessionsRecent': '最近 {shown} / {total} 个会话',
      'ds.empty': '暂无会话记录',
      'ds.context': '当前会话上下文 {percent}%',
      'ds.contextLabel': '当前会话上下文',
      'pill.codex': 'Codex',
      'pill.ds': 'DeepSeek',
    }

    const en = {
      'hud.title': 'Usage monitor',
      'hud.drag': 'Drag to move',
      'action.refresh': 'Refresh data',
      'action.collapse': 'Collapse to pill',
      'action.expand': 'Expand usage monitor',
      'state.loading': 'Loading…',
      'state.failed': 'Could not load',
      'state.retry': 'Retry',
      'footer.updated': 'Updated {time}',
      'footer.never': 'Not updated yet',
      'footer.poll': 'Every {seconds}s',
      'codex.primary': '5 hours',
      'codex.secondary': 'Weekly',
      'codex.plan': '{plan}',
      'codex.source.live': 'Live',
      'codex.source.session': 'Local',
      'codex.stale': 'May be stale',
      'codex.limit': 'Limit reached',
      'codex.resetAt': 'resets {time}',
      'codex.resetIn': '{left} left',
      'codex.noReset': 'Reset time unknown',
      'codex.empty': 'No data',
      'codex.fallback': 'Live endpoint unavailable; showing local record: {message}',
      'codex.staleNote': 'Refresh failed; showing the last result: {message}',
      'time.soon': 'resetting now',
      'time.lessThanMinute': 'under a minute',
      'time.minutes': '{n}m',
      'time.hoursMinutes': '{hours}h {minutes}m',
      'time.daysHours': '{days}d {hours}h',
      'ds.balance': 'Total balance',
      'ds.recharge': 'Recharge {amount}',
      'ds.bonus': 'Bonus {amount}',
      'ds.balanceFailed': 'Balance unavailable',
      'ds.signedIn': 'Connected',
      'ds.signedOut': 'Not signed in',
      'ds.unavailable': 'Account unavailable',
      'ds.tokens': 'Tokens',
      'ds.input': 'Input',
      'ds.cached': 'Cached',
      'ds.output': 'Output',
      'ds.sessions': '{n} sessions',
      'ds.sessionsRecent': 'Latest {shown} of {total} sessions',
      'ds.empty': 'No sessions yet',
      'ds.context': 'Live context {percent}%',
      'ds.contextLabel': 'Live context',
      'pill.codex': 'Codex',
      'pill.ds': 'DeepSeek',
    }

    const CSS = `
.uh-root{position:absolute;z-index:30;pointer-events:auto;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;line-height:1.45;-webkit-user-select:none;user-select:none}
.uh-root.uh-drag,.uh-root.uh-drag *{cursor:grabbing!important}
.uh-card{box-sizing:border-box;width:304px;border-radius:18px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 90%,transparent);backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35);box-shadow:0 18px 48px -20px rgba(0,0,0,.5),0 1px 2px rgba(0,0,0,.12);overflow:hidden;transition:border-color .15s ease}
.uh-card:hover{border-color:var(--dsw-alias-border-l3)}
.uh-head{display:flex;align-items:center;gap:8px;padding:9px 8px 9px 12px;cursor:grab;touch-action:none}
.uh-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--dsw-alias-state-idle-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-idle-primary) 18%,transparent)}
.uh-dot[data-tone=ok]{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 20%,transparent)}
.uh-dot[data-tone=warn]{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-warn-primary) 22%,transparent)}
.uh-dot[data-tone=error]{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-error-primary) 22%,transparent)}
.uh-title{font-size:12px;font-weight:600;letter-spacing:.02em;white-space:nowrap}
.uh-actions{display:flex;align-items:center;gap:2px;margin-left:auto}
.uh-icon{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .12s ease,color .12s ease}
.uh-icon:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.uh-icon:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px}
.uh-icon:disabled{cursor:default;opacity:.6}
.uh-icon[data-busy=true] svg{animation:uh-spin .9s linear infinite}
.uh-body{display:flex;flex-direction:column;gap:12px;padding:2px 12px 12px}
.uh-sec{display:flex;flex-direction:column;gap:8px;min-width:0}
.uh-sec+.uh-sec{padding-top:12px;border-top:.5px solid var(--dsw-alias-border-l1)}
.uh-sec-head{display:flex;align-items:center;gap:6px;min-height:16px;min-width:0}
.uh-sec-name{font-size:11px;font-weight:600;letter-spacing:.03em;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.uh-spacer{flex:1;min-width:0}
.uh-badge{display:inline-flex;align-items:center;height:16px;max-width:112px;padding:0 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:9.5px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.uh-badge-warn{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 13%,transparent)}
.uh-badge-error{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 13%,transparent)}
.uh-metric{display:flex;flex-direction:column;gap:5px;min-width:0}
.uh-metric-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.uh-metric-label{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.uh-metric-value{font-size:16px;font-weight:600;line-height:1.1;letter-spacing:-.01em;font-variant-numeric:tabular-nums;white-space:nowrap}
.uh-unit{font-size:10px;font-weight:400;color:var(--dsw-alias-label-tertiary);margin-left:1px}
.uh-meter{position:relative;height:5px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
.uh-meter-thin{height:3px;flex:1}
.uh-fill{position:absolute;inset:0 auto 0 0;border-radius:999px;background:var(--dsw-alias-brand-primary);transition:width .45s ease}
.uh-fill[data-tone=warn]{background:var(--dsw-alias-state-warn-primary)}
.uh-fill[data-tone=error]{background:var(--dsw-alias-state-error-primary)}
.uh-fill[data-tone=idle]{background:var(--dsw-alias-label-dimmed)}
.uh-sub{display:flex;align-items:baseline;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1.35;font-variant-numeric:tabular-nums}
.uh-sub span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.uh-balance{display:flex;flex-direction:column;gap:2px;min-width:0}
.uh-balance-main{display:flex;align-items:baseline;gap:6px;min-width:0}
.uh-balance-value{font-size:22px;font-weight:600;line-height:1.15;letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap}
.uh-balance-label{font-size:10px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.uh-split{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1.4;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.uh-muted{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.4}
.uh-stack{display:flex;height:5px;border-radius:999px;overflow:hidden;background:var(--dsw-alias-bg-layer-2)}
.uh-stack span{height:100%;min-width:0;transition:width .45s ease}
.uh-seg-input{background:var(--dsw-alias-brand-primary)}
.uh-seg-cached{background:var(--dsw-alias-brand-primary);opacity:.45}
.uh-seg-output{background:var(--dsw-alias-state-business-primary)}
.uh-legend{display:flex;flex-wrap:wrap;gap:3px 10px;color:var(--dsw-alias-label-tertiary);font-size:9.5px;line-height:1.4;font-variant-numeric:tabular-nums}
.uh-legend span{white-space:nowrap}
.uh-key{display:inline-block;width:5px;height:5px;border-radius:1.5px;margin-right:4px;vertical-align:1px}
.uh-key-input{background:var(--dsw-alias-brand-primary)}
.uh-key-cached{background:var(--dsw-alias-brand-primary);opacity:.45}
.uh-key-output{background:var(--dsw-alias-state-business-primary)}
.uh-context{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:10px;font-variant-numeric:tabular-nums}
.uh-context span{white-space:nowrap}
.uh-note{margin:0;color:var(--dsw-alias-state-warn-primary);font-size:9.5px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.uh-note-error{color:var(--dsw-alias-state-error-primary)}
.uh-fail{display:flex;align-items:center;gap:8px;min-width:0}
.uh-fail-text{flex:1;min-width:0;color:var(--dsw-alias-state-error-primary);font-size:10px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uh-retry{flex:none;height:20px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:9.5px;cursor:pointer}
.uh-retry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.uh-loading{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}
.uh-spin{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--dsw-alias-bg-layer-3);border-top-color:var(--dsw-alias-brand-primary);animation:uh-spin .8s linear infinite}
.uh-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-top:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);font-size:9.5px;font-variant-numeric:tabular-nums;white-space:nowrap}
.uh-pill{display:flex;align-items:center;gap:7px;height:32px;box-sizing:border-box;padding:0 11px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 90%,transparent);backdrop-filter:blur(20px) saturate(1.35);-webkit-backdrop-filter:blur(20px) saturate(1.35);box-shadow:0 10px 26px -14px rgba(0,0,0,.45),0 1px 2px rgba(0,0,0,.1);cursor:grab;touch-action:none;white-space:nowrap}
.uh-pill:hover{border-color:var(--dsw-alias-border-l3)}
.uh-pill:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.uh-pill-k{color:var(--dsw-alias-label-tertiary);font-size:9px;letter-spacing:.05em;text-transform:uppercase}
.uh-pill-v{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.uh-pill-sep{width:.5px;height:11px;background:var(--dsw-alias-border-l2);flex:none}
.uh-pill-chev{color:var(--dsw-alias-label-tertiary);display:inline-flex;margin-left:1px}
@keyframes uh-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.uh-fill,.uh-stack span{transition:none}.uh-spin,.uh-icon[data-busy=true] svg{animation-duration:2s}}
`

    /**
     * Replace `{name}` placeholders without a locale service.
     * @param template - source template.
     * @param values - replacement values.
     * @returns the filled string.
     */
    function fill(template, values) {
      let text = String(template)
      for (const [name, value] of Object.entries(values ?? {})) {
        text = text.split(`{${name}}`).join(String(value))
      }
      return text
    }

    /**
     * Normalize a slot-supplied translator.
     * @param translate - locale-bound `t`, when present.
     * @returns a callable translator.
     */
    function translatorOf(translate) {
      if (typeof translate === 'function') return translate
      return (key, values) => (values === undefined ? key : fill(key, values))
    }

    /** BCP-47 tag used for `Intl` output. */
    function localeTag() {
      if (typeof document !== 'undefined' && typeof document.documentElement.lang === 'string' && document.documentElement.lang !== '') {
        return document.documentElement.lang
      }
      if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') return navigator.language
      return 'zh-CN'
    }

    /**
     * Absolute same-origin path for one usage route.
     * @param relative - route below the page base, without a leading slash.
     * @returns an absolute pathname.
     */
    function apiPath(relative) {
      if (typeof document === 'undefined') return `/${relative}`
      return new URL(relative, document.baseURI).pathname
    }

    /** `HH:MM` clock time. */
    function clockOf(timestamp) {
      return new Intl.DateTimeFormat(localeTag(), { hour: '2-digit', minute: '2-digit' }).format(timestamp)
    }

    /** `HH:MM:SS` clock time. */
    function clockSecondsOf(timestamp) {
      return new Intl.DateTimeFormat(localeTag(), {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(timestamp)
    }

    /** `M/D HH:MM` for a reset outside today. */
    function dateClockOf(timestamp) {
      return new Intl.DateTimeFormat(localeTag(), {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(timestamp)
    }

    /** Clock label for one reset instant, adding the date when it is not today. */
    function resetClockOf(timestamp) {
      return new Date(timestamp).toDateString() === new Date().toDateString()
        ? clockOf(timestamp)
        : dateClockOf(timestamp)
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

    /** Severity bucket of one used percentage. */
    function severityOf(used) {
      if (!Number.isFinite(used)) return 'idle'
      if (used >= 100) return 'error'
      if (used >= 80) return 'warn'
      return 'ok'
    }

    /** Short percentage label; keeps a nonzero sub-one percent visible. */
    function percentOf(used) {
      if (!Number.isFinite(used)) return '—'
      const rounded = Math.round(used)
      if (used > 0 && rounded === 0) return '<1'
      return String(Math.min(999, Math.max(0, rounded)))
    }

    /** Compact token count for the card body. */
    function compactOf(value) {
      if (!Number.isFinite(value)) return '—'
      return new Intl.NumberFormat(localeTag(), {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    }

    /** Exact grouped count for tooltips. */
    function exactOf(value) {
      if (!Number.isFinite(value)) return '—'
      return new Intl.NumberFormat(localeTag()).format(value)
    }

    /** Currency symbol of a DeepSeek wallet. */
    function currencySymbol(currency) {
      if (currency === 'USD') return '$'
      if (currency === 'CNY') return '¥'
      return ''
    }

    /** Two-decimal money label. */
    function moneyOf(value, currency) {
      if (!Number.isFinite(value)) return '—'
      const amount = new Intl.NumberFormat(localeTag(), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value)
      return `${currencySymbol(currency)}${amount}`
    }

    /**
     * Fold the recharge and bonus wallet lists into totals per currency.
     * @param account - DeepSeek account projection.
     * @returns ordered `{ currency, recharge, bonus }` groups.
     */
    function groupWallets(account) {
      const groups = new Map()
      const add = (wallet, kind) => {
        if (wallet === null || typeof wallet !== 'object') return
        const currency = wallet.currency === 'USD' ? 'USD' : 'CNY'
        const value = Number(wallet.balance)
        if (!Number.isFinite(value)) return
        let group = groups.get(currency)
        if (group === undefined) {
          group = { currency, recharge: 0, bonus: 0 }
          groups.set(currency, group)
        }
        if (kind === 'bonus') group.bonus += value
        else group.recharge += value
      }
      for (const wallet of account?.balance?.wallets ?? []) add(wallet, 'recharge')
      for (const wallet of account?.balance?.bonusWallets ?? []) add(wallet, 'bonus')
      const order = { CNY: 0, USD: 1 }
      return [...groups.values()].sort((left, right) => (order[left.currency] ?? 9) - (order[right.currency] ?? 9))
    }

    /** Readable message from a rejected promise. */
    function errorText(error) {
      if (error instanceof Error) return error.message
      return String(error)
    }

    /**
     * Fetch one JSON route and reject on a non-2xx response.
     * @param path - same-origin pathname plus query.
     * @returns the parsed body.
     */
    async function fetchJson(path) {
      const response = await fetch(path, {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        const message = body !== null && typeof body.error === 'string'
          ? body.error
          : `HTTP ${response.status}`
        throw new Error(message)
      }
      return body
    }

    /**
     * Read the Codex snapshot.
     * @param force - bypass the host cache.
     * @returns the normalized Codex snapshot.
     */
    async function readCodex(force) {
      const query = force ? '?force=1' : ''
      const body = await fetchJson(`${apiPath('api/dsh-codex-usage')}${query}`)
      if (body === null || body.ok !== true || body.data === null || typeof body.data !== 'object') {
        const message = body !== null && typeof body.error === 'string' ? body.error : 'Codex usage route returned no data'
        throw new Error(message)
      }
      return body.data
    }

    /**
     * Read the DeepSeek payload.
     * @param force - bypass both host caches.
     * @returns the account plus token projection.
     */
    async function readDeepseek(force) {
      const params = new URLSearchParams({
        locale: localeTag(),
        tz: String(-new Date().getTimezoneOffset() * 60),
        refresh: force ? '1' : '0',
      })
      const body = await fetchJson(`${apiPath('api/dsh-deepseek-usage')}?${params.toString()}`)
      if (body === null || typeof body !== 'object') throw new Error('DeepSeek usage route returned no data')
      if (typeof body.error === 'string') throw new Error(body.error)
      return body
    }

    /** Smallest top coordinate that clears the window chrome. */
    function topClearance() {
      if (typeof document === 'undefined') return 8
      if (document.documentElement.dataset.platform !== 'darwin') return 8
      const raw = window.getComputedStyle(document.documentElement).getPropertyValue('--dsh-frame-top-clearance')
      const value = Number.parseFloat(raw)
      return Number.isFinite(value) && value > 0 ? value + 8 : 8
    }

    /** Clamp one number into an inclusive range. */
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), Math.max(min, max))
    }

    /** Default floating-surface state before a stored position is available. */
    function defaultUiState() {
      return {
        x: null,
        y: null,
        capsuleX: null,
        capsuleY: null,
        collapsed: false,
        enabled: true,
      }
    }

    /** Restore the one remembered capsule position, including legacy x/y. */
    function readUiState() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw === null) return defaultUiState()
        const parsed = JSON.parse(raw)
        if (parsed === null || typeof parsed !== 'object') return defaultUiState()
        const capsuleX = Number.isFinite(parsed.capsuleX)
          ? parsed.capsuleX
          : Number.isFinite(parsed.collapsedX)
            ? parsed.collapsedX
            : Number.isFinite(parsed.x) ? parsed.x : null
        const capsuleY = Number.isFinite(parsed.capsuleY)
          ? parsed.capsuleY
          : Number.isFinite(parsed.collapsedY)
            ? parsed.collapsedY
            : Number.isFinite(parsed.y) ? parsed.y : null
        const collapsed = parsed.collapsed === true
        return {
          x: capsuleX,
          y: capsuleY,
          capsuleX,
          capsuleY,
          collapsed,
          enabled: parsed.enabled !== false,
        }
      } catch {
        return defaultUiState()
      }
    }

    /** Save the capsule coordinates only while the capsule itself is moved. */
    function withUiPosition(state, x, y) {
      return state.collapsed
        ? { ...state, x, y, capsuleX: x, capsuleY: y }
        : { ...state, x, y }
    }

    /** Persist the capsule anchor and visibility state, never expanded coordinates. */
    function writeUiState(state) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          capsuleX: state.capsuleX,
          capsuleY: state.capsuleY,
          collapsed: state.collapsed,
          enabled: state.enabled,
        }))
      } catch {
        // Private mode and quota errors only cost persistence.
      }
    }

    /** Refresh glyph. */
    function RefreshIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M13.4 8a5.4 5.4 0 1 1-1.62-3.85',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M13.4 2.6v3.2h-3.2',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }))
    }

    /** Collapse glyph. */
    function CollapseIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M4 6.25 8 10.25l4-4',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }))
    }

    /** Expand glyph. */
    function ExpandIcon() {
      return h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M4 9.75 8 5.75l4 4',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }))
    }

    /** One section badge. */
    function Badge(props) {
      const tone = props.tone === 'warn' || props.tone === 'error' ? ` uh-badge-${props.tone}` : ''
      return h('span', {
        className: `uh-badge${tone}`,
        title: typeof props.title === 'string' ? props.title : undefined,
      }, props.children)
    }

    /** One horizontal meter. */
    function Meter(props) {
      const used = Number.isFinite(props.value) ? props.value : 0
      const width = clamp(used, 0, 100)
      return h('div', {
        className: `uh-meter${props.thin === true ? ' uh-meter-thin' : ''}`,
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(width),
        'aria-label': typeof props.label === 'string' ? props.label : undefined,
      }, h('span', {
        className: 'uh-fill',
        'data-tone': props.tone ?? 'ok',
        style: { width: `${width}%` },
      }))
    }

    /** Loading placeholder used on first paint. */
    function LoadingLine(props) {
      return h('div', { className: 'uh-loading' },
        h('span', { className: 'uh-spin', 'aria-hidden': true }),
        h('span', null, props.t('state.loading')))
    }

    /** One retryable failure line. */
    function FailureLine(props) {
      return h('div', { className: 'uh-fail' },
        h('span', { className: 'uh-fail-text', title: props.message }, props.message),
        h('button', {
          type: 'button',
          className: 'uh-retry',
          onPointerDown: (event) => event.stopPropagation(),
          onClick: props.onRetry,
        }, props.t('state.retry')))
    }

    /** One Codex rate-limit window. */
    function WindowRow(props) {
      const usage = props.window
      const t = props.t
      const used = usage !== null && usage !== undefined && Number.isFinite(usage.usedPercent)
        ? usage.usedPercent
        : null
      const tone = severityOf(used)
      const resetAt = usage !== null && usage !== undefined && Number.isFinite(usage.resetAtMs)
        ? usage.resetAtMs
        : null
      return h('div', { className: 'uh-metric' },
        h('div', { className: 'uh-metric-top' },
          h('span', { className: 'uh-metric-label' }, props.label),
          h('span', { className: 'uh-metric-value' },
            used === null ? '—' : [percentOf(used), h('span', { key: 'u', className: 'uh-unit' }, '%')])),
        h(Meter, { value: used ?? 0, tone, label: props.label }),
        h('div', { className: 'uh-sub' },
          h('span', null, resetAt === null
            ? t('codex.noReset')
            : t('codex.resetAt', { time: resetClockOf(resetAt) })),
          resetAt === null
            ? null
            : h('span', null, t('codex.resetIn', { left: durationText(resetAt - props.now, t) }))))
    }

    /** Codex limits section. */
    function CodexSection(props) {
      const { data, error, now, t, onRetry } = props
      const plan = data !== null && typeof data?.account?.planType === 'string' ? data.account.planType : null
      const source = data !== null ? data.source : null
      const head = h('div', { className: 'uh-sec-head' },
        h('span', { className: 'uh-sec-name' }, 'Codex'),
        plan === null || plan === ''
          ? null
          : h(Badge, null, t('codex.plan', { plan: plan.charAt(0).toUpperCase() + plan.slice(1) })),
        data?.rateLimitReached === true ? h(Badge, { tone: 'error' }, t('codex.limit')) : null,
        h('span', { className: 'uh-spacer' }),
        data?.stale === true ? h(Badge, { tone: 'warn' }, t('codex.stale')) : null,
        source === null
          ? null
          : h(Badge, { tone: source === 'live' ? undefined : 'warn' }, source === 'live' ? t('codex.source.live') : t('codex.source.session')))

      if (data === null) {
        return h('section', { className: 'uh-sec' }, head,
          error === null ? h(LoadingLine, { t }) : h(FailureLine, { message: error, t, onRetry }))
      }

      const windows = data.windows ?? {}
      const notice = error === null
        ? null
        : h('p', {
          className: `uh-note${source === 'live' ? ' uh-note-error' : ''}`,
          title: error,
        }, source === 'live' ? t('codex.staleNote', { message: error }) : t('codex.fallback', { message: error }))

      return h('section', { className: 'uh-sec' },
        head,
        h(WindowRow, { label: t('codex.primary'), window: windows.primary ?? null, now, t }),
        h(WindowRow, { label: t('codex.secondary'), window: windows.secondary ?? null, now, t }),
        notice)
    }

    /** DeepSeek balance and token section. */
    function DeepseekSection(props) {
      const { data, error, t, onRetry } = props
      const head = h('div', { className: 'uh-sec-head' },
        h('span', { className: 'uh-sec-name' }, 'DeepSeek'),
        h('span', { className: 'uh-spacer' }),
        data !== null && data.account?.status === 'credential-stored'
          ? h(Badge, null, t('ds.signedIn'))
          : null)

      if (data === null) {
        return h('section', { className: 'uh-sec' }, head,
          error === null ? h(LoadingLine, { t }) : h(FailureLine, { message: error, t, onRetry }))
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
        'panel.title': '用量监控',
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
