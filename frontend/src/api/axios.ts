// frontend/src/api/axios.ts

import axios from "axios";

/**
 * Axios共通インスタンス
 * フロントエンドからバックエンドAPIへアクセスする際に利用する。
 */
const api = axios.create({
  // バックエンドAPIのベースURL
  baseURL: "http://localhost:3000/api",

  // 共通リクエストヘッダー
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * リクエストインターセプター
 *
 * 全APIリクエスト送信前に実行される。
 * ローカルストレージに保存されたJWTトークンが存在する場合、
 * Authorizationヘッダーへ自動付与する。
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      // 認証用JWTトークンをリクエストヘッダーへ設定
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  // リクエスト生成時のエラーを呼び出し元へ返却
  (error) => Promise.reject(error),
);

/**
 * レスポンスインターセプター
 *
 * 全APIレスポンス受信後に実行される。
 * 認証エラー（HTTP 401）が発生した場合、
 * ログイン状態を破棄しログイン画面へ遷移させる。
 */
api.interceptors.response.use(
  // 正常レスポンスはそのまま返却
  (response) => response,

  (error) => {
    // HTTP 401（認証失敗・トークン有効期限切れ）の場合
    if (error.response && error.response.status === 401) {
      // 保存済みトークンを削除
      localStorage.removeItem("token");

      // ログイン画面以外からアクセスした場合のみリダイレクト
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // エラーを呼び出し元へ返却
    return Promise.reject(error);
  },
);

export default api;
