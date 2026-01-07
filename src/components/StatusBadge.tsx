import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'warning';
  label?: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const configs = {
    connected: {
      icon: CheckCircle2,
      text: label || 'Connected',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    disconnected: {
      icon: XCircle,
      text: label || 'Disconnected',
      variant: 'destructive' as const,
      className: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: AlertCircle,
      text: label || 'Warning',
      variant: 'secondary' as const,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};
