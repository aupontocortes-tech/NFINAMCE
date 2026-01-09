import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Smartphone, CheckCircle, XCircle, LogOut, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getApiUrl } from '@/lib/utils';

interface WhatsAppStatus {
  status: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED';
  qrCode: string | null;
  session: {
    user: string;
    pushname: string;
    platform: string;
    connectedAt: string;
  } | null;
}

export function WhatsAppConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<WhatsAppStatus>({ 
    status: 'DISCONNECTED', 
    qrCode: null, 
    session: null 
  });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/whatsapp/status`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Erro ao conectar com backend:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar? O sistema parará de enviar cobranças.')) return;
    
    setLoading(true);
    try {
      await fetch(`${getApiUrl()}/whatsapp/desconectar`, { method: 'POST' });
      // Aguarda um pouco para o backend reiniciar o processo
      setTimeout(fetchStatus, 2000);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    fetchStatus(); // Busca inicial

    if (isOpen) {
      interval = setInterval(fetchStatus, 2000); // Polling rápido quando aberto
    } else {
      interval = setInterval(fetchStatus, 10000); // Polling lento em background para atualizar ícone
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Renderização do Conteúdo do Modal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-2">Processando...</p>
        </div>
      );
    }

    switch (data.status) {
      case 'CONNECTED':
        return (
          <div className="flex flex-col items-center gap-6 py-4 w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl text-green-700">WhatsApp Conectado</h3>
              <p className="text-sm text-zinc-500">Pronto para enviar cobranças</p>
            </div>

            <div className="w-full bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                <span className="text-sm text-zinc-500">Número</span>
                <span className="font-mono font-medium text-zinc-800">{data.session?.user.split('@')[0]}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                <span className="text-sm text-zinc-500">Nome</span>
                <span className="font-medium text-zinc-800">{data.session?.pushname || '-'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                <span className="text-sm text-zinc-500">Dispositivo</span>
                <span className="font-medium text-zinc-800 capitalize">{data.session?.platform || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Conectado em</span>
                <span className="text-sm text-zinc-800">
                  {data.session?.connectedAt 
                    ? format(new Date(data.session.connectedAt), "dd/MM 'às' HH:mm", { locale: ptBR })
                    : '-'}
                </span>
              </div>
            </div>

            <Button variant="destructive" className="w-full gap-2" onClick={handleDisconnect}>
              <LogOut className="w-4 h-4" />
              Desconectar WhatsApp
            </Button>
          </div>
        );

      case 'QR_READY':
        return (
          <div className="flex flex-col items-center gap-4 py-2">
             <div className="bg-white p-4 rounded-lg border-2 border-zinc-100 shadow-sm">
               {data.qrCode && <QRCodeSVG value={data.qrCode} size={240} />}
             </div>
             <div className="text-center space-y-1">
               <h3 className="font-semibold text-zinc-900">Escaneie o QR Code</h3>
               <p className="text-sm text-zinc-500">
                 Abra o WhatsApp no seu celular <br/>
                 Menu {'>'} Aparelhos conectados {'>'} Conectar aparelho
               </p>
             </div>
          </div>
        );

      case 'INITIALIZING':
        return (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <div>
              <h3 className="font-medium text-zinc-900">Iniciando WhatsApp...</h3>
              <p className="text-sm text-zinc-500">Aguardando sessão ou gerando QR Code.</p>
            </div>
          </div>
        );

      default: // DISCONNECTED
        return (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-900">Desconectado</h3>
              <p className="text-sm text-zinc-500 max-w-[280px] mx-auto mt-2">
                O WhatsApp precisa estar conectado para enviar cobranças automáticas.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 text-left">
                <p className="font-semibold mb-1">⚠️ Dica de Solução:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Se estiver no <strong>Localhost</strong>, verifique se o terminal 'server' está rodando.</li>
                  <li>Se estiver na <strong>Vercel</strong>, o backend precisa estar hospedado (Render/Railway).</li>
                  <li>Caso contrário, use o computador local para conectar.</li>
                </ul>
              </div>
            </div>
            <Button className="gap-2 mt-2" onClick={() => fetchStatus()} variant="outline">
              <RefreshCw className="w-4 h-4" />
              Tentar Reconectar
            </Button>
          </div>
        );
    }
  };

  // Ícone e Texto do Botão Trigger
  const getTriggerInfo = () => {
    switch (data.status) {
      case 'CONNECTED':
        return { 
          icon: CheckCircle, 
          text: 'WhatsApp Conectado', 
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800' 
        };
      case 'QR_READY':
        return { 
          icon: Smartphone, 
          text: 'Escanear QR Code', 
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 animate-pulse' 
        };
      case 'INITIALIZING':
        return { 
          icon: Loader2, 
          text: 'Conectando...', 
          className: 'bg-zinc-50 text-zinc-600 border-zinc-200' 
        };
      default:
        return { 
          icon: XCircle, 
          text: 'WhatsApp Offline', 
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800' 
        };
    }
  };

  const triggerInfo = getTriggerInfo();
  const TriggerIcon = data.status === 'INITIALIZING' ? Loader2 : triggerInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`gap-2 transition-all duration-300 ${triggerInfo.className}`}>
          <TriggerIcon className={`w-4 h-4 ${data.status === 'INITIALIZING' ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-medium">
            {triggerInfo.text}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Área do Professor - WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
        
      </DialogContent>
    </Dialog>
  );
}
