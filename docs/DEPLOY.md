# 校园墙项目部署与配置指南

本项目包含三个主要部分：
1. **后端 API (backend)**: 基于 Node.js + Express + MySQL
2. **管理后台 (admin-web)**: 基于 Vue 3 + Element Plus
3. **微信小程序 (uniapp)**: 基于 UniApp + uView

## 1. 数据库配置

### 环境要求
- MySQL 5.7 或更高版本

### 步骤
1. 登录 MySQL 数据库。
2. 创建数据库 `campus_wall` 并导入表结构。
   - 使用提供的 SQL 文件：`docs/campus_wall.sql`
   - 命令示例：
     ```bash
     mysql -u root -p < docs/campus_wall.sql
     ```
   - 或者使用 Navicat 等工具直接运行 SQL 文件。

## 2. 后端服务部署 (backend)

### 环境要求
- Node.js 16+
- npm 或 yarn

### 步骤
1. 进入 `backend` 目录：
   ```bash
   cd backend
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 配置环境变量：
   - 复制 `.env.example` (如果不存在则直接编辑 `.env`) 为 `.env`
   - 编辑 `.env` 文件，填入正确的数据库信息和微信小程序配置：
     ```ini
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=你的数据库密码
     DB_NAME=campus_wall
     JWT_SECRET=随机生成的JWT密钥
     WX_APP_ID=你的微信小程序AppID
     WX_APP_SECRET=你的微信小程序AppSecret
     ```
4. 启动服务：
   - 开发模式 (推荐)：
     ```bash
     npm run dev
     ```
   - 生产模式：
     ```bash
     npm start
     ```
   - 服务将运行在 `http://localhost:3000`

## 3. 管理后台部署 (admin-web)

### 环境要求
- Node.js 16+

### 步骤
1. 进入 `admin-web` 目录：
   ```bash
   cd admin-web
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
   - 访问地址通常为 `http://localhost:8080`
   - 默认管理员账号：`admin` / `admin123` (在 `backend/controllers/adminController.js` 中硬编码，生产环境请修改为数据库验证)

### 生产环境构建
1. 构建静态文件：
   ```bash
   npm run build
   ```
2. 构建产物位于 `dist` 目录，可使用 Nginx 或任何静态文件服务器部署。

## 4. 微信小程序配置 (uniapp)

### 环境要求
- HBuilderX (推荐) 或 VS Code + UniApp 插件
- 微信开发者工具

### 步骤
1. 使用 HBuilderX 打开 `uniapp` 目录。
2. 配置 AppID：
   - 打开 `manifest.json` -> "微信小程序配置" -> 输入你的微信小程序 AppID。
3. 安装依赖 (如果使用了 npm 包，本项目目前主要依赖本地文件，uView 需按需引入，这里假设已包含或需自行下载 uView 核心库放入 `uniapp/uview-ui`，或者使用 npm 安装)：
   - **注意**：本项目示例代码使用了 uView 组件库的思路，但未包含 uView 源码。请务必前往 [uView 官网](https://www.uviewui.com/) 下载并安装到项目中，或将代码中的 uView 组件替换为原生组件。
   - 简单起见，示例代码主要使用了原生标签 `view`, `image`, `text` 等，兼容性较好。
4. 运行：
   - HBuilderX 顶部菜单 -> 运行 -> 运行到小程序模拟器 -> 微信开发者工具。

### 微信后台配置
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)。
2. 开发 -> 开发管理 -> 开发设置 -> 服务器域名：
   - request合法域名: `https://你的域名` (本地调试可勾选"不校验合法域名")
   - uploadFile合法域名: `https://你的域名`
   - downloadFile合法域名: `https://你的域名`
3. 确保后端服务已部署并配置了 HTTPS (生产环境必须)。

## 5. 项目运行流程

1. 启动 MySQL 数据库。
2. 启动 Backend 服务 (端口 3000)。
3. 启动 Admin Web (端口 8080)，登录后台，准备审核内容。
4. 启动 微信开发者工具，加载 Uniapp 编译后的代码。
5. 在小程序端进行“登录”、“发布投稿”。
6. 在管理后台查看“待审核”列表，点击“通过”。
7. 在小程序首页下拉刷新，查看已发布的投稿。

## 6. 注意事项

- **图片上传**：后端默认将图片存储在 `backend/uploads` 目录，生产环境建议使用对象存储 (OSS/COS)。
- **安全性**：
  - 请务必修改默认的 JWT Secret。
  - 生产环境请确保后端接口开启 HTTPS。
  - 管理员登录目前为 Mock 数据，请在 `backend/controllers/adminController.js` 中自行实现数据库验证逻辑。
- **uView UI**：小程序端代码示例中未深度使用 uView 特有组件，主要使用 UniApp 原生组件，如需使用 uView 请自行集成。
