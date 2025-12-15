import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDateRangeStore } from '@/stores/dateRangeStore';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DatePreset } from '@/types/dashboard';

const presets: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last_7d', label: 'Últimos 7 dias' },
  { value: 'last_14d', label: 'Últimos 14 dias' },
  { value: 'last_30d', label: 'Últimos 30 dias' },
  { value: 'last_90d', label: 'Últimos 90 dias' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' },
];

export function DateRangePicker() {
  const { preset, from, to, setPreset, setCustomRange } = useDateRangeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const handlePresetClick = (newPreset: DatePreset) => {
    setPreset(newPreset);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (tempRange.from && tempRange.to) {
      setCustomRange(tempRange.from, tempRange.to);
      setIsOpen(false);
    }
  };

  const getLabel = () => {
    if (preset === 'custom' && from && to) {
      return `${format(new Date(from), 'dd/MM/yy', { locale: ptBR })} - ${format(new Date(to), 'dd/MM/yy', { locale: ptBR })}`;
    }
    return presets.find(p => p.value === preset)?.label || 'Selecionar';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#46CCC6]" />
          {getLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-white/10 p-2">
            <div className="space-y-1">
              {presets.map((p) => (
                <Button
                  key={p.value}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-sm text-white hover:bg-white/10',
                    preset === p.value && 'bg-[#46CCC6]/20 text-[#46CCC6]'
                  )}
                  onClick={() => handlePresetClick(p.value)}
                >
                  {p.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-sm text-white hover:bg-white/10',
                  preset === 'custom' && 'bg-[#46CCC6]/20 text-[#46CCC6]'
                )}
                onClick={() => setPreset('custom')}
              >
                Personalizado
              </Button>
            </div>
          </div>

          {/* Calendar for custom range */}
          {preset === 'custom' && (
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{
                  from: tempRange.from,
                  to: tempRange.to,
                }}
                onSelect={(range) => {
                  setTempRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={1}
                locale={ptBR}
                className="text-white"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
                  onClick={handleCustomApply}
                  disabled={!tempRange.from || !tempRange.to}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
