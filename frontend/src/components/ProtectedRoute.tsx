// frontend/src/components/ProtectedRoute.tsx

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRouteコンポーネントのプロパティ定義
 *
 * childrenには画面表示対象のReactコンポーネントを指定する。
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 認証済みユーザーのみアクセス可能なルートガード
 *
 * ローカルストレージに保存されている認証トークンを確認し、
 * 未認証の場合はログイン画面へリダイレクトする。
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 保存済み認証トークンを取得
  const token = localStorage.getItem("token");

  /**
   * トークン未保持の場合
   * 未ログイン状態とみなし、ログイン画面へ遷移する。
   *
   * replace=true を指定することで、
   * ブラウザの履歴へ現在ページを残さない。
   */
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  /**
   * 認証済みの場合
   * 指定された子コンポーネントを表示する。
   */
  return children;
};
