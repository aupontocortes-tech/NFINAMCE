import { Student } from "./types";
import { toast } from "sonner";

export const sendWhatsAppMessage = (student: Student) => {
  const defaultMessage = `Olá ${student.name}, tudo bem? 😊\nPassando para lembrar que a mensalidade no valor de R$ ${student.value} já está disponível.\nQualquer dúvida é só me avisar 💪`;
  
  const message = student.customMessage || defaultMessage;
  
  // Simulação de envio
  console.log(`[WhatsApp Mock] Enviando para ${student.phone}:`);
  console.log(message);
  
  // Feedback visual
  toast.success(`Mensagem enviada para ${student.name}`, {
    description: "Confira o console para ver o conteúdo.",
    duration: 3000,
  });

  return true;
};

export const runDailyAutomation = (students: Student[]) => {
  const today = new Date().getDate();
  let processedCount = 0;

  students.forEach(student => {
    if (student.dueDate === today && student.status === 'pending') {
      sendWhatsAppMessage(student);
      processedCount++;
    }
  });

  if (processedCount > 0) {
    console.log(`Automação diária: ${processedCount} mensagens enviadas.`);
  } else {
    console.log("Automação diária: Nenhuma cobrança pendente para hoje.");
  }
  
  return processedCount;
};
