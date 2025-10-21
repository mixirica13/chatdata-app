import { LiquidGlass } from '@/components/LiquidGlass';
import { Link2, Brain, MessageSquare, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Conecte suas Contas',
    description: 'Integre seu Meta Ads e WhatsApp em menos de 2 minutos. Seguro e sem complicação.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'IA Analisa seus Dados',
    description: 'Nossa inteligência artificial processa suas métricas e identifica padrões de performance.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Receba Insights no WhatsApp',
    description: 'Relatórios claros e recomendações personalizadas chegam direto no seu celular.',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Otimize e Venda Mais',
    description: 'Implemente as sugestões e veja seu ROI crescer com decisões baseadas em dados.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#46CCC6]/50 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">COMO FUNCIONA</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Simples, rápido e <span className="text-[#46CCC6]">poderoso</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Em 4 passos você estará recebendo insights de IA que transformarão seus resultados.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-24 w-px h-16 bg-gradient-to-b from-[#46CCC6]/50 to-transparent hidden md:block" />
              )}

              <LiquidGlass className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Number and Icon */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="text-6xl font-bold text-white/5" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        {step.number}
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] rounded-2xl flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-black" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </LiquidGlass>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
