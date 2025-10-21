import { LiquidGlass } from '@/components/LiquidGlass';
import { MessageSquare, Zap, BarChart3, Bell } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'IA Conversacional',
    subtitle: 'O CORE do ChatData',
    description: 'Faça perguntas em linguagem natural e receba análises profundas instantaneamente. Como ter um analista de dados senior disponível 24/7.',
    examples: [
      '"Qual campanha está gerando mais conversões?"',
      '"Compare o desempenho desta semana vs. semana passada"',
      '"Mostre tendências de CPC dos últimos 30 dias"',
    ],
    highlight: true,
  },
  {
    icon: Zap,
    title: 'Insights Sob Demanda',
    subtitle: 'Você no controle',
    description: 'Explore seus dados do jeito que você quer, quando você quer. Sem esperar relatórios pré-formatados. A IA se adapta às suas necessidades específicas.',
    examples: [
      'Análises customizadas para seu negócio',
      'Respostas em segundos, não em horas',
      'Contexto completo de todas as campanhas',
    ],
    highlight: false,
  },
  {
    icon: Bell,
    title: 'Insights Automatizados',
    subtitle: 'Configure e esqueça',
    description: 'Defina quais métricas importam para você e receba alertas inteligentes via WhatsApp. Fique informado sem precisar perguntar.',
    examples: [
      'Alertas de performance em queda',
      'Notificações de oportunidades detectadas',
      'Relatórios diários personalizados',
    ],
    highlight: false,
  },
  {
    icon: BarChart3,
    title: 'Acesso Total aos Dados',
    subtitle: 'Visão 360°',
    description: 'O agente de IA tem acesso completo a todas as suas campanhas do Meta Ads. Métricas, segmentações, criativos, público - tudo em um só lugar.',
    examples: [
      'Todas as contas conectadas',
      'Histórico completo de campanhas',
      'Dados atualizados em tempo real',
    ],
    highlight: false,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#46CCC6]/5 to-black" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">FUNCIONALIDADES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Muito mais que um <span className="text-[#46CCC6]">dashboard</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            ChatData é um agente inteligente que entende suas perguntas e entrega respostas precisas sobre suas campanhas.
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
                  <div className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] text-black px-3 py-1 rounded-full text-xs font-bold">
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
      </div>
    </section>
  );
};
