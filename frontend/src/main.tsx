// アプリケーションのエントリーポイント

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/**
 * ReactアプリケーションをHTML上のroot要素へ描画する。
 *
 * StrictModeを有効化することで、
 * 非推奨APIの利用や潜在的な問題を開発時に検出しやすくする。
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* アプリケーションのルートコンポーネント */}
    <App />
  </StrictMode>,
);
