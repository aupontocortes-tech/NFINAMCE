"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewAulaOpen, setIsNewAulaOpen] = useState(false);
  
  const [form, setForm] = useState({
    aluno_id: "",
    data: "",
    dia_semana: "",
    hora_inicio: "",
    hora_fim: "",
    tipo_treino: "",
  });

  const fetchAlunos = async () => {
    try {
      const res = await fetch(`${API}/alunos`);
      if (!res.ok) throw new Error("Falha ao buscar alunos");
      const data = await res.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAlunos([]);
    }
  };

  const fetchAulas = async () => {
    try {
      const res = await fetch(`${API}/aulas`);
      if (!res.ok) throw new Error("Falha ao buscar aulas");
      const data = await res.json();
      setAulas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAulas([]);
    }
  };

  useEffect(() => {
    fetchAlunos();
    fetchAulas();
  }, []);

  const submit = async () => {
    if (!form.aluno_id || (!form.data && !form.dia_semana) || !form.hora_inicio || !form.hora_fim) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/aulas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setForm({ aluno_id: "", data: "", dia_semana: "", hora_inicio: "", hora_fim: "", tipo_treino: "" });
        setIsNewAulaOpen(false);
        fetchAulas();
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Remover aula?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/aulas/${id}`, { method: "DELETE" });
      if (res.status === 204) fetchAulas();
    } finally {
      setLoading(false);
    }
  };

  const getAulasForCell = (dayKey: string, hour: string) => {
    const hourInt = parseInt(hour.split(":")[0]);
    
    return aulas.filter((a) => {
      // Verifica o dia
      if (a.dia_semana !== dayKey) return false;
      
      // Verifica a hora (simples: considera se a hora de início bate com a linha)
      // Idealmente, poderíamos verificar intervalos, mas para grade simples, match exato de hora início funciona bem
      const aulaHour = parseInt(a.hora_inicio.split(":")[0]);
      return aulaHour === hourInt;
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header e Controles */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Agenda de Aulas</h1>
          <p className="text-zinc-500 text-sm mt-1">Visão semanal das aulas recorrentes.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Simulando navegação de datas para visual apenas, já que o foco é agenda recorrente */}
            <div className="hidden md:flex items-center bg-white border border-zinc-200 rounded-md shadow-sm mr-4">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-primary">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-4 text-sm font-medium text-zinc-700">Semana Atual</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-primary">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <Dialog open={isNewAulaOpen} onOpenChange={setIsNewAulaOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Nova Aula
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Agendar Nova Aula</DialogTitle>
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

      {/* Grade de Horários */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        {/* Cabeçalho da Tabela */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50">
            <div className="p-4 text-center text-sm font-semibold text-zinc-500 border-r border-zinc-200">
                Horário
            </div>
            {WEEK_DAYS.map((day) => (
                <div key={day.key} className="p-4 text-center text-sm font-bold text-zinc-700 border-r border-zinc-200 last:border-r-0">
                    {day.label}
                </div>
            ))}
        </div>

        {/* Corpo da Tabela */}
        <div className="divide-y divide-zinc-200">
            {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] min-h-[80px]">
                    {/* Coluna de Hora */}
                    <div className="p-3 flex items-center justify-center text-sm font-medium text-zinc-500 bg-zinc-50/50 border-r border-zinc-200">
                        {hour}
                    </div>

                    {/* Colunas dos Dias */}
                    {WEEK_DAYS.map((day) => {
                        const aulasDoHorario = getAulasForCell(day.key, hour);
                        return (
                            <div key={`${day.key}-${hour}`} className="p-1 border-r border-zinc-100 last:border-r-0 relative group hover:bg-zinc-50 transition-colors">
                                {aulasDoHorario.map((aula) => {
                                    const aluno = alunos.find(a => a.id === aula.aluno_id);
                                    return (
                                        <div 
                                            key={aula.id} 
                                            className={`
                                                ${getCardColor(aula.aluno_id)} 
                                                p-2 rounded-md border mb-1 cursor-pointer shadow-sm relative group/card
                                            `}
                                        >
                                            <div className="font-semibold text-xs md:text-sm truncate text-zinc-800">
                                                {aluno?.nome || "Desconhecido"}
                                            </div>
                                            {aula.tipo_treino && (
                                                <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                                                    {aula.tipo_treino}
                                                </div>
                                            )}
                                            
                                            {/* Botão de excluir aparece no hover */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    remove(aula.id);
                                                }}
                                                className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white rounded-full text-zinc-400 hover:text-red-500 transition-all"
                                                title="Remover aula"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
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
