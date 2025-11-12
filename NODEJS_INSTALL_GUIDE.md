# Node.js 安装指南

## Windows 系统安装 Node.js

### 方法一：官方安装包（推荐）

1. **访问 Node.js 官网**
   - 打开 [https://nodejs.org/](https://nodejs.org/)
   - 下载 LTS（长期支持）版本

2. **运行安装程序**
   - 双击下载的 `.msi` 文件
   - 按照安装向导完成安装
   - **重要**：勾选 "Automatically install the necessary tools" 选项

3. **验证安装**
   打开命令提示符（CMD）或 PowerShell，运行：
   ```cmd
   node --version
   npm --version
   ```

### 方法二：使用包管理器

#### 使用 Chocolatey（如果已安装）：
```cmd
choco install nodejs
```

#### 使用 Scoop：
```cmd
scoop install nodejs
```

### 方法三：使用 NVM（Node Version Manager）

1. **安装 NVM for Windows**
   - 下载地址：https://github.com/coreybutler/nvm-windows/releases
   - 下载 `nvm-setup.exe` 并安装

2. **安装 Node.js**
   ```cmd
   nvm install lts
   nvm use lts
   ```

## 安装后配置

### 1. 配置 npm 镜像（加速下载）
```cmd
npm config set registry https://registry.npmmirror.com
```

### 2. 验证环境
```cmd
node --version    # 应该显示版本号，如 v18.x.x
npm --version     # 应该显示版本号，如 9.x.x
```

## 安装项目依赖

### 1. 安装后端依赖
```cmd
cd backend
npm install
```

### 2. 安装前端依赖
```cmd
cd frontend
npm install
```

## 运行项目

### 开发模式运行
```cmd
# 后端（端口5001）
cd backend
npm run dev

# 前端（端口5173）
cd frontend
npm run dev
```

### 生产模式运行
```cmd
# 构建前端
cd frontend
npm run build

# 启动后端
cd backend
npm start
```

## 常见问题解决

### 1. 权限问题
如果遇到权限错误，以管理员身份运行命令提示符。

### 2. 端口占用
如果端口被占用，可以修改配置文件中的端口号。

### 3. 依赖安装失败
- 清除 npm 缓存：`npm cache clean --force`
- 删除 `node_modules` 文件夹和 `package-lock.json`，重新运行 `npm install`

### 4. 环境变量问题
确保已正确配置 `.env` 文件中的环境变量。

## 验证安装成功

安装完成后，运行以下命令验证：
```cmd
node --version    # 应该显示版本号
npm --version     # 应该显示版本号
cd backend && npm run dev    # 后端应该正常启动
cd frontend && npm run dev   # 前端应该正常启动
```

现在您可以按照这个指南安装 Node.js，然后运行 AI 旅行规划器项目！