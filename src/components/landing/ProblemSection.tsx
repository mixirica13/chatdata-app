import { LiquidGlass } from '@/components/LiquidGlass';
import { AlertCircle, TrendingDown, Clock, BarChart3 } from 'lucide-react';

const problems = [
  {
    icon: TrendingDown,
    title: 'Perdendo dinheiro com anúncios?',
    description: 'Campanhas do Meta Ads sem otimização consomem orçamento sem retorno adequado.',
  },
  {
    icon: Clock,
    title: 'Sem tempo para análises?',
    description: 'Passar horas analisando métricas manualmente te afasta do que realmente importa: vender.',
  },
  {
    icon: BarChart3,
    title: 'Dados complexos demais?',
    description: 'Relatórios confusos que não mostram claramente o que precisa ser melhorado.',
  },
  {
    icon: AlertCircle,
    title: 'Decisões no escuro?',
    description: 'Tomar decisões estratégicas sem dados confiáveis é arriscar seu investimento.',
  },
];

export const ProblemSection = () => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#46CCC6]/5 to-black" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Você está <span className="text-[#46CCC6]">perdendo oportunidades</span> todos os dias
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Enquanto seus concorrentes otimizam campanhas com dados precisos, você está navegando às cegas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <LiquidGlass key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {problem.title}
                  </h3>
                  <p className="text-white/60">{problem.description}</p>
                </div>
              </div>
            </LiquidGlass>
          ))}
        </div>
      </div>
    </section>
  );
};
