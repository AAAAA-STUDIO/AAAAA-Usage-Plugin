import { apply as applyCodex } from './codex-host.js'
import { apply as applyDeepSeek } from './deepseek-host.js'

export const inject = ['connection']

export function apply(ctx, config) {
  applyCodex(ctx, config)
  applyDeepSeek(ctx)
}
