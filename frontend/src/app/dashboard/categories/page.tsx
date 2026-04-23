"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  type Category,
  type Paginated,
} from "@/lib/api";
import {
  Button,
  InputText,
  Message,
  Paginator,
  type PaginatorPageChangeEvent,
} from "@uigovpe/components";

const LIMIT = 10;

export default function CategoriesPage() {
  const [result, setResult] = useState<Paginated<Category> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await listCategories(p, LIMIT);
      setResult(data);
      setPage(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createCategory(name);
      setName("");
      await fetchPage(page);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta categoria?")) return;
    try {
      await deleteCategory(id);
      const currentCount = result?.data.length ?? 0;
      const nextPage = currentCount <= 1 && page > 1 ? page - 1 : page;
      await fetchPage(nextPage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  function handlePageChange(e: PaginatorPageChangeEvent) {
    fetchPage(e.page + 1);
  }

  const categories = result?.data ?? [];

  if (loading && !result)
    return (
      <div className="page-container text-gray-500 text-sm">Carregando…</div>
    );

  return (
    <div className="page-container">
      <div className="content-wrapper max-w-3xl">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">Gerenciar categorias de produtos</p>
        </div>

        {error && (
          <Message severity="error" text={error} className="w-full mb-6" />
        )}

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-card p-safe mb-8"
        >
          <div className="border-b border-gray-100 pb-4 sm:pb-6 -m-4 sm:-m-6 md:-m-8 mb-4 sm:mb-6 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Adicionar categoria
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <InputText
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nome da categoria"
                disabled={submitting}
              />
            </div>
            <Button
              type="submit"
              label={submitting ? "…" : "Adicionar"}
              disabled={submitting}
              className="w-full sm:w-auto"
            />
          </div>
        </form>

        {loading && (
          <div className="text-sm text-gray-400 mb-6">Carregando…</div>
        )}

        {/* List of categories */}
        {!loading && categories.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-card border border-gray-200">
            <p className="text-base sm:text-lg text-gray-500">
              Nenhuma categoria cadastrada.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Adicione uma categoria usando o formulário acima.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 mb-8">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white border border-gray-200 rounded-card px-4 sm:px-6 py-4 sm:py-5 hover:shadow-sm transition-shadow"
                >
                  <span className="text-base sm:text-lg font-medium text-gray-900 break-words">
                    {c.name}
                  </span>
                  <Button
                    label="Remover"
                    onClick={() => handleDelete(c.id)}
                    text
                    severity="danger"
                    size="small"
                    className="w-full sm:w-auto"
                  />
                </div>
              ))}
            </div>

            {result && result.totalPages > 1 && (
              <div className="pt-6 sm:pt-8 border-t border-gray-200">
                <Paginator
                  first={(page - 1) * LIMIT}
                  rows={LIMIT}
                  totalRecords={result.total}
                  onPageChange={handlePageChange}
                  showRowsPerPage={false}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
