"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { Button, InputText, InputPassword, Message } from "@uigovpe/components";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 py-8">
      <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Tech Challenge
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div>
            <InputText
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full"
            />
          </div>

          <div>
            <InputPassword
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          {error && (
            <Message severity="error" text={error} className="w-full" />
          )}

          <Button
            type="submit"
            label={loading ? "Entrando…" : "Entrar"}
            disabled={loading}
            className="w-full h-12 sm:h-14 text-base sm:text-lg"
          />
        </form>

        <p className="text-xs sm:text-sm text-gray-400 text-center mt-6">
          Demo: admin@example.com / change-me-please
        </p>
      </div>
    </div>
  );
}
