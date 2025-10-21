import { LiquidGlass } from '@/components/LiquidGlass';
import { Smartphone, Bell, Clock, Settings } from 'lucide-react';

export const WhatsAppSection = () => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#46CCC6]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <div>
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-white/80 font-semibold text-sm">INSIGHTS AUTOMATIZADOS</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Receba insights <span className="text-[#46CCC6]">personalizados</span> no WhatsApp
            </h2>

            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Configure uma vez e fique sempre informado. O ChatData monitora suas campanhas 24/7 e envia alertas
              inteligentes direto no seu WhatsApp - sem você precisar perguntar.
            </p>

            <div className="space-y-6">
              <LiquidGlass className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#46CCC6]/20 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-[#46CCC6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">100% Personalizável</h3>
                    <p className="text-white/70 text-sm">
                      Escolha quais métricas quer monitorar, defina os gatilhos de alerta e a frequência dos relatórios.
                      Você está no controle.
                    </p>
                  </div>
                </div>
              </LiquidGlass>

              <LiquidGlass className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#46CCC6]/20 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-[#46CCC6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Alertas Inteligentes</h3>
                    <p className="text-white/70 text-sm">
                      Seja notificado automaticamente quando algo importante acontecer: queda de performance,
                      oportunidades detectadas ou metas atingidas.
                    </p>
                  </div>
                </div>
              </LiquidGlass>

              <LiquidGlass className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#46CCC6]/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#46CCC6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Relatórios Automáticos</h3>
                    <p className="text-white/70 text-sm">
                      Receba resumos diários, semanais ou mensais com as principais métricas e insights do período.
                      Sempre atualizado, sempre no seu bolso.
                    </p>
                  </div>
                </div>
              </LiquidGlass>
            </div>
          </div>

          {/* Right: WhatsApp preview */}
          <div className="relative">
            <LiquidGlass className="p-8">
              <div className="aspect-[9/16] max-w-sm mx-auto bg-gradient-to-br from-white/10 to-transparent rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                {/* WhatsApp interface mockup */}
                <div className="absolute inset-0 p-6 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">ChatData IA</div>
                      <div className="text-white/50 text-xs">online</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 py-6 space-y-4 overflow-hidden">
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-white/90 text-xs mb-2">📊 Relatório Diário - 21/10/2025</p>
                      <p className="text-white/70 text-xs leading-relaxed">
                        Suas campanhas tiveram ótimo desempenho hoje! ROI médio: 423% (+12% vs ontem)
                      </p>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-yellow-400 text-xs mb-2">⚠️ Alerta de Performance</p>
                      <p className="text-white/70 text-xs leading-relaxed">
                        Campanha "Black Friday" está com CPA 25% acima da meta nas últimas 3 horas.
                      </p>
                    </div>

                    <div className="bg-[#46CCC6]/20 border border-[#46CCC6]/30 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-[#46CCC6] text-xs mb-2">💡 Oportunidade Detectada</p>
                      <p className="text-white/70 text-xs leading-relaxed">
                        Público "Mulheres 25-34" está convertendo 3x mais que outros segmentos!
                      </p>
                    </div>
                  </div>

                  {/* Placeholder text */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-white/40 text-xs">Adicione screenshot do WhatsApp aqui</p>
                  </div>
                </div>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </section>
  );
};
