"use client";

import { useEffect, useRef, useState } from "react";
import { me, updateMyAvatar, updateMyProfile, type AuthUser } from "@/lib/api";
import {
  Button,
  InputPassword,
  InputText,
  Message,
} from "@uigovpe/components";

function Avatar({
  src,
  name,
  size = 96,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold select-none"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials || "?"}
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Avatar section
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Personal info section
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState("");

  // Password section
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    me()
      .then((u) => {
        setUser(u);
        setName(u.name);
        setEmail(u.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarSuccess(false);
    setAvatarError("");
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  }

  async function handleSaveAvatar(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!avatarFile) return;
    setAvatarError("");
    setAvatarSuccess(false);
    setSavingAvatar(true);
    try {
      const updated = await updateMyAvatar(avatarFile);
      setUser(updated);
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setAvatarSuccess(true);
    } catch (err: unknown) {
      setAvatarError(
        err instanceof Error ? err.message : "Erro ao atualizar foto"
      );
    } finally {
      setSavingAvatar(false);
    }
  }

  async function handleSaveInfo(e: React.SyntheticEvent) {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess(false);
    setSavingInfo(true);
    try {
      const updated = await updateMyProfile({ name, email });
      setUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      setInfoSuccess(true);
    } catch (err: unknown) {
      setInfoError(
        err instanceof Error ? err.message : "Erro ao salvar dados"
      );
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSavePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSavingPassword(true);
    try {
      await updateMyProfile({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : "Erro ao alterar senha"
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading)
    return (
      <div className="page-container text-gray-500 text-sm">Carregando…</div>
    );

  const displayAvatar = avatarPreview ?? user?.avatar ?? null;
  const displayName = user?.name ?? "";

  return (
    <div className="page-container">
      <div className="content-wrapper max-w-2xl">
        <div className="page-header">
          <h1 className="page-title">Meu Perfil</h1>
          <p className="page-subtitle">Gerencie suas informações pessoais</p>
        </div>

        {/* ── Avatar ─────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSaveAvatar}
          className="bg-white border border-gray-200 rounded-card p-safe mb-6"
        >
          <div className="border-b border-gray-100 pb-4 sm:pb-6 -m-4 sm:-m-6 md:-m-8 mb-4 sm:mb-6 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Foto de perfil
            </h2>
          </div>

          {avatarError && (
            <Message
              severity="error"
              text={avatarError}
              className="w-full mb-4"
            />
          )}
          {avatarSuccess && (
            <Message
              severity="success"
              text="Foto atualizada com sucesso."
              className="w-full mb-4"
            />
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <Avatar src={displayAvatar} name={displayName} size={96} />
            </div>

            <div className="flex-1 flex flex-col gap-3 w-full">
              <p className="text-sm text-gray-500">
                Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5 MB.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600
                    file:mr-3 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-gray-100 file:text-gray-700
                    hover:file:bg-gray-200 cursor-pointer"
                />
                <Button
                  type="submit"
                  label={savingAvatar ? "…" : "Salvar foto"}
                  disabled={!avatarFile || savingAvatar}
                  className="w-full sm:w-auto flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </form>

        {/* ── Dados pessoais ─────────────────────────────────────────── */}
        <form
          onSubmit={handleSaveInfo}
          className="bg-white border border-gray-200 rounded-card p-safe mb-6"
        >
          <div className="border-b border-gray-100 pb-4 sm:pb-6 -m-4 sm:-m-6 md:-m-8 mb-4 sm:mb-6 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Dados pessoais
            </h2>
          </div>

          {infoError && (
            <Message
              severity="error"
              text={infoError}
              className="w-full mb-4"
            />
          )}
          {infoSuccess && (
            <Message
              severity="success"
              text="Dados atualizados com sucesso."
              className="w-full mb-4"
            />
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <InputText
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setInfoSuccess(false);
                }}
                required
                placeholder="Nome completo"
                disabled={savingInfo}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              <InputText
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setInfoSuccess(false);
                }}
                required
                type="email"
                placeholder="seu@email.com"
                disabled={savingInfo}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">Perfil</label>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                    user?.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user?.role === "admin" ? "Administrador" : "Usuário"}
                </span>
                <span className="text-xs text-gray-400">
                  (não é possível alterar o perfil)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              label={savingInfo ? "…" : "Salvar dados"}
              disabled={savingInfo}
            />
          </div>
        </form>

        {/* ── Alterar senha ──────────────────────────────────────────── */}
        <form
          onSubmit={handleSavePassword}
          className="bg-white border border-gray-200 rounded-card p-safe"
        >
          <div className="border-b border-gray-100 pb-4 sm:pb-6 -m-4 sm:-m-6 md:-m-8 mb-4 sm:mb-6 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Alterar senha
            </h2>
          </div>

          {passwordError && (
            <Message
              severity="error"
              text={passwordError}
              className="w-full mb-4"
            />
          )}
          {passwordSuccess && (
            <Message
              severity="success"
              text="Senha alterada com sucesso."
              className="w-full mb-4"
            />
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Senha atual
              </label>
              <InputPassword
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
                required
                placeholder="Sua senha atual"
                disabled={savingPassword}
                feedback={false}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nova senha
              </label>
              <InputPassword
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
                required
                placeholder="Mínimo 6 caracteres"
                disabled={savingPassword}
                feedback={false}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Confirmar nova senha
              </label>
              <InputPassword
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
                required
                placeholder="Repita a nova senha"
                disabled={savingPassword}
                feedback={false}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              label={savingPassword ? "…" : "Alterar senha"}
              disabled={savingPassword}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
