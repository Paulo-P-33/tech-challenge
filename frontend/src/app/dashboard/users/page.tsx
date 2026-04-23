"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  deleteUser,
  listUsers,
  me,
  type AppUser,
  type AuthUser,
  type Paginated,
} from "@/lib/api";
import {
  Button,
  Dropdown,
  InputPassword,
  InputText,
  Message,
  Paginator,
  type DropdownChangeEvent,
  type PaginatorPageChangeEvent,
} from "@uigovpe/components";

const LIMIT = 10;

const ROLE_OPTIONS = [
  { label: "Usuário", value: "user" },
  { label: "Administrador", value: "admin" },
];

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [result, setResult] = useState<Paginated<AppUser> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await listUsers(p, LIMIT);
      setResult(data);
      setPage(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    me()
      .then((u) => {
        setCurrentUser(u);
        if (u.role === "admin") {
          fetchPage(1);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [fetchPage]);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createUser({ name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      if (currentUser?.role === "admin") await fetchPage(page);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar usuário");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este usuário?")) return;
    try {
      await deleteUser(id);
      const currentCount = result?.data.length ?? 0;
      const nextPage = currentCount <= 1 && page > 1 ? page - 1 : page;
      await fetchPage(nextPage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao remover usuário");
    }
  }

  function handlePageChange(e: PaginatorPageChangeEvent) {
    fetchPage(e.page + 1);
  }

  const isAdmin = currentUser?.role === "admin";
  const users = result?.data ?? [];

  if (loading && !result)
    return (
      <div className="page-container text-gray-500 text-sm">Carregando…</div>
    );

  return (
    <div className="page-container">
      <div className="content-wrapper max-w-3xl">
        <div className="page-header">
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Gerenciar usuários do sistema"
              : "Criar novo usuário"}
          </p>
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
              Adicionar usuário
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome completo"
              disabled={submitting}
            />
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail"
              type="email"
              disabled={submitting}
            />
            <InputPassword
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Senha (mínimo 6 caracteres)"
              disabled={submitting}
              feedback={false}
            />
            {isAdmin && (
              <Dropdown
                value={role}
                options={ROLE_OPTIONS}
                onChange={(e: DropdownChangeEvent) =>
                  setRole(e.value as "user" | "admin")
                }
                placeholder="Perfil"
                disabled={submitting}
              />
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              label={submitting ? "…" : "Adicionar"}
              disabled={submitting}
            />
          </div>
        </form>

        {/* User list — admin only */}
        {isAdmin && (
          <>
            {loading && (
              <div className="text-sm text-gray-400 mb-6">Carregando…</div>
            )}

            {!loading && users.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-card border border-gray-200">
                <p className="text-base sm:text-lg text-gray-500">
                  Nenhum usuário cadastrado.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Adicione um usuário usando o formulário acima.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4 mb-8">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white border border-gray-200 rounded-card px-4 sm:px-6 py-4 sm:py-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base sm:text-lg font-medium text-gray-900 break-words">
                            {u.name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              u.role === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {u.role === "admin" ? "Admin" : "Usuário"}
                          </span>
                          {currentUser?.id === u.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 break-words">
                          {u.email}
                        </p>
                      </div>

                      {currentUser?.id !== u.id && (
                        <Button
                          label="Remover"
                          onClick={() => handleDelete(u.id)}
                          text
                          severity="danger"
                          size="small"
                          className="w-full sm:w-auto"
                        />
                      )}
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
          </>
        )}
      </div>
    </div>
  );
}
