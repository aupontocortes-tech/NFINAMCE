import { Student } from "./types";
import { toast } from "sonner";
import { getApiUrl } from "./utils";

export const sendWhatsAppMessage = async (student: Student) => {
  const defaultMessage = `Olá ${student.name}, tudo bem? 😊\nPassando para lembrar que a mensalidade no valor de R$ ${student.value} já está disponível.\nQualquer dúvida é só me avisar 💪`;
  
  const message = student.customMessage || defaultMessage;
  
  try {
    const response = await fetch(`${getApiUrl()}/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: student.phone,
        message: message,
      }),
    });

    if (!response.ok) {
      let detail = 'Falha ao enviar mensagem';
      try {
        const data = await response.json();
        if (data?.error) detail = data.error;
      } catch {}
      throw new Error(detail);
    }

    console.log(`[WhatsApp] Enviado para ${student.phone}`);
    
    // Feedback visual
    toast.success(`Mensagem enviada para ${student.name}`);
    return true;

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error(`Erro ao enviar para ${student.name}: ${msg}`);
    return false;
  }
};

export const runDailyAutomation = async (students: Student[]) => {
  const today = new Date().getDate();
  let processedCount = 0;

  // Processar sequencialmente para não sobrecarregar
  for (const student of students) {
    if (student.dueDate === today && student.status === 'pending') {
      await sendWhatsAppMessage(student);
      processedCount++;
      // Pequeno delay para evitar bloqueio do WhatsApp
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (processedCount > 0) {
    console.log(`Automação diária: ${processedCount} mensagens enviadas.`);
  } else {
    console.log("Automação diária: Nenhuma cobrança pendente para hoje.");
  }
  
  return processedCount;
};
