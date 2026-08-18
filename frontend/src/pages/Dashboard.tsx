// frontend/src/pages/Dashboard.tsx

import { useNavigate } from "react-router-dom";

/**
 * ダッシュボード画面
 *
 * ログインユーザー情報の表示およびログアウト機能を提供する。
 */
export const Dashboard = () => {
  const navigate = useNavigate();

  // ローカルストレージに保存されたユーザー情報を取得
  const userStr = localStorage.getItem("user");

  // JSON文字列をオブジェクトへ変換
  const user = userStr ? JSON.parse(userStr) : null;

  /**
   * ログアウト処理
   *
   * 認証情報を削除し、ログイン画面へ遷移する。
   */
  const handleLogout = () => {
    // JWTトークンを削除
    localStorage.removeItem("token");

    // ユーザー情報を削除
    localStorage.removeItem("user");

    // ログイン画面へ遷移
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =========================
           ヘッダーエリア
           ========================= */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* システムロゴ */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                Mercari Market
              </span>
            </div>

            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </nav>

      {/* =========================
           メインコンテンツ
           ========================= */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
          {/* ユーザー情報表示エリア */}
          <div className="flex items-center space-x-4">
            {/* ユーザーアイコン（ユーザー名の頭文字を表示） */}
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* ユーザー基本情報 */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                おかえりなさい、{user?.username || "ユーザー"} さん
              </h1>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          {/* 認証状態表示エリア */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-900 text-sm">
              ✨ <strong>JWT認証成功：</strong>
              ログインに成功しました。 現在、ProtectedRoute
              により保護された認証必須画面へアクセスしています。
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
