import { LiquidGlass } from '@/components/LiquidGlass';
import { Smartphone, Link2, MessageCircle, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Smartphone,
    title: 'Verifique seu WhatsApp',
    description: 'Simples, rápido e seguro. Leva menos de 30 segundos.',
  },
  {
    number: '02',
    icon: Link2,
    title: 'Conecte o Meta Ads',
    description: 'Autorize o acesso às suas contas de anúncios do Facebook. Seguro e com apenas alguns cliques.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Comece a Conversar',
    description: 'Pronto! Agora é só mandar mensagem para o ChatData como se fosse um contato normal. Pergunte o que quiser.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Otimize e Escale',
    description: 'Use os insights da IA para melhorar suas campanhas. Configure alertas automáticos e fique sempre à frente.',
  },
];

export const HowItWorksV3 = () => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#46CCC6]/50 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">SETUP EM 2 MINUTOS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Mais simples <span className="text-[#46CCC6]">impossível</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            4 passos e você já está conversando com seu analista de IA. Nada de configurações complexas.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[2.75rem] top-24 w-px h-12 bg-gradient-to-b from-[#46CCC6]/50 to-transparent hidden md:block" />
              )}

              <LiquidGlass className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Number badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] flex items-center justify-center">
                      <step.icon className="w-9 h-9 text-black" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black border-2 border-[#46CCC6] flex items-center justify-center">
                      <span className="text-[#46CCC6] text-xs font-bold">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </LiquidGlass>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <LiquidGlass className="inline-block p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Smartphone className="w-12 h-12 text-[#46CCC6]" />
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">É sério, é só isso.</div>
                <div className="text-white/60">Sem instalação de app, sem dashboards complexos, sem treinamento.</div>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
};
