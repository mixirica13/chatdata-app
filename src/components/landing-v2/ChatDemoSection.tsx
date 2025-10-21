import { LiquidGlass } from '@/components/LiquidGlass';
import { User, Bot, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const chatMessages = [
  {
    type: 'user',
    message: 'Oi! Qual campanha está com melhor desempenho hoje?',
  },
  {
    type: 'ai',
    message: 'Olá! Analisando suas campanhas ativas... A campanha "Promoção Verão 2025" está com os melhores resultados hoje:',
    metrics: [
      { label: 'ROI', value: '487%', trend: 'up' },
      { label: 'CPA', value: 'R$ 12,30', trend: 'down' },
      { label: 'Conversões', value: '142', trend: 'up' },
    ],
  },
  {
    type: 'user',
    message: 'Interessante! E o que está acontecendo com a campanha de remarketing?',
  },
  {
    type: 'ai',
    message: 'Detectei uma queda de 23% nas conversões da campanha "Remarketing Q1" nas últimas 24h. Principais insights:',
    insights: [
      { type: 'warning', text: 'CPC aumentou 15% (acima da média do setor)' },
      { type: 'info', text: 'Público: 68% já converteu recentemente' },
      { type: 'success', text: 'Recomendo: ajustar frequência de exibição para 2x/semana' },
    ],
  },
  {
    type: 'user',
    message: 'Perfeito! Pode me enviar um relatório completo disso no WhatsApp?',
  },
  {
    type: 'ai',
    message: '✅ Relatório enviado para seu WhatsApp com todas as métricas detalhadas e recomendações de otimização!',
  },
];

export const ChatDemoSection = () => {
  return (
    <section id="chat-demo" className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">INTERAÇÃO REAL</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Converse naturalmente com <span className="text-[#46CCC6]">seus dados</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Veja como é simples extrair insights complexos através de uma conversa. Sem dashboards confusos, sem relatórios pré-formatados.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <LiquidGlass className="p-8">
            {/* Chat interface */}
            <div className="space-y-6">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'ai' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                  )}

                  <div className={`flex-1 max-w-[80%] ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        msg.type === 'user'
                          ? 'bg-[#46CCC6] text-black ml-auto'
                          : 'bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>

                      {/* Metrics display */}
                      {msg.metrics && (
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
                          {msg.metrics.map((metric, metricIndex) => (
                            <div key={metricIndex} className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-xs text-white/60">{metric.label}</span>
                                {metric.trend === 'up' && (
                                  <TrendingUp className="w-3 h-3 text-green-400" />
                                )}
                                {metric.trend === 'down' && (
                                  <TrendingUp className="w-3 h-3 text-green-400 rotate-180" />
                                )}
                              </div>
                              <div className="text-lg font-bold text-white">{metric.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Insights display */}
                      {msg.insights && (
                        <div className="space-y-2 mt-4">
                          {msg.insights.map((insight, insightIndex) => (
                            <div
                              key={insightIndex}
                              className={`flex items-start gap-2 p-3 rounded-lg ${
                                insight.type === 'warning'
                                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                                  : insight.type === 'success'
                                  ? 'bg-green-500/10 border border-green-500/20'
                                  : 'bg-blue-500/10 border border-blue-500/20'
                              }`}
                            >
                              {insight.type === 'warning' && (
                                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                              )}
                              {insight.type === 'success' && (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              )}
                              {insight.type === 'info' && (
                                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              )}
                              <span className="text-xs text-white/90">{insight.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.type === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-white/70" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input placeholder */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="text"
                  placeholder="Faça qualquer pergunta sobre suas campanhas..."
                  disabled
                  className="flex-1 bg-transparent text-white/50 placeholder:text-white/30 outline-none text-sm cursor-not-allowed"
                />
                <div className="px-4 py-2 bg-[#46CCC6]/20 text-[#46CCC6] rounded-lg text-sm font-semibold">
                  Enviar
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#46CCC6] mb-2">Linguagem Natural</div>
              <p className="text-white/60 text-sm">Pergunte como se estivesse falando com um analista</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#46CCC6] mb-2">Contexto Completo</div>
              <p className="text-white/60 text-sm">A IA conhece todo o histórico das suas campanhas</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#46CCC6] mb-2">Respostas Instantâneas</div>
              <p className="text-white/60 text-sm">Insights em segundos, não em horas de análise</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
