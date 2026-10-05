import { apiFetch } from "./api";
import { Product, PaginationMeta } from "./products";
import { Category } from "./categories";
import { Order } from "./orders";
import { Review } from "./reviews";

export type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalReviews: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
};

export async function getDashboardStats(): Promise<{ stats: DashboardStats }> {
  return apiFetch<{ stats: DashboardStats }>("/admin/dashboard");
}

export async function getRecentOrders(): Promise<{ orders: Order[] }> {
  return apiFetch<{ orders: Order[] }>("/admin/recent-orders");
}

export async function getAdminProducts(params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: "active" | "inactive";
}): Promise<{ products: Product[]; pagination: PaginationMeta }> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  const qs = sp.toString();
  return apiFetch<{ products: Product[]; pagination: PaginationMeta }>(
    `/admin/products${qs ? `?${qs}` : ""}`
  );
}

export async function createProduct(data: {
  name: string;
  slug?: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  variants: { size: string; color: string; stock: number }[];
  isActive?: boolean;
}): Promise<{ message: string; product: Product }> {
  return apiFetch<{ message: string; product: Product }>("/products", {
    method: "POST",
    body: data,
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    variants: { size: string; color: string; stock: number }[];
    isActive: boolean;
  }>
): Promise<{ message: string; product: Product }> {
  return apiFetch<{ message: string; product: Product }>(`/products/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminCategories(): Promise<{ categories: Category[] }> {
  return apiFetch<{ categories: Category[] }>("/admin/categories");
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}): Promise<{ message: string; category: Category }> {
  return apiFetch<{ message: string; category: Category }>("/categories", {
    method: "POST",
    body: data,
  });
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
  }>
): Promise<{ message: string; category: Category }> {
  return apiFetch<{ message: string; category: Category }>(
    `/categories/admin/${id}`,
    {
      method: "PUT",
      body: data,
    }
  );
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/admin/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}): Promise<{ orders: Order[]; pagination: PaginationMeta }> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.status) sp.set("status", params.status);
  if (params?.paymentStatus) sp.set("paymentStatus", params.paymentStatus);
  const qs = sp.toString();
  return apiFetch<{ orders: Order[]; pagination: PaginationMeta }>(
    `/orders/admin/all${qs ? `?${qs}` : ""}`
  );
}

export async function getAdminOrderById(id: string): Promise<{ order: Order }> {
  return apiFetch<{ order: Order }>(`/orders/admin/${id}`);
}

export async function updateOrderStatus(
  id: string,
  orderStatus: string
): Promise<{ message: string; order: Order }> {
  return apiFetch<{ message: string; order: Order }>(
    `/orders/admin/${id}/status`,
    {
      method: "PUT",
      body: { orderStatus },
    }
  );
}

export async function getAdminReviews(params?: {
  page?: number;
  limit?: number;
  approved?: boolean;
}): Promise<{ reviews: Review[]; pagination: PaginationMeta }> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.approved !== undefined) sp.set("approved", String(params.approved));
  const qs = sp.toString();
  return apiFetch<{ reviews: Review[]; pagination: PaginationMeta }>(
    `/admin/reviews${qs ? `?${qs}` : ""}`
  );
}

export async function setReviewApproval(
  id: string,
  isApproved: boolean
): Promise<{ message: string; review: Review }> {
  return apiFetch<{ message: string; review: Review }>(
    `/admin/reviews/${id}/approval`,
    {
      method: "PUT",
      body: { isApproved },
    }
  );
}

export async function deleteAdminReview(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/reviews/${id}`, {
    method: "DELETE",
  });
}
