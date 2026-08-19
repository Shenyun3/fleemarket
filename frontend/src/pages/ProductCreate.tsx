// frontend/src/pages/ProductCreate.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  fetchCategories,
  fetchTags,
  uploadImage,
  createProduct,
  type Category,
  type Tag,
} from "../api/productApi";

export const ProductCreate = () => {
  const navigate = useNavigate();

  // 元数据状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // 表单状态
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // UI 交互状态
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化加载分类与标签
  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch((err) => console.error("加载分类失败:", err));

    fetchTags()
      .then((res) => {
        if (res.data.success) setTags(res.data.data);
      })
      .catch((err) => console.error("加载标签失败:", err));
  }, []);

  // 扁平化分类树供 Select 展示
  const flattenedCategories = useMemo(() => {
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

  // 处理图片选择并上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setError(`「${file.name}」のサイズが5MBを超えています。`);
          continue;
        }
        const res = await uploadImage(file);
        if (res.data.success && res.data.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("图片上传失败:", err);
      setError("画像のアップロードに失敗しました。画像形式(JPG, PNG, WebP)をご確認ください。");
    } finally {
      setIsUploading(false);
      // 清空 input 避免无法重复选择同一张图
      e.target.value = "";
    }
  };

  // 移除已上传图片
  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 切换标签选中状态
  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  // 提交发布商品
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 表单验证
    if (!title.trim()) return setError("商品名を入力してください。");
    if (!description.trim()) return setError("商品の説明を入力してください。");
    if (!categoryId) return setError("カテゴリーを選択してください。");
    if (!price || Number(price) <= 0) return setError("販売価格を正しく入力してください。");
    if (imageUrls.length === 0) return setError("商品画像を最低1枚アップロードしてください。");

    setIsSubmitting(true);

    try {
      const res = await createProduct({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId,
        tagIds: selectedTagIds,
        imageUrls,
      });

      if (res.data.success && res.data.product) {
        // 出品完了後は自動的にその商品の「商品情報画面」に遷移する
        navigate(`/products/${res.data.product.id}`);
      }
    } catch (err: unknown) {
      console.error("商品发布失败:", err);
      let errorMsg = "商品の出品に失敗しました。もう一度お試しください。";
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { error?: string } } }).response;
        if (response?.data?.error) {
          errorMsg = response.data.error;
        }
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部返回导航 */}
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

        {/* 出品表单卡片 */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-slate-900">商品の情報を入力</h1>
            <p className="text-sm text-slate-500 mt-1">
              必要な情報を入力して出品ボタンを押してください
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. 商品画像アップロード */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                出品画像 <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-slate-500 ml-2">最大5枚・1枚あたり5MB以下</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100"
                  >
                    <img
                      src={url.startsWith("http") ? url : `http://localhost:3000${url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">
                        主図
                      </span>
                    )}
                  </div>
                ))}

                {imageUrls.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span className="text-xs text-slate-500 mt-1 font-medium">
                      {isUploading ? "アップロード中..." : "画像を追加"}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* 2. 商品名 */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                商品名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="40文字以内（例：MacBook Air M2 16GB/512GB）"
                maxLength={40}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* 3. カテゴリー */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="">カテゴリーを選択してください</option>
                {flattenedCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {"　".repeat(c.level) + (c.level > 0 ? "└ " : "") + c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. タグ (複数選択) */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  タグ（複数選択可）
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. 商品の説明 */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                商品の説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="色、素材、重さ、定価、注意点など（例：2023年に購入し、半年ほど使用しました。目立った傷はなく綺麗です。）"
                rows={5}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* 6. 販売価格 */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                販売価格 (¥) <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">¥</span>
                <input
                  type="number"
                  min="1"
                  max="9999999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="300 〜 9,999,999"
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-bold transition-all"
                />
              </div>
            </div>

            {/* 7. 出品ボタン */}
            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? "出品処理中..." : "この内容で出品する"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductCreate;
