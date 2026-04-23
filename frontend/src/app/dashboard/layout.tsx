"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, me, type AuthUser } from "@/lib/api";
import {
  AdminSideBar,
  AdminUserBar,
  LayoutProvider,
  useLayout,
  useWindowSize,
  type MenuAction,
  type SidebarSectionProps,
} from "@uigovpe/components";

function DashboardShell({
  children,
  user,
  sections,
  menuActions,
}: Readonly<{
  children: React.ReactNode;
  user: AuthUser | null;
  sections: SidebarSectionProps[];
  menuActions: MenuAction;
}>) {
  const { collapsed, toggleCollapsed } = useLayout();
  const { width } = useWindowSize();

  const isMobileSidebar = width <= 1024;
  const showOverlay = isMobileSidebar && !collapsed;
  let contentPaddingClass = "pl-0";

  if (!isMobileSidebar) {
    contentPaddingClass = collapsed ? "pl-[4.5rem]" : "pl-[4.75rem]";
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      {showOverlay && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={toggleCollapsed}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      <AdminSideBar
        title="Gov PE"
        version="1.0.0"
        sections={sections}
        className="!z-[60]"
        ui={
          isMobileSidebar
            ? {
                container: {
                  style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100dvh",
                    width: collapsed ? 0 : "20rem",
                  },
                },
              }
            : undefined
        }
      />

      <div
        className={`flex flex-col flex-1 min-w-0 w-full overflow-hidden bg-gray-50 transition-all duration-200 ${contentPaddingClass}`}
      >
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex-1 ml-3">
              <AdminUserBar
                user={{ name: user?.name ?? "", profile: user?.role ?? "" }}
                menuActions={menuActions}
                avatarImage={user?.avatar ?? undefined}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => router.push("/login"));
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const adminItems =
    user?.role === "admin"
      ? [
          {
            id: "audit",
            title: "Auditoria",
            icon: "assignment" as const,
            link: "/dashboard/audit",
          },
        ]
      : [];

  const sections: SidebarSectionProps[] = [
    {
      id: "products",
      title: "Produtos",
      icon: "inventory_2",
      link: "/dashboard/products",
    },
    {
      id: "categories",
      title: "Categorias",
      icon: "category",
      link: "/dashboard/categories",
    },
    {
      id: "users",
      title: "Usuários",
      icon: "group" as const,
      link: "/dashboard/users",
    },
    ...adminItems,
  ];

  const menuActions: MenuAction = [{ label: "Sair", command: handleLogout }];

  return (
    <LayoutProvider breakpoint={1024}>
      <DashboardShell user={user} sections={sections} menuActions={menuActions}>
        {children}
      </DashboardShell>
    </LayoutProvider>
  );
}
