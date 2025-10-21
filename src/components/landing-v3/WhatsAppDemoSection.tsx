import { LiquidGlass } from '@/components/LiquidGlass';
import { Smartphone, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const whatsappConversation = [
  {
    type: 'ai',
    time: '09:23',
    message: '☀️ Bom dia! Aqui está seu resumo de ontem:',
  },
  {
    type: 'ai',
    time: '09:23',
    message: '📊 *Resumo Geral*\n\n💰 Investimento: R$ 1.847,00\n🎯 Conversões: 89\n💵 CPA médio: R$ 20,75\n📈 ROI: 423%',
    highlight: true,
  },
  {
    type: 'user',
    time: '09:25',
    message: 'Qual campanha teve melhor resultado?',
  },
  {
    type: 'ai',
    time: '09:25',
    message: '🏆 *Top Performer:* Promoção Verão 2025\n\n✅ 34 conversões\n💰 CPA: R$ 12,30 (-41% vs média)\n📊 ROI: 587%\n🔥 CTR: 4.2%\n\nEsta campanha está *muito acima* da média!',
  },
  {
    type: 'user',
    time: '09:27',
    message: 'E a de remarketing? Tá indo bem?',
  },
  {
    type: 'ai',
    time: '09:27',
    message: '⚠️ Detectei um problema:\n\n*Remarketing Q1* está com queda de 23% nas conversões nas últimas 24h.\n\n❗ CPC subiu 15%\n👥 Público: 68% já converteu recentemente\n\n💡 *Recomendação:* Ajustar frequência para 2x/semana e criar novo segmento.',
    alert: true,
  },
  {
    type: 'user',
    time: '09:30',
    message: 'Boa! Pode me mandar um relatório completo dessa campanha?',
  },
  {
    type: 'ai',
    time: '09:30',
    message: '✅ Relatório enviado!\n\nIncluí:\n• Métricas completas dos últimos 30 dias\n• Comparativo com período anterior\n• Análise de público\n• Recomendações de otimização\n\nPrecisa de mais alguma coisa?',
  },
];

export const WhatsAppDemoSection = () => {
  return (
    <section id="whatsapp-demo" className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">CONVERSA REAL</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Veja como funciona <span className="text-[#46CCC6]">na prática</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Uma conversa de manhã com ChatData. Simples, rápido e direto ao ponto - tudo no WhatsApp.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <LiquidGlass className="p-8 lg:p-12">
            {/* WhatsApp Interface */}
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">ChatData IA</div>
                  <div className="text-white/80 text-xs">online</div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="bg-[#E5DDD5] p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {whatsappConversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                        msg.type === 'user'
                          ? 'bg-[#DCF8C6] rounded-tr-none'
                          : msg.alert
                          ? 'bg-yellow-50 border-l-4 border-yellow-500 rounded-tl-none'
                          : msg.highlight
                          ? 'bg-blue-50 border-l-4 border-[#46CCC6] rounded-tl-none'
                          : 'bg-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-line">
                        {msg.message}
                      </p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-500">{msg.time}</span>
                        {msg.type === 'user' && (
                          <svg className="w-3 h-3 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-white rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Mensagem"
                    disabled
                    className="w-full bg-transparent text-sm text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="w-10 h-10 bg-[#46CCC6] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <LiquidGlass className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-[#46CCC6] mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Métricas Visuais</h3>
              <p className="text-white/60 text-sm">Gráficos e dados formatados direto na conversa</p>
            </LiquidGlass>

            <LiquidGlass className="p-6 text-center">
              <DollarSign className="w-10 h-10 text-[#46CCC6] mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Insights Acionáveis</h3>
              <p className="text-white/60 text-sm">Recomendações práticas que você pode implementar já</p>
            </LiquidGlass>

            <LiquidGlass className="p-6 text-center">
              <TrendingDown className="w-10 h-10 text-[#46CCC6] mx-auto mb-3 rotate-180" />
              <h3 className="font-bold text-white mb-2">Alertas Proativos</h3>
              <p className="text-white/60 text-sm">IA identifica problemas antes que virem prejuízo</p>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </section>
  );
};
