// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
             未定義URLアクセス時の制御
             ========================= */}

        {/* 存在しないパスへアクセスした場合、ログイン画面へ遷移 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
