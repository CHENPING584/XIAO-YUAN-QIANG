# Vercel 部署指南

由于 Vercel 是 Serverless 环境，不支持本地数据库（MySQL）和本地文件存储（Uploads），你需要进行以下配置才能成功部署。

## 1. 准备云数据库 (必须)

你需要一个公网可访问的 MySQL 数据库。推荐以下免费方案：
*   **TiDB Cloud** (推荐): 提供免费的 Serverless MySQL 兼容数据库。
*   **PlanetScale**: 也是优秀的选择。
*   **Supabase**: 提供 PostgreSQL (本项目是 MySQL，暂不推荐) 或使用其 Edge Functions。

### 获取数据库连接信息
注册并创建数据库后，你会获得类似以下的信息：
*   Host: `gateway01.us-west-2.prod.aws.tidbcloud.com`
*   User: `2D0.root`
*   Password: `xxxx`
*   Database: `test` (建议改为 campus_wall)
*   Port: `4000`

## 2. 准备云存储 (可选，但推荐)

Vercel 不支持保存上传的图片。建议使用：
*   **阿里云 OSS / 腾讯云 COS**
*   **七牛云**
*   **Cloudinary** (有免费额度)

*注：目前代码仍保留了本地上传逻辑，在 Vercel 上上传图片会成功但随即消失（因为容器是临时的）。建议后续修改 `uploadController.js` 对接对象存储。*

## 3. 部署步骤

1.  **Fork/Clone 仓库**: 确保代码在你的 GitHub 仓库中。
2.  **登录 Vercel**: 使用 GitHub 账号登录 [Vercel](https://vercel.com)。
3.  **新建项目 (Add New Project)**:
    *   导入你的 `XIAO-YUAN-QIANG` 仓库。
    *   **Framework Preset**: 选择 `Other` (或者 Vercel 会自动检测，但因为我们有自定义 `vercel.json`，它会按配置执行)。
    *   **Environment Variables** (环境变量): **非常重要！在此处填入你的云数据库信息**。
        *   `DB_HOST`: (你的云数据库地址)
        *   `DB_USER`: (用户名)
        *   `DB_PASSWORD`: (密码)
        *   `DB_NAME`: (数据库名)
        *   `DB_SSL`: `true` (通常云数据库需要 SSL)

4.  **点击 Deploy**。

## 4. 初始化数据库

由于无法直接连接本地数据库，你需要通过连接工具（如 Navicat, DBeaver）连接到你的**云数据库**，然后执行 `docs/campus_wall.sql` 中的建表语句。

## 5. 常见问题

*   **API 报错 500**: 检查 Vercel Logs，通常是数据库连接失败。请确认环境变量填写正确，且云数据库允许公网访问。
*   **页面 404**: 检查 `vercel.json` 的路由配置。
*   **图片不显示**: 如前所述，Vercel 不支持持久化文件存储。
