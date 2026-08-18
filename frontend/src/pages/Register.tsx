// frontend/src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import axios from "axios";

/**
 * ユーザー新規登録画面
 *
 * ユーザー情報を登録し、
 * 登録成功後はログイン画面へ遷移する。
 */
export const Register = () => {
  // 画面遷移用フック
  const navigate = useNavigate();

  /**
   * ユーザー登録フォーム入力値
   */
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  /**
   * エラーメッセージ
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * 登録処理実行中フラグ
   *
   * 二重送信防止およびボタン表示制御に利用する。
   */
  const [loading, setLoading] = useState(false);

  /**
   * 入力項目変更時処理
   *
   * 変更対象項目のみ更新し、
   * その他入力値は保持する。
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * ユーザー登録処理
   *
   * 登録APIを呼び出し、
   * 登録成功後にログイン画面へ遷移する。
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // ブラウザ標準のフォーム送信を抑止
    e.preventDefault();

    // 前回表示したエラーメッセージをクリア
    setError(null);

    // ローディング状態開始
    setLoading(true);

    try {
      /**
       * ユーザー登録API実行
       */
      const res = await api.post("/auth/signup", formData);

      /**
       * 登録成功時
       */
      if (res.data.success) {
        // ログイン画面へ遷移
        navigate("/login");
      }
    } catch (err) {
      let errorMsg =
        "ユーザー登録に失敗しました。しばらくしてから再度お試しください。";

      /**
       * Axios例外の場合、
       * サーバー側エラーメッセージを優先表示する。
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
          アカウント作成
        </h2>

        {/* 画面説明 */}
        <p className="mt-2 text-center text-sm text-slate-600">
          フリーマーケットサービスへ参加するためのユーザー登録
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

          {/* ユーザー登録フォーム */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* ユーザー名入力欄 */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                ユーザー名
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="coder_bian"
              />
            </div>

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
                placeholder="英大文字・英小文字・数字・記号を含めてください"
              />
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </form>

          {/* ログイン画面への導線 */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">すでにアカウントをお持ちの方</span>{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ログインはこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
