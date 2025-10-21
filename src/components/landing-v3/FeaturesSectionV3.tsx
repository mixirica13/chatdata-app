import { LiquidGlass } from '@/components/LiquidGlass';
import { MessageSquare, Smartphone, Zap, Bell } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Tudo no WhatsApp',
    subtitle: 'O CORE do ChatData',
    description: 'Não precisa abrir dashboards, apps ou sites. Toda a inteligência opera dentro do WhatsApp que você já usa todos os dias. É como ter um analista senior no seu contato.',
    examples: [
      'Abra o WhatsApp e pergunte qualquer coisa',
      'Receba análises completas em segundos',
      'Gráficos e métricas direto na conversa',
    ],
    highlight: true,
  },
  {
    icon: MessageSquare,
    title: 'Conversa Natural',
    subtitle: 'Pergunte como quiser',
    description: 'Sem comandos decorados ou menus complicados. Fale naturalmente como se estivesse conversando com um colega de trabalho. A IA entende contexto e responde de forma inteligente.',
    examples: [
      '"Qual campanha está vendendo mais?"',
      '"Me mostra o ROI de hoje"',
      '"Compara esta semana com a anterior"',
    ],
    highlight: false,
  },
  {
    icon: Zap,
    title: 'Acesso Total aos Dados',
    subtitle: 'Visão completa',
    description: 'O agente tem acesso a todas as suas contas e campanhas do Meta Ads. Histórico completo, métricas em tempo real, segmentações, criativos - tudo disponível via chat.',
    examples: [
      'Todas as contas conectadas',
      'Dados atualizados em tempo real',
      'Histórico completo de performance',
    ],
    highlight: false,
  },
  {
    icon: Bell,
    title: 'Insights Automáticos',
    subtitle: 'Fique sempre informado',
    description: 'Configure alertas personalizados e receba notificações quando algo importante acontecer. Relatórios diários, semanais ou quando você quiser - tudo no WhatsApp.',
    examples: [
      'Alertas de queda de performance',
      'Oportunidades detectadas pela IA',
      'Relatórios automáticos personalizados',
    ],
    highlight: false,
  },
];

export const FeaturesSectionV3 = () => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#46CCC6]/5 to-black" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">POR QUE WHATSAPP?</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Simplicidade que <span className="text-[#46CCC6]">você já conhece</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Por que complicar? Você já sabe usar WhatsApp. Agora ele também é sua ferramenta de análise de dados mais poderosa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <LiquidGlass
              key={index}
              className={`p-8 relative overflow-hidden ${
                feature.highlight ? 'md:col-span-2 border-2 border-[#46CCC6]/30' : ''
              }`}
            >
              {feature.highlight && (
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    DIFERENCIAL
                  </div>
                </div>
              )}

              <div className={`grid ${feature.highlight ? 'md:grid-cols-2 gap-8' : 'grid-cols-1'}`}>
                <div>
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    feature.highlight
                      ? 'bg-gradient-to-br from-[#46CCC6] to-[#2D9B96]'
                      : 'bg-white/10'
                  }`}>
                    <feature.icon className={`w-8 h-8 ${feature.highlight ? 'text-black' : 'text-[#46CCC6]'}`} />
                  </div>

                  {/* Title */}
                  <div className="mb-2">
                    <span className="text-[#46CCC6] text-sm font-semibold uppercase tracking-wide">
                      {feature.subtitle}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                {/* Examples */}
                <div className={feature.highlight ? '' : 'mt-4'}>
                  <div className="space-y-3">
                    {feature.examples.map((example, exampleIndex) => (
                      <div
                        key={exampleIndex}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        {typeof example === 'string' && example.startsWith('"') ? (
                          <>
                            <MessageSquare className="w-4 h-4 text-[#46CCC6] flex-shrink-0 mt-1" />
                            <span className="text-white/80 text-sm italic">{example}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#46CCC6] flex-shrink-0 mt-2" />
                            <span className="text-white/80 text-sm">{example}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </LiquidGlass>
          ))}
        </div>

        {/* Why WhatsApp explanation */}
        <div className="mt-16 max-w-4xl mx-auto">
          <LiquidGlass className="p-8 text-center">
            <Smartphone className="w-12 h-12 text-[#46CCC6] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Por que escolhemos WhatsApp?
            </h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Dashboards complexos afastam você dos dados. Apps extras ocupam espaço e ficam esquecidos.
              WhatsApp é diferente: você já está lá o dia todo. Por que não torná-lo mais inteligente?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-[#46CCC6] font-bold text-lg mb-1">✓ Familiar</div>
                <p className="text-white/60">Você já sabe usar</p>
              </div>
              <div className="text-center">
                <div className="text-[#46CCC6] font-bold text-lg mb-1">✓ Rápido</div>
                <p className="text-white/60">Sempre no bolso</p>
              </div>
              <div className="text-center">
                <div className="text-[#46CCC6] font-bold text-lg mb-1">✓ Simples</div>
                <p className="text-white/60">Sem curva de aprendizado</p>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
};
