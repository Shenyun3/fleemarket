// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductSearch from "./pages/ProductSearch";
import ProductDetail from "./pages/ProductDetail";
import ProductCreate from "./pages/ProductCreate";

/**
 * アプリケーションのルーティング定義
 *
 * 画面遷移および認証制御を管理する。
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
             公開画面（認証不要）
             ========================= */}

        {/* ログイン画面 */}
        <Route path="/login" element={<Login />} />

        {/* ユーザー新規登録画面 */}
        <Route path="/register" element={<Register />} />

        {/* =========================
             保護対象画面（認証必須）
             ========================= */}

        {/* 商品検索・一覧画面 (Home) */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductSearch />
            </ProtectedRoute>
          }
        />

        {/* 商品出品画面 */}
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductCreate />
            </ProtectedRoute>
          }
        />

        {/* 商品詳細情報画面 */}
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        {/* ダッシュボード (ユーザー情報) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
             未定義URL・デフォルト遷移
             ========================= */}

        {/* 根路径默认重定向至商品检索 */}
        <Route path="/" element={<Navigate to="/products" replace />} />

        {/* 存在しないパスへアクセスした場合、商品検索画面へ遷移 */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
