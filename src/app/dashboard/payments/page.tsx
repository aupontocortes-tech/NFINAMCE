"use client";
import React, { useEffect, useMemo, useState } from "react";

type ChargeRow = {
  cobranca_id: number;
  aluno_id: number;
  nome: string;
  telefone?: string;
  mes: string;
  valor_total: number;
  vencimento: string;
  status: string;
  valor_pago: number;
  ultima_data?: string;
  ultimo_metodo?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export default function PaymentsPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<ChargeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAReceber = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.valor_total) || 0), 0), [rows]);
  const totalPago = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.valor_pago) || 0), 0), [rows]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/pagamentos?mes=${month}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(data);
    } catch (e: any) {
      setError(e.message || "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const pay = async (cobrancaId: number, valor: number) => {
    try {
      const res = await fetch(`${API_BASE}/pagamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cobranca_id: cobrancaId, valor }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e.message || "Erro ao registrar pagamento");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pagamentos</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">Mês</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded p-3">
          <div className="text-sm text-gray-600">Total a receber</div>
          <div className="text-2xl font-bold">R$ {totalAReceber.toFixed(2)}</div>
        </div>
        <div className="bg-white border rounded p-3">
          <div className="text-sm text-gray-600">Total pago</div>
          <div className="text-2xl font-bold">R$ {totalPago.toFixed(2)}</div>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {loading && <div>Carregando...</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Aluno</th>
              <th className="p-2">Vencimento</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Pago</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const aberto = r.status !== "pago";
              return (
                <tr key={r.cobranca_id} className="border-b">
                  <td className="p-2">
                    <div className="font-medium">{r.nome}</div>
                    {r.telefone && <div className="text-gray-500">{r.telefone}</div>}
                  </td>
                  <td className="p-2">{new Date(r.vencimento).toLocaleDateString()}</td>
                  <td className="p-2">R$ {Number(r.valor_total).toFixed(2)}</td>
                  <td className="p-2">R$ {Number(r.valor_pago).toFixed(2)}</td>
                  <td className="p-2">
                    <span className={
                      `px-2 py-1 rounded text-xs ${aberto ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`
                    }>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {aberto ? (
                      <button
                        onClick={() => pay(r.cobranca_id, r.valor_total)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Marcar pago
                      </button>
                    ) : (
                      <span className="text-gray-500">Pago</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}