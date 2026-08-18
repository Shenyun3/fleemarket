# Q3 Backend Service

基于 Hono + Prisma + PostgreSQL 的 Monorepo 后端 API 服务，集成了基于 Vitest 的自动化集成测试以及 GitLab CI 自动化流水线。

---

## 🛠️ 技术栈

- **Runtime / Framework**: Node.js (v20+) / [Hono](https://hono.dev/)
- **Language**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Testing**: [Vitest](https://vitest.dev/)
- **Package Manager**: pnpm (Workspace Monorepo)
- **CI/CD**: GitLab CI (Shell Executor + Docker Service)

---

## 📁 项目目录结构

```text
kadai/Q3_Backend/
├── backend/                  # 后端源码目录
│   ├── src/
│   │   ├── controller/      # 业务逻辑控制器 (signup, login 等)
│   │   ├── lib/             # Prisma 实例与基础工具库
│   │   ├── routes/          # 路由定义与测试用例 (*.test.ts)
│   │   └── index.ts         # Hono 应用入口
│   ├── vitest.config.ts     # Vitest 测试配置文件
│   └── package.json
├── prisma/                  # 数据库 Schema & Migration 文件
│   └── schema.prisma
├── .gitlab-ci.yml           # GitLab CI 流水线配置文件
├── pnpm-workspace.yaml      # Monorepo 工作区配置
└── package.json             # 根目录 package.json
```

---

## 🚀 本地开发快速上手

### 1. 依赖安装

在项目根目录下执行：

```bash
pnpm install

```

### 2. 环境变量配置

在 `backend/` 目录下创建 `.env` 文件并配置数据库与 JWT 密钥：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/q3_db?schema=public"
JWT_SECRET="your-local-jwt-secret-key"
PORT=3000

```

### 3. 数据库 Sync (Prisma)

同步 Prisma Schema 到本地数据库：

```bash
pnpm --filter backend exec prisma db push

```

### 4. 启动开发服务器

```bash
pnpm --filter backend dev

```

---

## 🧪 自动化测试 (Vitest)

本项目采用**基于真实数据库的 API 集成测试策略**，通过 Hono 的 `app.request()` 在内存中模拟 HTTP 调用，无需占用网络端口。

### 运行本地测试

确保本地已启动 PostgreSQL，然后运行：

```bash
pnpm test

```

### 测试设计规范与注意事项

1. **测试环境隔离**：

- 测试运行期间不会触发 `serve()` 端口监听（依赖 `VITEST` 环境变量自动拦截）。
- 每次测试（`beforeEach`）会自动清空测试表数据，保障测试用例间零耦合。

1. **密码与 DTO 规范**：

- 注册接口密码校验需满足：8~24 位，且同时包含大写字母、小写字母、数字及特殊符号（如 `Password123!`）。

1. **构建产物排除**：

- `vitest.config.ts` 已配置排除 `dist/` 与 `node_modules/` 目录，避免编译产物导致测试重复运行。

---

## 🔄 CI/CD 流水线 (GitLab CI)

提交代码并推送至 GitLab 后，会自动触发三阶段（Three-Stage）Pipeline：

```text
[ 1. Lint ] ───> [ 2. Test ] ───> [ 3. Build ]

```

### CI 环境特点与隔离机制

- **Runner 模式**：Shell Executor 环境。
- **数据库隔离**：在 `test` 阶段自动在后台拉起临时的 `postgres:16-alpine` 容器，映射宿主机高位端口 `15432:5432`，避免端口占用冲突。
- **测试环境清理**：利用 `after_script` 钩子，无论测试 Success 还是 Fail，都会强制销毁临时 PostgreSQL 容器，避免资源残留。
