"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Dumbbell, Repeat, CalendarDays } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getApiUrl } from "@/lib/utils";
import { toast } from "sonner";

const API = getApiUrl();

interface Aluno {
  id: number;
  nome: string;
}

interface Aula {
  id: number;
  aluno_id: number;
  aluno_nome?: string;
  data?: string | null;
  dia_semana?: string | null;
  hora_inicio: string;
  hora_fim: string;
  tipo_treino?: string | null;
  status?: string | null;
  tipo_aula?: string | null;
}

// Segunda a domingo (agenda semanal completa)
const WEEK_DAYS = [
  { key: "seg", label: "Seg", fullLabel: "Segunda-feira" },
  { key: "ter", label: "Ter", fullLabel: "Terça-feira" },
  { key: "qua", label: "Qua", fullLabel: "Quarta-feira" },
  { key: "qui", label: "Qui", fullLabel: "Quinta-feira" },
  { key: "sex", label: "Sex", fullLabel: "Sexta-feira" },
  { key: "sab", label: "Sab", fullLabel: "Sábado" },
  { key: "dom", label: "Dom", fullLabel: "Domingo" },
];

// Tipos de treino por dia: peito, ombro, bíceps, tríceps, costa, inferiores, etc.
const TIPOS_TREINO = [
  "Peito e ombro",
  "Peito e tríceps",
  "Costas e bíceps",
  "Costa",
  "Bíceps",
  "Tríceps",
  "Peito",
  "Ombros",
  "Inferiores (pernas, glúteos)",
  "Superiores (geral)",
  "Musculação (geral)",
  "Funcional",
  "Emagrecimento / cardio",
  "Outro",
];

// Faixa de horários da agenda: 05:00 às 22:00 (5h da manhã até 22h da noite)
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 5;
  return `${h.toString().padStart(2, "0")}:00`;
});

/** Exibe horário com AM/PM para ficar claro (5h manhã, 17h tarde) */
function formatHoraAmPm(horaStr: string): string {
  if (!horaStr) return "";
  const [hStr] = horaStr.split(":");
  const h = parseInt(hStr, 10);
  if (h >= 5 && h < 12) return `${h}h (manhã)`;
  if (h >= 12 && h < 18) return `${h}h (tarde)`;
  return `${h}h (noite)`;
}

// Estilos por status: Confirmada (verde), Remarcada (âmbar), Cancelada (cinza)
const STATUS_STYLES: Record<string, { card: string; badge: string; select: string }> = {
  confirmada: {
    card: "bg-emerald-500 hover:bg-emerald-600 border-emerald-600/80 text-white shadow-sm",
    badge: "bg-white/20 text-white border border-white/30",
    select: "bg-white/95 text-zinc-800 border-emerald-700/30",
  },
  remarcada: {
    card: "bg-amber-400 hover:bg-amber-500 border-amber-600/60 text-zinc-900 shadow-sm",
    badge: "bg-amber-600/30 text-zinc-900 border border-amber-700/40",
    select: "bg-white/95 text-zinc-800 border-amber-700/40",
  },
  cancelada: {
    card: "bg-zinc-300 hover:bg-zinc-400/80 border-zinc-400 text-zinc-600 shadow-sm",
    badge: "bg-zinc-500/40 text-zinc-700 border border-zinc-500/50",
    select: "bg-white text-zinc-700 border-zinc-400",
  },
};

const STATUS_LABELS: Record<string, string> = {
  confirmada: "Confirmada",
  remarcada: "Remarcada",
  cancelada: "Cancelada",
};

const getAulaStyle = (a: Aula) => {
  const status = a.status || "confirmada";
  return STATUS_STYLES[status] ?? STATUS_STYLES.confirmada;
};

export default function ClassesPage() {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewAulaOpen, setIsNewAulaOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [calendarioSemanaOpen, setCalendarioSemanaOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Começa na segunda-feira

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const resetWeek = () => setCurrentDate(new Date());
  
  const initialFormState = {
    aluno_id: "",
    dias_semana: [] as string[],
    datas: [] as string[],
    hora_inicio: "",
    tipo_treino: "",
    tipo_treino_por_dia: {} as Record<string, string>,
    status: "confirmada" as string,
  };

  const [form, setForm] = useState(initialFormState);

  const formDisabled = !form.aluno_id;

  const toggleDiaSemana = (key: string) => {
    setForm((f) => ({
      ...f,
      dias_semana: f.dias_semana.includes(key) ? f.dias_semana.filter((d) => d !== key) : [...f.dias_semana, key],
      datas: [],
    }));
  };

  const addDataEspecifica = () => {
    setForm((f) => ({ ...f, datas: [...f.datas, ""], dias_semana: [] }));
  };
  const setDataEspecifica = (index: number, value: string) => {
    setForm((f) => {
      const next = [...f.datas];
      next[index] = value;
      return { ...f, datas: next };
    });
  };
  const removeDataEspecifica = (index: number) => {
    setForm((f) => ({ ...f, datas: f.datas.filter((_, i) => i !== index) }));
  };

  const setTipoTreinoPorDia = (diaKey: string, value: string) => {
    setForm((f) => ({
      ...f,
      tipo_treino_por_dia: { ...f.tipo_treino_por_dia, [diaKey]: value },
    }));
  };

  const openEdit = (aula: Aula) => {
    setEditingId(aula.id);
    setForm({
      aluno_id: aula.aluno_id.toString(),
      dias_semana: aula.dia_semana ? [aula.dia_semana] : [],
      datas: aula.data ? [aula.data] : [],
      hora_inicio: aula.hora_inicio,
      tipo_treino: aula.tipo_treino || "",
      tipo_treino_por_dia: aula.dia_semana && aula.tipo_treino ? { [aula.dia_semana]: aula.tipo_treino } : {},
      status: (aula.status as string) || "confirmada",
    });
    setIsNewAulaOpen(true);
  };

  const updateStatus = async (aulaId: number, status: string) => {
    try {
      const res = await fetch(`${API}/aulas/${aulaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchAulas();
        const labels: Record<string, string> = { confirmada: "Confirmada", remarcada: "Remarcada", cancelada: "Cancelada" };
        toast.success(`Status: ${labels[status] || status}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar status.");
      }
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsNewAulaOpen(open);
    if (!open) {
      setEditingId(null);
      setForm(initialFormState);
    }
  };

  const fetchAlunos = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/alunos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Falha ao buscar alunos");
      const data = await res.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAlunos([]);
    }
  };

  const fetchAulas = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/aulas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Falha ao buscar aulas");
      const data = await res.json();
      setAulas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAulas([]);
    }
  };

  useEffect(() => {
    if (token) {
        fetchAlunos();
        fetchAulas();
    }
  }, [token]);

  useEffect(() => {
    if (isNewAulaOpen) {
      fetchAlunos();
    }
  }, [isNewAulaOpen]);

  const isDataPassada = (dataStr: string) => {
    if (!dataStr) return false;
    const d = new Date(dataStr + "T12:00:00");
    return isBefore(d, startOfDay(new Date()));
  };

  const submit = async () => {
    if (!form.aluno_id) {
      toast.error("Selecione um aluno.");
      return;
    }
    const temRecorrente = form.dias_semana.length > 0;
    const datasValidas = form.datas.filter(Boolean);
    const temPontual = datasValidas.length > 0;
    if (!temRecorrente && !temPontual) {
      toast.error("Selecione dias da semana (recorrente) ou datas específicas (pontual).");
      return;
    }
    if (temPontual) {
      const passada = datasValidas.find(isDataPassada);
      if (passada) {
        toast.error(`Não é possível agendar em data passada (${passada}).`);
        return;
      }
    }
    if (!form.hora_inicio) {
      toast.error("Informe o horário de início. A duração é de 1 hora.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const payload = {
          aluno_id: Number(form.aluno_id),
          dia_semana: form.dias_semana[0] || null,
          data: form.datas[0] || null,
          hora_inicio: form.hora_inicio,
          tipo_treino: form.tipo_treino || null,
          status: form.status || "confirmada",
        };
        const res = await fetch(`${API}/aulas/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          handleOpenChange(false);
          fetchAulas();
          toast.success("Aula atualizada.");
        } else {
          const err = await res.json();
          toast.error(err.error || "Erro ao salvar.");
        }
        return;
      }

      // Pontual tem prioridade: se tiver datas específicas, não envia dias da semana
      const payload: Record<string, unknown> = {
        aluno_id: Number(form.aluno_id),
        hora_inicio: form.hora_inicio,
        tipo_treino: form.tipo_treino || null,
      };
      if (temPontual) {
        payload.datas = datasValidas;
      } else {
        payload.dias_semana = form.dias_semana;
        if (Object.keys(form.tipo_treino_por_dia || {}).length > 0) {
          payload.tipo_treino_por_dia = form.tipo_treino_por_dia;
        }
      }

      const res = await fetch(`${API}/aulas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        handleOpenChange(false);
        fetchAulas();
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : 1;
        toast.success(count > 1 ? `${count} aulas agendadas.` : "Aula agendada.");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao salvar.");
      }
    } catch {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Remover aula?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/aulas/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 204) fetchAulas();
    } finally {
      setLoading(false);
    }
  };

  const getAulasForCell = (dayKey: string, hour: string, date: Date) => {
    const hourInt = parseInt(hour.split(":")[0]);
    const dateStr = format(date, "yyyy-MM-dd");
    
    return aulas.filter((a) => {
      const aulaHour = parseInt(a.hora_inicio.split(":")[0]);
      if (aulaHour !== hourInt) return false;

      // Se for aula recorrente
      if (a.dia_semana === dayKey && !a.data) return true;

      // Se for aula de data específica
      if (a.data === dateStr) return true;

      return false;
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header e Controles */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Agenda Semanal</h1>
          <p className="text-zinc-500 text-sm mt-1">Horários fixos e remarcações. Cada aula tem duração de 1 hora.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Navegação de Datas */}
            <div className="flex items-center bg-white border border-zinc-200 rounded-md shadow-sm mr-4">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-primary" onClick={prevWeek}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 text-sm font-medium text-zinc-700 flex flex-col items-center leading-tight cursor-pointer" onClick={resetWeek}>
                   <span>{format(weekStart, "d MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d MMM", { locale: ptBR })}</span>
                   {isSameDay(new Date(), currentDate) || isSameDay(startOfWeek(new Date(), { weekStartsOn: 1 }), weekStart) ? (
                      <span className="text-[10px] text-green-600 font-bold">Semana Atual</span>
                   ) : null}
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-primary" onClick={nextWeek}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <Dialog open={isNewAulaOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                + Adicionar Aula +
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Aula" : "Agendar Nova Aula"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* 1) ALUNO - desbloqueia o resto */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aluno</label>
                    <select
                      className="w-full border border-zinc-300 rounded-md p-2 text-sm bg-white"
                      value={form.aluno_id}
                      onChange={(e) => setForm((f) => ({ ...f, aluno_id: e.target.value }))}
                    >
                      <option value="">Selecione o aluno</option>
                      {alunos.map((a) => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2) DIAS DA SEMANA (recorrente) - painel calendário */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dias da semana (recorrente)</label>
                    <p className="text-xs text-zinc-500">A agenda se repete toda semana, mês a mês. Escolha quantos dias o aluno tem aula.</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2 h-12 border-dashed border-2"
                      onClick={() => setCalendarioSemanaOpen(true)}
                      disabled={formDisabled}
                    >
                      <CalendarIcon className="w-5 h-5" />
                      {form.dias_semana.length > 0
                        ? `${form.dias_semana.length} dia(s) selecionado(s): ${form.dias_semana.map((k) => WEEK_DAYS.find((d) => d.key === k)?.label ?? k).join(", ")}`
                        : "Abrir calendário e marcar os dias da semana"}
                    </Button>
                    <Dialog open={calendarioSemanaOpen} onOpenChange={setCalendarioSemanaOpen}>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Quais dias da semana o aluno tem aula?</DialogTitle>
                          <p className="text-sm text-zinc-500 font-normal mt-1">
                            Clique nos dias. A agenda vai se repetir toda semana, no mesmo horário. Mês a mês fica igual.
                          </p>
                        </DialogHeader>
                        <div className="py-4">
                          {/* Cada dia tem sua coluna: dia em cima, tipo de treino em baixo */}
                          <div className="grid grid-cols-7 gap-3">
                            {WEEK_DAYS.map((d) => {
                              const selected = form.dias_semana.includes(d.key);
                              return (
                                <div key={d.key} className="flex flex-col gap-2 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => toggleDiaSemana(d.key)}
                                    className={`flex flex-col items-center justify-center rounded-xl border-2 py-3 px-2 transition-all min-h-[64px] ${
                                      selected
                                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                                        : "border-zinc-200 hover:border-primary/50 hover:bg-zinc-50"
                                    }`}
                                  >
                                    <span className="text-lg font-bold">{d.label}</span>
                                    <span className="text-[10px] opacity-90 mt-0.5">{d.fullLabel.split("-")[0]}</span>
                                    {selected && <span className="text-[10px] mt-1 opacity-90">✓</span>}
                                  </button>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-medium text-zinc-500 text-center">Tipo de treino</span>
                                    <select
                                      value={form.tipo_treino_por_dia[d.key] || ""}
                                      onChange={(e) => setTipoTreinoPorDia(d.key, e.target.value)}
                                      className="w-full border border-zinc-300 rounded-lg p-2 text-xs bg-white min-h-[40px]"
                                    >
                                      <option value="">—</option>
                                      {TIPOS_TREINO.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-center text-sm text-zinc-500 mt-4">
                            {form.dias_semana.length === 0
                              ? "Nenhum dia selecionado"
                              : `${form.dias_semana.length} dia(s) por semana: ${form.dias_semana.map((k) => WEEK_DAYS.find((d) => d.key === k)?.fullLabel ?? k).join(", ")}`}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setCalendarioSemanaOpen(false)}>
                            Fechar
                          </Button>
                          <Button onClick={() => setCalendarioSemanaOpen(false)}>
                            Aplicar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* 3) DATAS ESPECÍFICAS (pontual) - reposição / aula extra */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Datas específicas (aula pontual / reposição)</label>
                    <p className="text-xs text-zinc-500">Para reposição ou aula extra em uma data. Para aula toda semana, use o calendário acima.</p>
                    <div className="space-y-2">
                      {form.datas.map((d, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            type="date"
                            value={d}
                            onChange={(e) => setDataEspecifica(i, e.target.value)}
                            disabled={formDisabled}
                            className="flex-1"
                          />
                          <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => removeDataEspecifica(i)} aria-label="Remover data">−</Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addDataEspecifica} disabled={formDisabled}>
                        + Adicionar data
                      </Button>
                    </div>
                  </div>

                  {/* 4) HORÁRIO DE INÍCIO – AM/PM: 5h da manhã até 17h (tarde) ou mais */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horário de início</label>
                    <Input
                      type="time"
                      value={form.hora_inicio}
                      onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                      disabled={formDisabled}
                      step={900}
                      className="font-mono text-base w-full"
                    />
                    {form.hora_inicio && (
                      <p className="text-xs font-medium text-zinc-700">
                        {formatHoraAmPm(form.hora_inicio)} — duração 1h (término automático)
                      </p>
                    )}
                    <p className="text-xs text-zinc-500">
                      Ex.: 05:00 = 5h manhã · 10:00 = 10h manhã · 16:00 = 16h tarde · 17:00 = 17h tarde
                    </p>
                  </div>

                  {/* 5) Tipo de treino só para aula pontual (recorrente: já está no calendário) */}
                  {form.datas.filter(Boolean).length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de treino (aula pontual)</label>
                      <select
                        className="w-full border border-zinc-300 rounded-md p-2 text-sm bg-white"
                        value={form.tipo_treino}
                        onChange={(e) => setForm((f) => ({ ...f, tipo_treino: e.target.value }))}
                        disabled={formDisabled}
                      >
                        <option value="">Selecione...</option>
                        {TIPOS_TREINO.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 6) Status (ao editar): enquadrar remarcada / cancelada */}
                  {editingId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status da aula</label>
                      <p className="text-xs text-zinc-500">Se o aluno remarcou ou cancelou, altere o status para organizar na tabela.</p>
                      <select
                        className="w-full border border-zinc-300 rounded-md p-2 text-sm bg-white"
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="confirmada">Confirmada</option>
                        <option value="remarcada">Remarcada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  )}

                  <Button className="w-full mt-4" disabled={loading} onClick={submit}>
                    {editingId ? "Salvar alterações" : "Agendar aula(s)"}
                  </Button>
                </div>
            </DialogContent>
            </Dialog>
        </div>
      </header>

      {/* Tabela Semanal (Grid) */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-[80px_repeat(7,1fr)] divide-x divide-zinc-200">
          
          {/* Header da Tabela */}
          <div className="bg-zinc-50 p-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center sticky left-0 z-10 border-b border-zinc-200 flex items-center justify-center">
            Horário
          </div>
          {WEEK_DAYS.map((day, index) => {
            const date = addDays(weekStart, index);
            const isToday = isSameDay(new Date(), date);
            
            return (
              <div key={day.key} className={`bg-zinc-50 p-3 text-center border-b border-zinc-200 ${isToday ? "bg-blue-50/50" : ""}`}>
                <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-blue-700" : "text-zinc-500"}`}>
                  {day.label}
                </div>
                <div className={`text-xs mt-1 ${isToday ? "text-blue-600 font-bold" : "text-zinc-400"}`}>
                  {format(date, "dd/MM")}
                </div>
              </div>
            );
          })}

          {/* Corpo da Tabela */}
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              {/* Coluna de Hora (AM/PM visível: 5h manhã, 17h tarde) */}
              <div className="p-2 text-xs font-medium text-zinc-600 text-center border-b border-zinc-100 bg-zinc-50/50 sticky left-0 z-10 flex flex-col items-center justify-center gap-0.5">
                <span className="font-mono">{hour}</span>
                <span className="text-[10px] text-zinc-400">{formatHoraAmPm(hour)}</span>
              </div>

              {/* Células dos Dias */}
              {WEEK_DAYS.map((day, index) => {
                const date = addDays(weekStart, index);
                const cellAulas = getAulasForCell(day.key, hour, date);
                const isToday = isSameDay(new Date(), date);

                return (
                  <div key={`${day.key}-${hour}`} className={`min-h-[100px] p-1 border-b border-zinc-100 relative group transition-colors ${isToday ? "bg-blue-50/10" : "hover:bg-zinc-50/50"}`}>
                    <div className="flex flex-col gap-1 h-full">
                      {cellAulas.map((aula) => {
                        const aluno = alunos.find((a) => a.id === aula.aluno_id);
                        const status = aula.status || "confirmada";
                        const styles = getAulaStyle(aula);
                        const isCancelada = status === "cancelada";
                        return (
                          <div 
                            key={aula.id} 
                            className={`rounded-lg p-2 border-2 text-left relative group/card transition-all hover:shadow-md cursor-pointer ${styles.card} ${isCancelada ? "opacity-90" : ""}`}
                            onClick={() => openEdit(aula)}
                          >
                            <button 
                                onClick={(e) => { e.stopPropagation(); remove(aula.id); }}
                                className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-full text-red-600"
                                title="Remover aula"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${styles.badge} mb-1.5`}>
                              {STATUS_LABELS[status] || status}
                            </div>
                            <div className={`flex items-center gap-1.5 mb-1 ${isCancelada ? "line-through opacity-80" : "opacity-95"}`}>
                                <Clock className="w-3 h-3 shrink-0" />
                                <span className="text-[10px] font-medium">
                                    {aula.hora_inicio} - {aula.hora_fim}
                                    <span className="text-[9px] opacity-80 ml-1">({formatHoraAmPm(aula.hora_inicio)})</span>
                                </span>
                            </div>
                            <div className={`flex items-center gap-1.5 mb-0.5 ${isCancelada ? "line-through opacity-80" : ""}`}>
                                <User className="w-3 h-3 shrink-0 opacity-90" />
                                <div className="font-semibold text-xs md:text-sm truncate leading-tight">
                                    {aluno?.nome || aula.aluno_nome || "Desconhecido"}
                                </div>
                            </div>
                            <div className={`flex items-center gap-1.5 mt-0.5 text-[10px] opacity-90 ${isCancelada ? "line-through" : ""}`}>
                              {aula.data ? (
                                <>
                                  <CalendarDays className="w-3 h-3 shrink-0" />
                                  <span>Pontual</span>
                                </>
                              ) : (
                                <>
                                  <Repeat className="w-3 h-3 shrink-0" />
                                  <span>Recorrente</span>
                                </>
                              )}
                            </div>
                            {aula.tipo_treino && (
                                <div className={`flex items-center gap-1.5 mt-1 pt-1 border-t border-black/10 ${isCancelada ? "line-through opacity-80" : ""}`}>
                                    <Dumbbell className="w-3 h-3 shrink-0 opacity-80" />
                                    <div className="text-[10px] truncate font-medium opacity-90">
                                        {aula.tipo_treino}
                                    </div>
                                </div>
                            )}
                            <div className="mt-2 pt-2 border-t border-black/15" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[9px] font-semibold uppercase text-black/70 block mb-0.5">Status</span>
                              <select
                                value={status}
                                onChange={(e) => updateStatus(aula.id, e.target.value)}
                                className={`w-full text-[10px] py-1.5 px-2 rounded-md border font-semibold cursor-pointer ${styles.select}`}
                                title="Confirmada, Remarcada ou Cancelada"
                              >
                                <option value="confirmada">Confirmada</option>
                                <option value="remarcada">Remarcada</option>
                                <option value="cancelada">Cancelada</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legenda: Remarcação e cancelamento */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-800 mb-3">Status na tabela — Remarcação e cancelamento</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 mb-3">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-emerald-500 shadow-inner" />
            <strong>Confirmada</strong>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-amber-400 shadow-inner" />
            <strong>Remarcada</strong>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-zinc-300 shadow-inner" />
            <strong>Cancelada</strong>
          </span>
          <span className="text-zinc-400">|</span>
          <span className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-zinc-500" />
            Recorrente
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-zinc-500" />
            Pontual
          </span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Cada aula na tabela tem um <strong>chip de status</strong> (Confirmada / Remarcada / Cancelada) e um <strong>select &quot;Status&quot;</strong> em baixo. Use o select para marcar remarcada ou cancelada na hora; ou clique na aula para editar data, horário e status.
        </p>
      </div>

      {/* Seção de Datas Específicas (Extra grid) */}
      {aulas.some(a => !!a.data) && (
        <div className="mt-8 pt-6 border-t border-zinc-200">
             <h3 className="text-lg font-semibold text-zinc-700 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Agendamentos em Datas Específicas
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {aulas.filter(a => !!a.data).map(aula => {
                     const aluno = alunos.find(a => a.id === aula.aluno_id);
                     return (
                         <div key={aula.id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex justify-between items-start">
                             <div>
                                 <div className="font-bold text-zinc-800">{aluno?.nome}</div>
                                 <div className="text-sm text-zinc-500 mt-1">
                                     {new Date(aula.data!).toLocaleDateString('pt-BR')}
                                 </div>
                                 <div className="text-sm font-medium text-primary mt-1">
                                     {aula.hora_inicio} - {aula.hora_fim}
                                     <span className="text-zinc-500 font-normal ml-1">({formatHoraAmPm(aula.hora_inicio)})</span>
                                 </div>
                             </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => remove(aula.id)}>
                                 <Trash2 className="w-4 h-4" />
                             </Button>
                         </div>
                     )
                })}
             </div>
        </div>
      )}
    </div>
  );
}
