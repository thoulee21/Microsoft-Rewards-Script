# Microsoft-Rewards-Script

自动化的 Microsoft Rewards 脚本，使用 TypeScript、Cheerio 和 Playwright 构建。

正在开发中，主要供个人使用！

---

## 🚀 快速安装（推荐）

**最简单的入门方式——只需下载并运行！**

1. **下载或克隆** 源代码
2. **运行安装脚本：**

    **Windows：** 双击 `setup/setup.bat` 或在命令行运行

    **Linux/macOS/WSL：** `bash setup/setup.sh`

    **其他平台：** `npm run setup`

3. **按照提示操作：** 安装脚本将自动完成以下步骤：
    - 重命名 `accounts.example.json` 为 `accounts.json`
    - 提示输入你的 Microsoft 账号信息
    - 提醒你检查 `config.json` 配置选项
    - 安装所有依赖（`npm install`）
    - 构建项目（`npm run build`）
    - 可选：立即启动脚本

**就是这么简单！** 安装脚本会帮你完成所有步骤。

---

## ⚙️ 高级安装选项

### Nix 用户

1. 获取 [Nix](https://nixos.org/)
2. 运行 `./run.sh`
3. 完成！

### 手动安装（故障排查）

如果自动安装脚本无法在你的环境中运行：

1. 手动重命名 `src/accounts.example.json` 为 `src/accounts.json`
2. 在 `accounts.json` 中添加你的 Microsoft 账号信息
3. 根据需要自定义 `src/config.json`
4. 安装依赖：`npm install`
5. 构建项目：`npm run build`
6. 启动脚本：`npm run start`

---

## 🐳 Docker 安装（实验性）

用于自动调度和容器化部署。

### 开始前

-   如果之前本地构建过，请删除 `/node_modules` 和 `/dist` 文件夹
-   如果从 1.4 或更早版本升级，请删除旧的 Docker 卷
-   旧的 `accounts.json` 文件可以继续使用

### 快速 Docker 安装

1. **下载源代码** 并配置 `accounts.json`
2. **编辑 `config.json`** - 确保 `"headless": true`
3. **自定义 `compose.yaml`：**
    - 设置你的时区（`TZ` 变量）
    - 配置调度（`CRON_SCHEDULE`）- 可参考 [crontab.guru](https://crontab.guru)
    - 可选：设置 `RUN_ON_START=true` 以立即执行
4. **启动容器：** `docker compose up -d`
5. **查看日志：** `docker logs microsoft-rewards-script`

**注意：** 容器会在计划任务运行时随机延迟 5–50 分钟，以模拟更自然的行为。

---

## 📋 使用说明

-   **浏览器实例：** 如果你在未关闭浏览器窗口（headless=false）的情况下停止脚本，请使用任务管理器或 `npm run kill-chrome-win` 清理进程
-   **自动调度：** 建议每天至少运行两次，设置 `"runOnZeroPoints": false` 可在无积分时跳过
-   **多账号支持：** 脚本支持集群模式——在 `config.json` 中配置 `clusters`

---

## ⚙️ 配置参考

通过编辑 `src/config.json` 自定义脚本行为：

### 核心设置

| 设置              | 说明                       | 默认值                     |
| ----------------- | -------------------------- | -------------------------- |
| `baseURL`         | Microsoft Rewards 页面地址 | `https://rewards.bing.com` |
| `sessionPath`     | 会话/指纹存储位置          | `sessions`                 |
| `headless`        | 后台运行浏览器             | `false`（可见）            |
| `parallel`        | 同时运行移动/桌面任务      | `true`                     |
| `runOnZeroPoints` | 无积分时继续运行           | `false`                    |
| `clusters`        | 并发账号实例数             | `1`                        |

### 指纹设置

| 设置                      | 说明                 | 默认值  |
| ------------------------- | -------------------- | ------- |
| `saveFingerprint.mobile`  | 重用移动端浏览器指纹 | `false` |
| `saveFingerprint.desktop` | 重用桌面端浏览器指纹 | `false` |

### 任务设置

| 设置                       | 说明               | 默认值 |
| -------------------------- | ------------------ | ------ |
| `workers.doDailySet`       | 完成每日任务       | `true` |
| `workers.doMorePromotions` | 完成促销活动       | `true` |
| `workers.doPunchCards`     | 完成打卡活动       | `true` |
| `workers.doDesktopSearch`  | 执行桌面搜索       | `true` |
| `workers.doMobileSearch`   | 执行移动搜索       | `true` |
| `workers.doDailyCheckIn`   | 完成每日签到       | `true` |
| `workers.doReadToEarn`     | 完成阅读赚积分活动 | `true` |

### 搜索设置

| 设置                                     | 说明                   | 默认值     |
| ---------------------------------------- | ---------------------- | ---------- |
| `searchOnBingLocalQueries`               | 使用本地查询或在线获取 | `false`    |
| `searchSettings.useGeoLocaleQueries`     | 生成基于地理位置的查询 | `false`    |
| `searchSettings.scrollRandomResults`     | 随机滚动搜索结果       | `true`     |
| `searchSettings.clickRandomResults`      | 点击随机结果链接       | `true`     |
| `searchSettings.searchDelay`             | 搜索间隔（最小/最大）  | `3-5 分钟` |
| `searchSettings.retryMobileSearchAmount` | 移动搜索重试次数       | `2`        |

### 高级设置

| 设置                      | 说明                    | 默认值              |
| ------------------------- | ----------------------- | ------------------- |
| `globalTimeout`           | 操作超时时间            | `30s`               |
| `logExcludeFunc`          | 日志排除的函数          | `SEARCH-CLOSE-TABS` |
| `webhookLogExcludeFunc`   | webhook 排除的函数      | `SEARCH-CLOSE-TABS` |
| `proxy.proxyGoogleTrends` | 代理 Google Trends 请求 | `true`              |
| `proxy.proxyBingTerms`    | 代理 Bing Terms 请求    | `true`              |

### Webhook 设置

| 设置                        | 说明                 | 默认值  |
| --------------------------- | -------------------- | ------- |
| `webhook.enabled`           | 启用 Discord 通知    | `false` |
| `webhook.url`               | Discord webhook 地址 | `null`  |
| `conclusionWebhook.enabled` | 启用仅总结 webhook   | `false` |
| `conclusionWebhook.url`     | 总结 webhook 地址    | `null`  |

---

## ✨ 功能特性

**账号管理：**

-   ✅ 多账号支持
-   ✅ 会话存储与持久化
-   ✅ 支持双重验证（2FA）
-   ✅ 支持无密码登录

**自动化与控制：**

-   ✅ 无头浏览器操作
-   ✅ 集群支持（多账号同时运行）
-   ✅ 可配置任务选择
-   ✅ 代理支持
-   ✅ 自动调度（Docker）

**搜索与活动：**

-   ✅ 桌面与移动搜索
-   ✅ 模拟 Microsoft Edge 搜索
-   ✅ 地理定位搜索查询
-   ✅ 模拟滚动与点击链接
-   ✅ 完成每日任务
-   ✅ 促销活动
-   ✅ 打卡活动
-   ✅ 每日签到
-   ✅ 阅读赚积分活动

**测验与互动内容：**

-   ✅ 测验自动答题（10 分和 30-40 分题型）
-   ✅ This Or That 测验（随机答案）
-   ✅ ABC 测验自动答题
-   ✅ 投票完成
-   ✅ 点击奖励

**通知与监控：**

-   ✅ Discord webhook 集成
-   ✅ 专用总结 webhook
-   ✅ 全面日志记录
-   ✅ Docker 支持与监控

---

## ⚠️ 免责声明

**风险自负！** 使用自动化脚本可能导致你的 Microsoft Rewards 账号被暂停或封禁。

本脚本仅供学习交流使用。作者不对 Microsoft 采取的任何账号措施负责。

---

## 🤝 贡献说明

本项目主要供个人使用，但欢迎贡献。请确保任何更改都与现有配置系统兼容。
