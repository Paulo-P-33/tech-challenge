'use client';

import { useEffect, useState } from 'react';
import { listAuditLogs, type AuditLog } from '@/lib/api';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listAuditLogs()
      .then(setLogs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500 text-sm">Carregando…</div>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Logs de auditoria</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum log encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Ação</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Usuário</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Alvo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{log.userEmail ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {log.targetType ? `${log.targetType}/${log.targetId ?? '—'}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
