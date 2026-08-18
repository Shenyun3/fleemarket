// frontend/src/pages/Login.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import axios from "axios";

/**
 * ログイン画面
 *
 * ユーザー認証を行い、
 * 認証成功時はダッシュボード画面へ遷移する。
 */
export const Login = () => {
  // 画面遷移用フック
  const navigate = useNavigate();

  /**
   * ログインフォーム入力値
   */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * エラーメッセージ
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * ログイン処理実行中フラグ
   *
   * 二重送信防止およびボタン表示制御に利用する。
   */
  const [loading, setLoading] = useState(false);

  /**
   * 入力項目変更時の処理
   *
   * 対象フィールドの値のみ更新し、
   * その他の入力値は保持する。
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * ログインボタン押下時の処理
   *
   * 認証APIを呼び出し、
   * 認証成功時は認証情報を保存後、
   * ダッシュボード画面へ遷移する。
   */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    // ブラウザ標準のフォーム送信を抑止
    e.preventDefault();

    // 前回のエラーメッセージをクリア
    setError(null);

    // ローディング状態開始
    setLoading(true);

    try {
      /**
       * ログインAPI実行
       */
      const res = await api.post("/auth/login", formData);

      /**
       * 認証成功時
       */
      if (res.data.success && res.data.token) {
        // JWTトークン保存
        localStorage.setItem("token", res.data.token);

        // ログインユーザー情報保存
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // ダッシュボード画面へ遷移
        navigate("/dashboard");
      }
    } catch (err) {
      let errorMsg =
        "ログインに失敗しました。メールアドレスまたはパスワードを確認してください。";

      /**
       * Axios例外の場合、
       * サーバー側のエラーメッセージを優先表示する。
       */
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }

      setError(errorMsg);
    } finally {
      // ローディング状態終了
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 画面タイトル */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          ようこそ
        </h2>

        {/* 画面説明 */}
        <p className="mt-2 text-center text-sm text-slate-600">
          サービス利用のためログインしてください
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-slate-100">
          {/* エラーメッセージ表示エリア */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ログインフォーム */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* メールアドレス入力欄 */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                メールアドレス
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            {/* パスワード入力欄 */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                パスワード
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          {/* 新規登録画面への導線 */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">アカウントをお持ちでない方</span>{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
