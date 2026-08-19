// frontend/src/pages/ProductDetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { fetchProductById, deleteProduct, type Product } from "../api/productApi";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // 获取当前登录用户
  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetchProductById(id)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setProduct(res.data.data);
        } else {
          setError("商品情報の取得に失敗しました。");
        }
      })
      .catch((err) => {
        console.error("商品详情获取失败:", err);
        setError("指定された商品は存在しないか、すでに取り下げられています。");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 下架商品
  const handleDelete = async () => {
    if (!product || !window.confirm("この商品を取り下げますか？（下架後、一覧には表示されなくなります）")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteProduct(product.id);
      if (res.data.success) {
        alert("商品を取り下げました。");
        navigate("/products");
      }
    } catch (err) {
      console.error("商品下架失败:", err);
      alert("商品の取り下げに失敗しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  const isSeller = currentUser && product && currentUser.id === product.seller?.id;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部返回导航栏 */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>商品検索画面へ戻る</span>
          </Link>
        </div>

        {/* 页面内容 */}
        {loading ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-10 bg-slate-200 rounded w-1/3" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">{error || "商品が見つかりません"}</h2>
            <Link
              to="/products"
              className="inline-block mt-4 px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700"
            >
              商品一覧に戻る
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
              {/* 左侧：相册大图与缩略图列表 */}
              <div className="flex flex-col gap-4">
                {/* 当前展示大图 */}
                <div className="aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={
                        product.images[selectedImageIndex]?.url?.startsWith("http")
                          ? product.images[selectedImageIndex].url
                          : `http://localhost:3000${product.images[selectedImageIndex]?.url}`
                      }
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}

                  {/* 状态徽章 */}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm">
                    {product.status === "LISTED" ? "出品中" : product.status}
                  </span>
                </div>

                {/* 缩略图列表 */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? "border-indigo-600 ring-2 ring-indigo-600/20"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={
                            img.url.startsWith("http")
                              ? img.url
                              : `http://localhost:3000${img.url}`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 右侧：商品信息详情与操作 */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* 分类路径 */}
                  {product.category && (
                    <div className="text-xs font-semibold text-indigo-600 tracking-wide mb-2 uppercase">
                      カテゴリー：{product.category.name}
                    </div>
                  )}

                  {/* 商品标题 */}
                  <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-3">
                    {product.title}
                  </h1>

                  {/* 价格 */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-indigo-600">¥</span>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-normal">(税込・送料込み)</span>
                  </div>

                  {/* 标签列表 */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-6">
                      <div className="text-xs font-medium text-slate-500 mb-2">タグ</div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 出品者信息 */}
                  {product.seller && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                          {product.seller.username?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-medium">出品者</div>
                          <div className="text-sm font-semibold text-slate-800">
                            {product.seller.username}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(product.createdAt).toLocaleDateString()} 出品
                      </div>
                    </div>
                  )}

                  {/* 商品详细描述 */}
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      商品の説明
                    </h3>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      {product.description}
                    </div>
                  </div>
                </div>

                {/* 底部操作按钮 */}
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                  {isSeller ? (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl border border-red-200 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "取り下げ中..." : "この商品を出品取り下げ（下架）する"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 px-4 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed text-center"
                    >
                      購入手続きへ（Phase 2 で実装予定）
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
