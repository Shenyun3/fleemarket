// frontend/src/components/Navbar.tsx

import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 左侧 Logo */}
          <div className="flex items-center gap-6">
            <Link to="/products" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                F
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                FleaMarket
              </span>
            </Link>
          </div>

          {/* 右侧操作区：出品按钮 + 用户信息 + 登出 */}
          <div className="flex items-center gap-4">
            <Link
              to="/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow-md active:scale-98"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>出品する</span>
            </Link>

            {/* 用户昵称与头像 */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {user?.username || "ユーザー"}
              </span>
            </div>

            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
