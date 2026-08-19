// frontend/src/pages/ProductSearch.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  fetchProducts,
  fetchCategories,
  type Product,
  type Category,
} from "../api/productApi";

export const ProductSearch = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选状态
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 加载分类树
  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error("分类加载失败:", err));
  }, []);

  // 将树形分类扁平化成带层级缩进的列表以供 Select 使用
  const flattenedCategories = React.useMemo(() => {
    const list: { id: string; name: string; level: number }[] = [];
    const traverse = (cats: Category[], level = 0) => {
      cats.forEach((c) => {
        list.push({ id: c.id, name: c.name, level });
        if (c.children && c.children.length > 0) {
          traverse(c.children, level + 1);
        }
      });
    };
    traverse(categories);
    return list;
  }, [categories]);

  // 查询商品
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts({
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("商品查询失败:", err);
      setError("商品一覧の取得に失敗しました。時間をおいて再試行してください。");
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部标题与功能简介 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">商品を探す</h1>
            <p className="text-sm text-slate-500 mt-1">
              ほしい商品を見つけて、お得にお買い物しましょう
            </p>
          </div>

          <Link
            to="/products/new"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>不用品を出品する</span>
          </Link>
        </div>

        {/* 搜索与多维过滤面板 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 关键词搜索 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  キーワード
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="何をお探しですか？（例：MacBook、ヘッドホン）"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* 分类下拉选择 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  カテゴリー
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  <option value="">すべてのカテゴリー</option>
                  {flattenedCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {"　".repeat(c.level) + (c.level > 0 ? "└ " : "") + c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 价格区间 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  価格帯 (¥)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <span className="text-slate-400 text-xs">〜</span>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 操作按钮区 */}
            <div className="flex justify-end items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                条件をクリア
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                検索する
              </button>
            </div>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* 商品列表展示 */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs animate-pulse"
              >
                <div className="w-full aspect-square bg-slate-200 rounded-xl mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🔍
            </div>
            <h3 className="text-base font-bold text-slate-800">該当する商品が見つかりませんでした</h3>
            <p className="text-sm text-slate-500 mt-1">
              検索条件を変更するか、条件をクリアして再度お試しください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage =
                product.images && product.images.length > 0
                  ? product.images[0].url
                  : "https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image";

              // 格式化图片 URL (若为本地相对路径，拼接后端主机)
              const imageUrl = primaryImage.startsWith("http")
                ? primaryImage
                : `http://localhost:3000${primaryImage}`;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  {/* 商品图片 */}
                  <div className="aspect-square w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/400x400/f1f5f9/94a3b8?text=Image+Error";
                      }}
                    />
                    {/* 分类标签 */}
                    {product.category && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium rounded-md">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  {/* 商品信息 */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-lg font-bold text-slate-900">
                        <span className="text-xs text-indigo-600 font-extrabold mr-0.5">¥</span>
                        {Number(product.price).toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-400">出品中</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductSearch;
