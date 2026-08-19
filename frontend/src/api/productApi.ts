// frontend/src/api/productApi.ts

import api from "./axios";

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface ProductImage {
  id?: string;
  productId?: string;
  url: string;
  sortOrder?: number;
}

export interface Product {
  id: string;
  sellerId?: string;
  categoryId: string;
  title: string;
  description: string;
  price: string | number;
  status: "LISTED" | "RESERVED" | "SOLD" | "HIDDEN";
  createdAt: string;
  images: ProductImage[];
  category?: Category;
  tags?: Tag[];
  seller?: {
    id: string;
    username: string;
    createdAt: string;
  };
}

export interface ProductSearchParams {
  categoryId?: string;
  keyword?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

/**
 * 1. 商品一覧取得 (GET /api/products)
 */
export const fetchProducts = (params?: ProductSearchParams) =>
  api.get<{ success: boolean; data: Product[] }>("/products", { params });

/**
 * 2. 商品詳細取得 (GET /api/products/:id)
 */
export const fetchProductById = (id: string) =>
  api.get<{ success: boolean; data: Product }>(`/products/${id}`);

/**
 * 3. 商品出品 (POST /api/products)
 */
export const createProduct = (data: {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  tagIds?: string[];
  imageUrls: string[];
}) => api.post<{ success: boolean; message: string; product: Product }>("/products", data);

/**
 * 4. 商品情報更新 (PUT /api/products/:id)
 */
export const updateProduct = (
  id: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    tagIds?: string[];
    imageUrls?: string[];
  },
) => api.put<{ success: boolean; message: string; product: Product }>(`/products/${id}`, data);

/**
 * 5. 商品下架 (DELETE /api/products/:id)
 */
export const deleteProduct = (id: string) =>
  api.delete<{ success: boolean; message: string; product: { id: string; status: string } }>(
    `/products/${id}`,
  );

/**
 * 6. カテゴリ一覧取得 (GET /api/categories)
 */
export const fetchCategories = () =>
  api.get<{ success: boolean; data: Category[] }>("/categories");

/**
 * 7. タグ一覧取得 (GET /api/tags)
 */
export const fetchTags = () =>
  api.get<{ success: boolean; data: Tag[] }>("/tags");

/**
 * 8. 画像アップロード (POST /api/upload)
 */
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<{ success: boolean; message: string; url: string }>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
