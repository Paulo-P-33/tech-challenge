"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  listCategories,
  listProducts,
  type Category,
  type Paginated,
  type Product,
} from "@/lib/api";
import {
  Button,
  Card,
  Dropdown,
  type DropdownChangeEvent,
  InputFile,
  InputText,
  Message,
  Paginator,
  type PaginatorPageChangeEvent,
} from "@uigovpe/components";

const CURRENCIES = ["BRL", "USD", "EUR"] as const;
const LIMIT = 10;

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    amount / 100,
  );
}

export default function ProductsPage() {
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<"BRL" | "USD" | "EUR">(
    "BRL",
  );
  const [priceAmount, setPriceAmount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await listProducts(p, LIMIT);
      setResult(data);
      setPage(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listCategories(1, 100)
      .then((r) => setCategories(r.data))
      .catch(() => {});
    fetchProducts(1);
  }, [fetchProducts]);

  function handleFileChange(files: FileList | null) {
    const file = files?.[0] ?? null;
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
    setName("");
    setCategoryId("");
    setPriceCurrency("BRL");
    setPriceAmount("");
    setImageFile(null);
    setImagePreview(null);
    setFileKey((k) => k + 1);
  }

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    const amount = Math.round(
      Number.parseFloat(priceAmount.replace(",", ".")) * 100,
    );
    if (Number.isNaN(amount) || amount < 0) {
      setError("Preço inválido");
      return;
    }
    setSubmitting(true);
    try {
      await createProduct(
        { name, categoryId, priceCurrency, priceAmount: amount },
        imageFile,
      );
      resetForm();
      setShowForm(false);
      await fetchProducts(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar produto");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este produto?")) return;
    try {
      await deleteProduct(id);
      const currentCount = result?.data.length ?? 0;
      const nextPage = currentCount <= 1 && page > 1 ? page - 1 : page;
      await fetchProducts(nextPage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  function handlePageChange(e: PaginatorPageChangeEvent) {
    fetchProducts(e.page + 1);
  }

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  const currencyOptions = CURRENCIES.map((c) => ({ label: c, value: c }));

  const products = result?.data ?? [];

  if (loading && !result)
    return (
      <div className="page-container text-gray-500 text-sm">Carregando…</div>
    );

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="page-title">Produtos</h1>
              <p className="page-subtitle">Gerenciar produtos do catálogo</p>
            </div>
            <Button
              label={showForm ? "Cancelar" : "+ Novo produto"}
              onClick={() => setShowForm((v) => !v)}
              outlined={showForm}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {error && (
          <Message severity="error" text={error} className="w-full mb-6" />
        )}

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 bg-white border border-gray-200 rounded-card p-safe space-y-4 sm:space-y-6"
          >
            <div className="border-b border-gray-100 pb-4 sm:pb-6 -m-4 sm:-m-6 md:-m-8 mb-0 p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Novo produto
              </h2>
            </div>

            {/* Form Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <InputText
                  label="Nome do produto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Notebook Pro"
                />
              </div>

              <div>
                <Dropdown
                  label="Categoria"
                  options={categoryOptions}
                  value={categoryId}
                  onChange={(e: DropdownChangeEvent) =>
                    setCategoryId(e.value as string)
                  }
                  placeholder="Selecione…"
                  required
                />
              </div>

              <div>
                <Dropdown
                  label="Moeda"
                  options={currencyOptions}
                  value={priceCurrency}
                  onChange={(e: DropdownChangeEvent) =>
                    setPriceCurrency(e.value as typeof priceCurrency)
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <InputText
                  label="Valor"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  required
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* File upload */}
            <div>
              <InputFile
                key={fileKey}
                label="Imagem (opcional)"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="flex justify-center sm:justify-start pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-40 w-40 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-2 border-t border-gray-100 mt-6">
              <Button
                type="button"
                label="Cancelar"
                outlined
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="w-full sm:w-auto"
              />
              <Button
                type="submit"
                label={submitting ? "Criando…" : "Criar produto"}
                disabled={submitting}
                className="w-full sm:w-auto"
              />
            </div>
          </form>
        )}

        {/* Products section */}
        {loading && (
          <div className="text-sm text-gray-400 mb-6">Carregando…</div>
        )}

        {/* Products Grid - Mobile First Responsive */}
        {!loading && products.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-card border border-gray-200">
            <p className="text-base sm:text-lg text-gray-500">
              Nenhum produto cadastrado.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Clique em "+ Novo produto" para começar.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  header={
                    product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 sm:h-48 md:h-56 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 md:h-56 bg-gray-100 flex items-center justify-center text-gray-400 text-4xl sm:text-5xl">
                        📦
                      </div>
                    )
                  }
                  className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 flex flex-col">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryName(product.categoryId)}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-blue-600 mt-auto pt-4">
                      {formatPrice(
                        product.price.amount,
                        product.price.currency,
                      )}
                    </p>
                  </div>
                  <Button
                    label="Remover"
                    onClick={() => handleDelete(product.id)}
                    text
                    severity="danger"
                    size="small"
                    className="mt-4 w-full text-xs sm:text-sm"
                  />
                </Card>
              ))}
            </div>

            {result && result.totalPages > 1 && (
              <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
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
