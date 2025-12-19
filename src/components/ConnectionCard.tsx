import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

interface ConnectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ConnectionCard = ({
  title,
  description,
  icon: Icon,
  connected,
  onConnect,
  onDisconnect,
}: ConnectionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          <StatusBadge status={connected ? 'connected' : 'disconnected'} />
        </div>
      </CardHeader>
      <CardContent>
        {connected ? (
          <Button variant="outline" onClick={onDisconnect} className="w-full border-white/20 text-white hover:bg-white/10">
            Desconectar
          </Button>
        ) : (
          <Button onClick={onConnect} className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold">
            Conectar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
