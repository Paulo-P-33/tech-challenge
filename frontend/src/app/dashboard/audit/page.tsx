"use client";

import { useEffect, useState } from "react";
import { listAuditLogs, type AuditLog } from "@/lib/api";
import { Column, Message, Table } from "@uigovpe/components";

function renderAction(row: Readonly<AuditLog>) {
  return (
    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
      {row.action}
    </span>
  );
}

const renderUser = (row: AuditLog) => row.userEmail ?? "—";

const renderTarget = (row: AuditLog) =>
  row.targetType ? `${row.targetType}/${row.targetId ?? "—"}` : "—";

const renderDate = (row: AuditLog) =>
  new Date(row.createdAt).toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listAuditLogs()
      .then(setLogs)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Erro ao carregar"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="page-container text-gray-500 text-sm">Carregando…</div>
    );

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Logs de auditoria</h1>
          <p className="page-subtitle">
            Histórico de todas as ações do sistema
          </p>
        </div>

        {error && (
          <Message severity="error" text={error} className="w-full mb-6" />
        )}

        {/* Logs Table */}
        {logs.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-card border border-gray-200">
            <p className="text-base sm:text-lg text-gray-500">
              Nenhum log encontrado.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table
                value={logs}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 25, 50]}
                scrollable
                scrollHeight="flex"
                showRowsPerPage
                emptyMessage="Nenhum log encontrado."
                stripedRows
                responsiveLayout="scroll"
                size="small"
                tableStyle={{ minWidth: "600px" }}
              >
                <Column
                  header="Ação"
                  body={renderAction}
                  style={{ width: "120px" }}
                />
                <Column
                  field="userEmail"
                  header="Usuário"
                  body={renderUser}
                  style={{ minWidth: "160px" }}
                />
                <Column
                  header="Alvo"
                  body={renderTarget}
                  style={{ minWidth: "160px" }}
                />
                <Column
                  header="Data"
                  body={renderDate}
                  style={{ minWidth: "180px" }}
                />
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
