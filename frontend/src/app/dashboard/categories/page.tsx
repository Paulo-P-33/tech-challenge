'use client';

import { useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  listCategories,
  type Category,
} from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const category = await createCategory(name);
      setCategories((prev) => [...prev, category]);
      setName('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta categoria?')) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao remover');
    }
  }

  if (loading) return <div className="p-8 text-gray-500 text-sm">Carregando…</div>;

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Categorias</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome da categoria"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? '…' : 'Adicionar'}
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma categoria cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
            >
              <span className="text-sm font-medium text-gray-900">{c.name}</span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
