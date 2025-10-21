import { LiquidGlass } from '@/components/LiquidGlass';
import { Zap, MessageCircle, BarChart2, TrendingUp } from 'lucide-react';

const solutions = [
  {
    icon: Zap,
    title: 'IA Poderosa',
    description: 'Inteligência artificial analisa seus dados 24/7 e identifica oportunidades de otimização automaticamente.',
    benefit: 'Economize até 40% do orçamento de anúncios',
  },
  {
    icon: MessageCircle,
    title: 'Insights no WhatsApp',
    description: 'Receba análises detalhadas e recomendações diretamente no seu WhatsApp, sem precisar acessar plataformas.',
    benefit: 'Tome decisões em segundos, de onde estiver',
  },
  {
    icon: BarChart2,
    title: 'Métricas Simplificadas',
    description: 'Dados complexos transformados em insights claros e acionáveis que qualquer um pode entender.',
    benefit: 'Sem conhecimento técnico necessário',
  },
  {
    icon: TrendingUp,
    title: 'Otimização Contínua',
    description: 'Acompanhamento em tempo real com alertas inteligentes quando suas métricas precisam de atenção.',
    benefit: 'Maximize seu ROI automaticamente',
  },
];

export const SolutionSection = () => {
  return (
    <section className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-[#46CCC6]/10 border border-[#46CCC6]/20 mb-6">
            <span className="text-[#46CCC6] font-semibold text-sm">A SOLUÇÃO</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            ChatData transforma <span className="text-[#46CCC6]">complexidade em clareza</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Ao invés de gastar horas analisando planilhas, agora você tem uma IA que trabalha por você.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <LiquidGlass key={index} className="p-8 group hover:scale-[1.02] transition-transform">
              <div className="flex flex-col items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <solution.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  {solution.title}
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  {solution.description}
                </p>
                <div className="mt-auto pt-4 border-t border-white/10 w-full">
                  <p className="text-[#46CCC6] font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {solution.benefit}
                  </p>
                </div>
              </div>
            </LiquidGlass>
          ))}
        </div>
      </div>
    </section>
  );
};
