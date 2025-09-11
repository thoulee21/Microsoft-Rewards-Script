# Microsoft-Rewards-Script
自动化的微软奖励脚本，这次使用 TypeScript、Cheerio 和 Playwright。

正在开发中，主要供个人使用！

## 如何设置 ##
1. 下载或克隆源代码
2. 将 `accounts.example.json` 改为 `accounts.json` 并添加您的账户详细信息
3. 根据您的喜好修改 `config.json`
4. 选择 nix 或非 nix 路径

### 如何设置（不使用 nix）###
5. 运行 `npm i` 安装包
6. 运行 `npm run build` 构建脚本
7. 运行 `npm run start` 启动构建的脚本

### 如何设置（使用 nix）##
5. 获取 [Nix](https://nixos.org/)
6. 运行 `./run.sh`
7. 就是这样！

## 注意事项 ##
- 如果您在没有先关闭浏览器窗口的情况下结束脚本（仅在 headless 为 false 时），您将留下占用资源的挂起的 chrome 实例。使用任务管理器杀死这些进程或使用包含的 `npm run kill-chrome-win` 脚本。（Windows）
- 如果您自动化此脚本，请将其设置为每天至少运行 2 次以确保它获取了所有任务，设置 `"runOnZeroPoints": false` 以便在未找到积分时不运行。

## Docker（实验性）##
### **开始之前**

- 如果您之前在本地构建并运行过脚本，请从您的 `Microsoft-Rewards-Script` 目录中**删除** `/node_modules` 和 `/dist` 文件夹。
- 如果您曾在旧版本脚本（例如 1.4）中使用过 Docker，请**删除**任何持久保存的 `config.json` 和会话文件夹。旧的 `accounts.json` 文件可以重复使用。

### **设置源文件**

1. **下载源代码**

2. **更新 `accounts.json`**

3. **编辑 `config.json`，**确保 "headless": true，其他设置根据您的偏好

### **自定义 `compose.yaml` 文件**

提供了一个基本的 docker `compose.yaml`。按照以下步骤配置和运行容器：

1. **设置您的时区：**调整 `TZ` 变量以确保正确的调度。
3. **自定义调度：**
   - 修改 `CRON_SCHEDULE` 设置运行时间。使用 [crontab.guru](https://crontab.guru) 获取帮助。
   - **注意：**容器为每个调度的开始时间添加 5-50 分钟的随机变化。这可以在 compose 文件中选择性地禁用或自定义。
4. **（可选）启动时运行：**
   - 设置 `RUN_ON_START=true` 在容器启动时立即执行脚本。
5. **启动容器：**运行 `docker compose up -d` 构建和启动。
6. **监控日志：**使用 `docker logs microsoft-rewards-script` 查看脚本执行并获取"无密码"登录代码。

## 配置 ## 
| 设置        | 描述           | 默认值  |
| :------------- |:-------------| :-----|
|  baseURL    | MS 奖励页面 | `https://rewards.bing.com` |
|  sessionPath    | 您希望存储会话/指纹的路径 | `sessions`（在 ./browser/sessions 中）|
|  headless    | 浏览器窗口是否应该可见或在后台运行 | `false`（浏览器可见）|
|  parallel    | 是否希望移动和桌面任务并行或顺序运行| `true` |
|  runOnZeroPoints    | 如果可获得 0 积分时运行脚本的其余部分 | `false`（在 0 积分时不会运行）|
|  clusters    | 启动时运行的实例数量，每个账户 1 个 | `1`（一次运行 1 个账户）|
|  saveFingerprint.mobile    | 每次重复使用相同的指纹 | `false`（每次生成新指纹）|
|  saveFingerprint.desktop    | 每次重复使用相同的指纹 | `false`（每次生成新指纹）|
|  workers.doDailySet    | 完成每日任务项目 | `true`  |
|  workers.doMorePromotions    | 完成促销项目 | `true`  |
|  workers.doPunchCards    | 完成打卡任务 | `true`  |
|  workers.doDesktopSearch    | 完成每日桌面搜索 | `true`  |
|  workers.doMobileSearch    | 完成每日移动搜索 | `true`  |
|  workers.doDailyCheckIn    | 完成每日签到活动 | `true`  |
|  workers.doReadToEarn    | 完成阅读赚取活动 | `true`  |
|  searchOnBingLocalQueries    | 使用 `queries.json` 或从此存储库获取完成"在 Bing 上搜索"活动 | `false`（将从此存储库获取）|
|  globalTimeout    | 操作超时前的时长 | `30s`   |
|  searchSettings.useGeoLocaleQueries    | 基于您的地理位置生成搜索查询 | `false`（使用 EN-US 生成的查询）|
|  searchSettings.scrollRandomResults    | 在搜索结果中随机滚动 | `true`   |
|  searchSettings.clickRandomResults    | 从搜索结果访问随机网站| `true`   |
|  searchSettings.searchDelay    | 搜索查询之间的最小和最大时间（毫秒）| `min: 3min`    `max: 5min` |
|  searchSettings.retryMobileSearchAmount     | 继续重试移动搜索的指定次数 | `2` |
|  logExcludeFunc | 从日志和 webhooks 中排除的函数 | `SEARCH-CLOSE-TABS` |
|  webhookLogExcludeFunc | 从 webhooks 日志中排除的函数 | `SEARCH-CLOSE-TABS` |
|  proxy.proxyGoogleTrends     | 启用或禁用通过设置的代理代理请求 | `true`（将被代理）|
|  proxy.proxyBingTerms     | 启用或禁用通过设置的代理代理请求 | `true`（将被代理）|
|  webhook.enabled     | 启用或禁用您设置的 webhook | `false` |
|  webhook.url     | 您的 Discord webhook URL | `null` |

## 功能 ##
- [x] 多账户支持
- [x] 会话存储
- [x] 2FA 支持
- [x] 无密码支持
- [x] 无头支持
- [x] Discord Webhook 支持
- [x] 桌面搜索
- [x] 可配置任务
- [x] Microsoft Edge 搜索
- [x] 移动搜索
- [x] 模拟滚动支持
- [x] 模拟链接点击支持
- [x] 地理位置搜索查询
- [x] 完成每日任务
- [x] 完成更多促销
- [x] 解决测验（10 点变体）
- [x] 解决测验（30-40 点变体）
- [x] 完成点击奖励
- [x] 完成投票
- [x] 完成打卡任务
- [x] 解决这个或那个测验（随机）
- [x] 解决 ABC 测验
- [x] 完成每日签到
- [x] 完成阅读赚取
- [x] 集群支持
- [x] 代理支持
- [x] Docker 支持（实验性）
- [x] 自动调度（通过 Docker）

## 免责声明 ##
使用此脚本可能使您的账户面临被禁止或暂停的风险，您已被警告！
<br /> 
使用此脚本风险自负！

