# AAAAA Usage Plugin

为 DeepSeek Harness Desktop（DSH）提供 Codex 与 DeepSeek 用量查看页，以及可拖动的用量 HUD。

| 功能 | 数据来源 |
| --- | --- |
| Codex 5 小时与每周用量窗口 | ChatGPT 用量接口；接口不可用时可回退读取本机 Codex 会话记录 |
| DeepSeek 账户余额与赠送余额 | 当前 DSH 登录的 DeepSeek 开放平台账户 |
| DeepSeek Token 统计 | 本机 DSH 会话记录 |
| DeepSeek 累计消费金额 | DeepSeek 开放平台账户摘要中的官方累计金额 |
| 单会话消费估算 | 根据 Token 数量和 DeepSeek 公布价格在本机估算 |

## 安装

先在终端克隆项目：

```bash
git clone https://github.com/lc527914580-sketch/AAAAA-Usage-Plugin.git
```

在 DSH 的插件管理控制台中，使用克隆后的项目目录安装插件：

```text
plugin_manager install_bundle /path/to/AAAAA-Usage-Plugin
```

将 `/path/to/AAAAA-Usage-Plugin` 替换成实际目录。安装或更新后刷新 DSH 页面，必要时重启 DSH。插件会添加「AAAAA 用量」侧边栏入口；页面标题栏可以开启或关闭 HUD。

## 用量数据说明

### DeepSeek 官方累计消费金额

用量页的「累计消费金额」读取 DeepSeek 开放平台账户摘要接口返回的 `total_costs`，展示平台账户的官方累计金额，不会用本机会话 Token 数推算替代。平台数据可能存在延迟。当前实现使用开放平台页面调用的接口，该接口没有公开的稳定 API 文档；若 DeepSeek 调整接口，官方金额可能暂时无法读取。

本机 DSH 会话记录用于 Token 统计和逐会话消费估算。估算值按 DeepSeek 公布价格计算，仅供参考；它和平台的官方累计金额是不同的数据。

### Codex 用量

Host 端从 `~/.codex/auth.json` 读取 Codex 的 ChatGPT 登录凭据，并请求 ChatGPT 用量接口。凭据保留在 DSH Host 进程中，不会发送给浏览器端。接口不可用时，插件会尝试使用最近的本机会话记录作为回退数据。

## HUD 行为

- HUD 可在 DSH 窗口内拖动、展开和收起，并可单独关闭。
- 拖动收起胶囊会更新并保存胶囊位置；展开时只为当前窗口尺寸临时调整面板位置。
- 再次收起后，胶囊回到之前保存的位置。展开面板的位置不会作为另一份位置记忆。
- 位置、展开状态和开关状态保存在当前 DSH 页面浏览器的 `localStorage` 中。
- HUD 位于 DSH 的页面覆盖层中，只在 DSH 窗口内显示；它不是系统级悬浮窗，不会覆盖其他应用。

## 隐私

- Codex 凭据只由 Host 端读取，并用于请求 `chatgpt.com` 的用量接口。
- DeepSeek 开放平台会话凭据由 Host 端用于请求 `platform.deepseek.com`。官方累计金额不会通过本地 Token 估算生成。
- Token 统计读取本机 DSH 会话记录。请勿公开分享包含个人会话内容或凭据的日志和配置文件。

## Codex 配置

可通过环境变量覆盖 Codex 用量读取配置：

| 环境变量 | 作用 |
| --- | --- |
| `DSH_CODEX_USAGE_HOME` | Codex 配置目录；默认使用 `~/.codex` |
| `DSH_CODEX_USAGE_ENDPOINT` | ChatGPT 用量接口地址 |
| `DSH_CODEX_USAGE_REFRESH_SECONDS` | Host 端刷新间隔，范围为 5–3600 秒 |
| `DSH_CODEX_USAGE_TIMEOUT_MS` | 请求超时时间，范围为 1000–30000 毫秒 |

## 项目结构

```text
AAAAA-Usage-Plugin/
├── index.js          # 注册 Host 路由
├── codex-host.js     # Codex 用量读取
├── deepseek-host.js  # DeepSeek 账户、官方金额与 Token 数据
├── client.js         # 用量页、侧边栏入口与 HUD
├── cordis.patch.yml  # DSH 插件注入配置
├── icon.svg
├── package.json
├── LICENSE
└── README.md
```

## 许可证

本项目使用 [MIT License](LICENSE)。
