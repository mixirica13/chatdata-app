import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionCard } from '@/components/ConnectionCard';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Facebook, MessageCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { metaConnected, disconnectMeta, whatsappConnected, disconnectWhatsapp } = useAuth();

  return (
    <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
      {/* Logo fixa no header */}
      <div className="w-full flex justify-center pt-0 pb-4">
        <Logo className="h-16 w-auto" />
      </div>

      {/* Content centralizado */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <LiquidGlass className="p-1">
            <ConnectionCard
              title="Meta Ads"
              description="Conecte sua conta de anúncios do Facebook"
              icon={Facebook}
              connected={metaConnected}
              onConnect={() => navigate('/connect/meta')}
              onDisconnect={disconnectMeta}
            />
          </LiquidGlass>

          <LiquidGlass className="p-1">
            <ConnectionCard
              title="WhatsApp"
              description="Autentique seu número para usar a IA via WhatsApp"
              icon={MessageCircle}
              connected={whatsappConnected}
              onConnect={() => navigate('/connect/whatsapp')}
              onDisconnect={disconnectWhatsapp}
            />
          </LiquidGlass>
        </div>
      </div>

      {/* Menu de navegação inferior */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;
