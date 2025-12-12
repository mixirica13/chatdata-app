import { LiquidGlass } from '@/components/LiquidGlass';
import { Target, TrendingUp, Users, Zap, DollarSign, BarChart } from 'lucide-react';

const useCases = [
  {
    icon: Target,
    title: 'Gestores de Tráfego',
    challenge: 'Gerenciar múltiplas contas e centenas de campanhas simultaneamente',
    solution: 'Pergunte à IA sobre qualquer campanha e receba insights instantâneos. Compare performance entre contas em segundos.',
    result: 'Produtividade 5x maior',
  },
  {
    icon: TrendingUp,
    title: 'Empreendedores',
    challenge: 'Tomar decisões rápidas sobre investimento em ads sem ser especialista técnico',
    solution: 'Converse com a IA em linguagem natural. Sem jargões técnicos, só insights acionáveis.',
    result: 'Decisões informadas em minutos',
  },
  {
    icon: Users,
    title: 'Agências Digitais',
    challenge: 'Reportar resultados para dezenas de clientes de forma personalizada',
    solution: 'Configure relatórios automatizados customizados para cada cliente via WhatsApp.',
    result: 'Economia de 20h/semana',
  },
  {
    icon: DollarSign,
    title: 'E-commerce',
    challenge: 'Identificar rapidamente produtos e segmentos mais lucrativos',
    solution: 'Pergunte "Qual produto tem melhor ROI?" e receba análise detalhada com recomendações.',
    result: 'ROI médio +127%',
  },
  {
    icon: BarChart,
    title: 'Analistas de Marketing',
    challenge: 'Criar relatórios executivos que a diretoria entenda',
    solution: 'A IA traduz dados complexos em insights claros. Exporte relatórios prontos.',
    result: 'Aprovação de budget facilitada',
  },
  {
    icon: Zap,
    title: 'Consultores',
    challenge: 'Auditar contas de clientes novos rapidamente',
    solution: 'Faça perguntas estratégicas à IA e identifique oportunidades de otimização em minutos.',
    result: 'Onboarding 10x mais rápido',
  },
];

export const UseCasesSection = () => {
  return (
    <section className="relative py-16 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">CASOS DE USO</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Feito para <span className="text-[#46CCC6]">profissionais</span> como você
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            ChatData se adapta ao seu workflow, não importa se você gerencia 1 ou 100 contas de anúncios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {useCases.map((useCase, index) => (
            <LiquidGlass key={index} className="p-6 flex flex-col hover:scale-105 transition-transform">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] flex items-center justify-center mb-4">
                <useCase.icon className="w-6 h-6 text-black" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                {useCase.title}
              </h3>

              {/* Challenge */}
              <div className="mb-3">
                <p className="text-red-400/80 text-xs font-semibold uppercase mb-1">Desafio</p>
                <p className="text-white/60 text-sm leading-relaxed">{useCase.challenge}</p>
              </div>

              {/* Solution */}
              <div className="mb-4 flex-1">
                <p className="text-[#46CCC6] text-xs font-semibold uppercase mb-1">Como ChatData ajuda</p>
                <p className="text-white/70 text-sm leading-relaxed">{useCase.solution}</p>
              </div>

              {/* Result */}
              <div className="pt-3 border-t border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#46CCC6]/10 border border-[#46CCC6]/20">
                  <TrendingUp className="w-3 h-3 text-[#46CCC6]" />
                  <span className="text-[#46CCC6] text-xs font-semibold">{useCase.result}</span>
                </div>
              </div>
            </LiquidGlass>
          ))}
        </div>
      </div>
    </section>
  );
};
