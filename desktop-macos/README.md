# AAAAA 用量 macOS 独立应用

这是 AAAAA 用量插件的独立 macOS 桌面版，不需要启动 DeepSeek Harness Desktop。

## 功能

- 查看 Codex ChatGPT 当前 5 小时与每周用量。
- 通过 DeepSeek 官方浏览器授权登录，查看账户余额和官方累计消费金额。
- 汇总本机 DeepSeek Harness 会话投影里的 Token 统计；此项来自本机记录，不是官方账单。
- 显示可拖动、可展开和收起的系统级置顶 HUD。展开时以折叠胶囊左上角为锚点，折叠后回到同一位置。
- 主界面、HUD、授权令牌和窗口设置均由本机应用管理，不依赖 DSH 插件页运行。

## 构建与启动

需要 macOS 13 或更高版本，以及 Apple Command Line Tools 中的 Swift 编译器。

```bash
cd desktop-macos
./build-app.sh
open "build/AAAAA Usage.app"
```

构建脚本会生成未签名的本地 .app。用于公开分发前，需要用开发者证书签名并完成 Apple 公证。

## 数据与隐私

- Codex：读取 `~/.codex/auth.json` 中的 ChatGPT 登录令牌，只请求 `chatgpt.com/backend-api/wham/usage`；接口不可用时读取最近的 Codex 本地会话快照。
- DeepSeek：使用 PKCE 浏览器授权，令牌写入 macOS 钥匙串。登录及账户请求只发往 `platform.deepseek.com`。
- DeepSeek 余额和累计消费金额都来自官方账户摘要接口。若官方接口不可用或返回格式变化，页面显示不可用，不以本地估算冒充官方金额。
- Token 统计只读取 `~/.dsh/storages/session_projcache/sessions` 中的本机会话 Token 投影；程序不会读取或上传会话正文。没有 DSH 会话投影时会显示暂无本地记录。
- HUD 的开关、折叠状态和胶囊位置保存在本机应用偏好设置中。

DeepSeek 官方账户授权流程参考 [DeepSeek Harness 官方账户平台实现](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/credentials/deepseek-account-platform)。累计消费金额接口是开放平台页面使用的账户摘要接口，目前没有公开的稳定 API 文档。
