import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineItem {
  id: string;
  type: 'insight' | 'connection' | 'alert';
  message: string;
  timestamp: string;
}

interface InsightTimelineProps {
  items: TimelineItem[];
}

export const InsightTimeline = ({ items }: InsightTimelineProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return Zap;
      case 'connection':
        return LinkIcon;
      case 'alert':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'insight':
        return 'text-blue-500 bg-blue-50';
      case 'connection':
        return 'text-green-500 bg-green-50';
      case 'alert':
        return 'text-yellow-500 bg-yellow-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const Icon = getIcon(item.type);
            const colorClass = getColor(item.type);

            return (
              <div key={item.id} className="flex gap-3">
                <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.timestamp), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
