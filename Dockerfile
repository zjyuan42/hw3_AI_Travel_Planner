# 多阶段构建：前端构建阶段
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端package文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci --only=production

# 复制前端源代码
COPY frontend/ ./

# 构建前端应用
RUN npm run build

# 多阶段构建：后端构建阶段
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# 复制后端package文件
COPY backend/package*.json ./

# 安装后端依赖
RUN npm ci --only=production

# 复制后端源代码
COPY backend/ ./

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 安装生产环境依赖
RUN apk add --no-cache curl

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 从构建阶段复制文件
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/src ./backend/src
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/package.json ./backend/

# 复制根目录的package.json
COPY --chown=nextjs:nodejs package.json ./

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# 启动应用
CMD ["npm", "run", "start"]