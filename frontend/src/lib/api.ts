const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function login(email: string, password: string) {
  const data = await request<{ user: AuthUser; accessToken: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  saveToken(data.accessToken);
  return data;
}

export async function me(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me');
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function listCategories(page = 1, limit = 10): Promise<Paginated<Category>> {
  return request<Paginated<Category>>(`/categories?page=${page}&limit=${limit}`);
}

export async function createCategory(name: string): Promise<Category> {
  return request<Category>('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await request<void>(`/categories/${id}`, { method: 'DELETE' });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: { currency: 'BRL' | 'USD' | 'EUR'; amount: number };
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listProducts(page = 1, limit = 10): Promise<Paginated<Product>> {
  return request<Paginated<Product>>(`/products?page=${page}&limit=${limit}`);
}

export async function createProduct(
  data: { name: string; categoryId: string; priceCurrency: string; priceAmount: number },
  imageFile?: File | null,
): Promise<Product> {
  const form = new FormData();
  form.append('name', data.name);
  form.append('categoryId', data.categoryId);
  form.append('priceCurrency', data.priceCurrency);
  form.append('priceAmount', String(data.priceAmount));
  if (imageFile) form.append('image', imageFile);

  return request<Product>('/products', { method: 'POST', body: form });
}

export async function updateProductImage(id: string, imageFile: File): Promise<Product> {
  const form = new FormData();
  form.append('image', imageFile);
  return request<Product>(`/products/${id}/image`, { method: 'PUT', body: form });
}

export async function deleteProduct(id: string): Promise<void> {
  await request<void>(`/products/${id}`, { method: 'DELETE' });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listUsers(): Promise<AppUser[]> {
  return request<AppUser[]>('/users');
}

export async function updateUserAvatar(id: string, imageFile: File): Promise<AppUser> {
  const form = new FormData();
  form.append('avatar', imageFile);
  return request<AppUser>(`/users/${id}/avatar`, { method: 'PUT', body: form });
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const result = await request<Paginated<AuditLog>>('/audit-logs?limit=100');
  return result.data;
}
