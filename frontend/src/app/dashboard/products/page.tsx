'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  listCategories,
  listProducts,
  type Category,
  type Product,
} from '@/lib/api';

const CURRENCIES = ['BRL', 'USD', 'EUR'] as const;

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount / 100);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceCurrency, setPriceCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
  const [priceAmount, setPriceAmount] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function resetForm() {
    setName('');
    setCategoryId('');
    setPriceCurrency('BRL');
    setPriceAmount('');
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const amount = Math.round(parseFloat(priceAmount.replace(',', '.')) * 100);
    if (isNaN(amount) || amount < 0) {
      setError('Preço inválido');
      return;
    }
    setSubmitting(true);
    try {
      const product = await createProduct(
        { name, categoryId, priceCurrency, priceAmount: amount },
        imageFile,
      );
      setProducts((prev) => [product, ...prev]);
      resetForm();
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar produto');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este produto?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao remover');
    }
  }

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  if (loading) return <div className="p-8 text-gray-500 text-sm">Carregando…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo produto'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-gray-900">Novo produto</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Notebook Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
              <div className="flex gap-2">
                <select
                  value={priceCurrency}
                  onChange={(e) => setPriceCurrency(e.target.value as typeof priceCurrency)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  required
                  placeholder="0,00"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-xs file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50"
              />
            </div>
          </div>

          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="preview"
              className="h-28 w-28 object-cover rounded-xl border border-gray-200"
            />
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Criando…' : 'Criar produto'}
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum produto cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-3xl">
                  📦
                </div>
              )}

              <div className="p-4">
                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{categoryName(product.categoryId)}</p>
                <p className="text-sm font-medium text-blue-700 mt-2">
                  {formatPrice(product.price.amount, product.price.currency)}
                </p>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
