"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Dumbbell } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getApiUrl } from "@/lib/utils";

const API = getApiUrl();

interface Aluno {
  id: number;
  nome: string;
}

interface Aula {
  id: number;
  aluno_id: number;
  data?: string | null;
  dia_semana?: string | null;
  hora_inicio: string;
  hora_fim: string;
  tipo_treino?: string | null;
}

const WEEK_DAYS = [
  { key: "seg", label: "Seg", fullLabel: "Segunda-feira" },
  { key: "ter", label: "Ter", fullLabel: "Terça-feira" },
  { key: "qua", label: "Qua", fullLabel: "Quarta-feira" },
  { key: "qui", label: "Qui", fullLabel: "Quinta-feira" },
  { key: "sex", label: "Sex", fullLabel: "Sexta-feira" },
  { key: "sab", label: "Sab", fullLabel: "Sábado" },
];

const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 5; // Começa as 05:00
  return `${h.toString().padStart(2, "0")}:00`;
});

// Cores suaves para os cards
const CARD_COLORS = [
  "bg-red-50 hover:bg-red-100 border-red-100",
  "bg-orange-50 hover:bg-orange-100 border-orange-100",
  "bg-amber-50 hover:bg-amber-100 border-amber-100",
  "bg-green-50 hover:bg-green-100 border-green-100",
  "bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
  "bg-teal-50 hover:bg-teal-100 border-teal-100",
  "bg-cyan-50 hover:bg-cyan-100 border-cyan-100",
  "bg-sky-50 hover:bg-sky-100 border-sky-100",
  "bg-blue-50 hover:bg-blue-100 border-blue-100",
  "bg-indigo-50 hover:bg-indigo-100 border-indigo-100",
  "bg-violet-50 hover:bg-violet-100 border-violet-100",
  "bg-purple-50 hover:bg-purple-100 border-purple-100",
  "bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-100",
  "bg-pink-50 hover:bg-pink-100 border-pink-100",
  "bg-rose-50 hover:bg-rose-100 border-rose-100",
];

const getCardColor = (alunoId: number) => {
  return CARD_COLORS[alunoId % CARD_COLORS.length];
};

export default function ClassesPage() {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewAulaOpen, setIsNewAulaOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Começa na segunda-feira

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const resetWeek = () => setCurrentDate(new Date());
  
  const initialFormState = {
    aluno_id: "",
    data: "",
    dia_semana: "",
    hora_inicio: "",
    hora_fim: "",
    tipo_treino: "",
  };

  const [form, setForm] = useState(initialFormState);

  const openEdit = (aula: Aula) => {
    setEditingId(aula.id);
    setForm({
      aluno_id: aula.aluno_id.toString(),
      data: aula.data || "",
      dia_semana: aula.dia_semana || "",
      hora_inicio: aula.hora_inicio,
      hora_fim: aula.hora_fim,
      tipo_treino: aula.tipo_treino || "",
    });
    setIsNewAulaOpen(true);
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

  const submit = async () => {
    // Validações com feedback visual
    if (!form.aluno_id) {
      alert("Por favor, selecione um aluno.");
      return;
    }
    if (!form.data && !form.dia_semana) {
      alert("Por favor, selecione um dia da semana (para aulas fixas) ou uma data específica.");
      return;
    }
    if (!form.hora_inicio) {
      alert("Por favor, preencha o horário de início.");
      return;
    }
    if (!form.hora_fim) {
      alert("Por favor, preencha o horário de término.");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `${API}/aulas/${editingId}` : `${API}/aulas`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          aluno_id: Number(form.aluno_id),
          data: form.data || null,
          dia_semana: form.dia_semana || null,
          hora_inicio: form.hora_inicio,
          hora_fim: form.hora_fim,
          tipo_treino: form.tipo_treino || null,
        }),
      });
      if (res.ok) {
        handleOpenChange(false);
        fetchAulas();
      } else {
        const err = await res.json();
        alert(`Erro ao salvar: ${err.error || "Tente novamente."}`);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
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
          <h1 className="text-2xl font-bold text-zinc-900">Agenda de Aulas</h1>
          <p className="text-zinc-500 text-sm mt-1">Visão semanal das aulas recorrentes e específicas.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Navegação de Datas */}
            <div className="flex items-center bg-white border border-zinc-200 rounded-md shadow-sm mr-4">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-primary" onClick={prevWeek}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 text-sm font-medium text-zinc-700 flex flex-col items-center leading-tight cursor-pointer" onClick={resetWeek}>
                   <span>{format(weekStart, "d MMM", { locale: ptBR })} - {format(addDays(weekStart, 5), "d MMM", { locale: ptBR })}</span>
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
                Nova Aula
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{editingId ? "Editar Aula" : "Agendar Nova Aula"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
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

                <div className="space-y-2">
                    <label className="text-sm font-medium">Dia da Semana</label>
                    <select
                    className="w-full border border-zinc-300 rounded-md p-2 text-sm bg-white"
                    value={form.dia_semana}
                    onChange={(e) => setForm((f) => ({ ...f, dia_semana: e.target.value, data: "" }))}
                    >
                    <option value="">Selecione o dia...</option>
                    {WEEK_DAYS.map((d) => (
                        <option key={d.key} value={d.key}>{d.fullLabel}</option>
                    ))}
                    </select>
                </div>

                <div className="relative flex items-center justify-center my-4">
                    <span className="bg-white px-2 text-xs text-zinc-500 uppercase tracking-wider font-semibold">Opcional</span>
                    <div className="absolute inset-0 border-t border-zinc-200 -z-10"></div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-500">Data Específica (apenas se não for recorrente)</label>
                    <Input 
                    type="date"
                    value={form.data} 
                    onChange={(e) => setForm((f) => ({ ...f, data: e.target.value, dia_semana: "" }))} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Início</label>
                        <Input 
                            type="time" 
                            value={form.hora_inicio} 
                            onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fim</label>
                        <Input 
                            type="time" 
                            value={form.hora_fim} 
                            onChange={(e) => setForm((f) => ({ ...f, hora_fim: e.target.value }))} 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Treino</label>
                    <Input 
                    placeholder="Ex: Musculação" 
                    value={form.tipo_treino} 
                    onChange={(e) => setForm((f) => ({ ...f, tipo_treino: e.target.value }))} 
                    />
                </div>

                <Button className="w-full mt-4" disabled={loading} onClick={submit}>
                    Salvar Aula
                </Button>
                </div>
            </DialogContent>
            </Dialog>
        </div>
      </header>

      {/* Tabela Semanal (Grid) */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-[80px_repeat(6,1fr)] divide-x divide-zinc-200">
          
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
              {/* Coluna de Hora */}
              <div className="p-2 text-xs font-medium text-zinc-500 text-center border-b border-zinc-100 bg-zinc-50/50 sticky left-0 z-10 flex items-center justify-center">
                {hour}
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
                        return (
                          <div 
                            key={aula.id} 
                            className={`rounded-md p-2 border shadow-sm text-left relative group/card transition-all hover:shadow-md cursor-pointer ${getCardColor(aula.aluno_id)}`}
                            onClick={() => openEdit(aula)}
                          >
                            <button 
                                onClick={(e) => { e.stopPropagation(); remove(aula.id); }}
                                className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded-full text-red-500"
                                title="Remover aula"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            
                            <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3 h-3 text-zinc-500" />
                                <span className="text-[10px] font-medium text-zinc-600">
                                    {aula.hora_inicio} - {aula.hora_fim}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 mb-0.5">
                                <User className="w-3 h-3 text-zinc-500" />
                                <div className="font-semibold text-xs md:text-sm truncate text-zinc-800 leading-tight">
                                    {aluno?.nome || "Desconhecido"}
                                </div>
                            </div>
                            
                            {aula.tipo_treino && (
                                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-black/5">
                                    <Dumbbell className="w-3 h-3 text-zinc-400" />
                                    <div className="text-[10px] text-zinc-600 truncate font-medium">
                                        {aula.tipo_treino}
                                    </div>
                                </div>
                            )}

                            {aula.data && (
                                <div className="absolute bottom-1 right-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Aula em data específica"></div>
                                </div>
                            )}
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
