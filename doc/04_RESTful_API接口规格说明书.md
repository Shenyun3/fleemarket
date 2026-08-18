# 04. RESTful API 接口规格说明书

## 1. 接口设计原则与规范 (Design Philosophy)

本项目全面采用 **RESTful 架构风格**，遵循标准的 HTTP 动词语义、资源路径命名以及统一的 JSON 请求与响应报文规范。

### 1.1 HTTP 动词规范
- `GET`：安全幂等，用于检索资源（单条或列表）。
- `POST`：非幂等，用于新建资源（如发布商品、注册用户、提交订单）。
- `PUT`：幂等，用于全量或覆盖更新资源（如修改商品、编辑个人资料）。
- `DELETE`：用于逻辑删除或下架资源（如商品下架 `status -> HIDDEN`）。

### 1.2 统一响应报文格式 (Response Envelope)

#### 成功响应格式 (Success Envelope)
```json
{
  "success": true,
  "message": "操作成功提示信息（可选）",
  "data": { ... },     // 或具体实体对象，如 "product": { ... } / "user": { ... }
  "token": "..."      // 仅在登录/换票场景返回
}
```

#### 失败与异常响应格式 (Error Envelope)
```json
{
  "success": false,
  "error": "明确的用户友好错误信息描述"
}
```

### 1.3 常用 HTTP 状态码规范
| 状态码 | 含义 | 使用场景 |
| :--- | :--- | :--- |
| `200 OK` | 请求成功 | `GET` 查询成功、`PUT` / `DELETE` 更新成功 |
| `201 Created` | 资源创建成功 | `POST` 注册、发布商品、上传图片成功 |
| `400 Bad Request` | 客户端参数错误 | 必填字段缺失、密码复杂度不足、价格格式不合法 |
| `401 Unauthorized` | 身份未认证 / Token 过期 | 未携带 Authorization Header 或 Token 签名失效 |
| `403 Forbidden` | 权限不足 (水平/垂直越权) | 试图修改他人发布的商品、试图购买自己发布的商品 |
| `404 Not Found` | 资源不存在 | 请求的商品 ID 不存在或已被下架 |
| `500 Internal Error` | 服务端内部错误 | 数据库连接异常、未捕获的运行时异常 |

---

## 2. 核心接口详细规格 (API Specifications)

### 2.1 认证模块 (`/api/auth`)

#### 1. 用户注册 (`POST /api/auth/signup`)
- **权限**：公开 (无需 Token)
- **请求体 (Request Body)**：
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "username": "coder_bian"
}
```
- **密码规则**：8~24 位，必须同时包含大写字母、小写字母、数字及特殊符号。
- **响应体 (201 Created)**：
```json
{
  "success": true,
  "message": "ユーザー登録が完了しました。",
  "user": {
    "id": "e4587a8b-c9a8-4e12-87ad-72322301f221",
    "email": "user@example.com",
    "username": "coder_bian"
  }
}
```

#### 2. 用户登录 (`POST /api/auth/login`)
- **权限**：公开
- **请求体 (Request Body)**：
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **响应体 (200 OK)**：
```json
{
  "success": true,
  "message": "ログインに成功しました。",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e4587a8b-c9a8-4e12-87ad-72322301f221",
    "email": "user@example.com",
    "username": "coder_bian"
  }
}
```

---

### 2.2 用户与个人中心模块 (`/api/users`)

#### 1. 获取当前登录用户资料 (`GET /api/users/me`)
- **权限**：受保护 (Bearer Token)
- **响应体 (200 OK)**：
```json
{
  "success": true,
  "data": {
    "id": "e4587a8b-c9a8-4e12-87ad-72322301f221",
    "email": "user@example.com",
    "username": "coder_bian",
    "phone": "080-1234-5678",
    "address": "東京都千代田区...",
    "bio": "中古ガジェットを主に出品しています。",
    "createdAt": "2026-08-18T14:00:00.000Z"
  }
}
```

#### 2. 更新个人资料 (`PUT /api/users/me`)
- **权限**：受保护 (Bearer Token)
- **请求体 (Request Body)**：
```json
{
  "username": "coder_bian_updated",
  "phone": "090-9999-8888",
  "address": "東京都新宿区...",
  "bio": "即購入大歓迎です！"
}
```

---

### 2.3 商品管理与检索模块 (`/api/products`)

#### 1. 获取商品列表 (`GET /api/products`)
- **权限**：公开
- **查询参数 (Query Parameters)**：
  - `categoryId` (可选)：指定分类 UUID
  - `keyword` (可选)：标题模糊搜索词
  - `minPrice` (可选)：最低价格
  - `maxPrice` (可选)：最高价格
- **响应体 (200 OK)**：
```json
{
  "success": true,
  "data": [
    {
      "id": "c6204c34-bfbe-45a8-aef5-fc8d13264cb1",
      "title": "MacBook Air M2",
      "description": "美品です。箱と充電器付属。",
      "price": "98000.00",
      "status": "LISTED",
      "createdAt": "2026-08-18T14:30:00.000Z",
      "images": [
        {
          "url": "/uploads/85034655-c843-49b2-99ef-2bf3e9459c50.png"
        }
      ],
      "category": {
        "id": "a111...",
        "name": "ノートPC"
      }
    }
  ]
}
```

#### 2. 获取商品详情 (`GET /api/products/:id`)
- **权限**：公开
- **路径参数**：`id` 商品 UUID
- **响应体 (200 OK)**：
```json
{
  "success": true,
  "data": {
    "id": "c6204c34-bfbe-45a8-aef5-fc8d13264cb1",
    "title": "MacBook Air M2",
    "description": "バッテリー容量98%。目立った傷はありません。",
    "price": "98000.00",
    "status": "LISTED",
    "createdAt": "2026-08-18T14:30:00.000Z",
    "images": [
      { "id": "img1", "url": "/uploads/img1.png", "sortOrder": 0 },
      { "id": "img2", "url": "/uploads/img2.png", "sortOrder": 1 }
    ],
    "category": { "id": "cat1", "name": "ノートPC" },
    "tags": [{ "id": "tag1", "name": "Apple" }, { "id": "tag2", "name": "PC" }],
    "seller": {
      "id": "user1",
      "username": "tech_seller",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

#### 3. 发布商品 (`POST /api/products`)
- **权限**：受保护 (Bearer Token)
- **请求体 (Request Body)**：
```json
{
  "title": "Sony WH-1000XM5 ヘッドホン",
  "description": "ノイズキャンセリング対応、使用頻度少なめです。",
  "price": 28000,
  "categoryId": "488f28d8-795a-4e2b-8a71-6ebbcbb45f91",
  "tagIds": ["175c2e11-e408-410a-b27b-58611116c4e0"],
  "imageUrls": [
    "/uploads/65a3-sony-1.jpg",
    "/uploads/65a3-sony-2.jpg"
  ]
}
```
- **响应体 (201 Created)**：
```json
{
  "success": true,
  "message": "商品を出品しました。",
  "product": {
    "id": "d7411234-88aa-4bbb-8123-999999999999",
    "title": "Sony WH-1000XM5 ヘッドホン",
    "price": "28000.00",
    "status": "LISTED",
    "images": [ ... ],
    "tags": [ ... ]
  }
}
```

#### 4. 下架商品 (`DELETE /api/products/:id`)
- **权限**：受保护 (仅商品发布者本人)
- **水平越权防御 (IDOR 防护)**：若 `sellerId !== currentUserId`，返回 `403 Forbidden`。
- **响应体 (200 OK)**：
```json
{
  "success": true,
  "message": "商品を取り下げました（下架）。",
  "product": {
    "id": "d7411234-88aa-4bbb-8123-999999999999",
    "status": "HIDDEN"
  }
}
```

---

### 2.4 分类与标签元数据模块 (`/api/categories`, `/api/tags`)

#### 1. 获取全量分类树 (`GET /api/categories`)
- **权限**：公开
- **响应体 (200 OK)**：返回支持无限层级嵌套或平铺的分类列表。

#### 2. 获取常用标签列表 (`GET /api/tags`)
- **权限**：公开
- **响应体 (200 OK)**：返回全部预置标签（如「メンズ」「アウトドア」「新品未使用」）。

---

### 2.5 图片上传模块 (`/api/upload`)

#### 1. 上传商品图片 (`POST /api/upload`)
- **权限**：公开 / 登录用户
- **Content-Type**：`multipart/form-data`
- **校验**：大小限制 5MB，格式限制 JPG, PNG, WebP。
- **响应体 (201 Created)**：
```json
{
  "success": true,
  "message": "画像アップロード成功",
  "url": "/uploads/85034655-c843-49b2-99ef-2bf3e9459c50.png"
}
```
