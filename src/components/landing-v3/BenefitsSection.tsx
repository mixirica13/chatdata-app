import { LiquidGlass } from '@/components/LiquidGlass';
import { Clock, Brain, Zap, Shield, Users, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Economize Horas por Semana',
    description: 'Chega de exportar planilhas, criar dashboards ou analisar dados manualmente. Pergunte e pronto.',
    stat: '20+ horas economizadas/mês',
  },
  {
    icon: Brain,
    title: 'Decisões Mais Inteligentes',
    description: 'A IA identifica padrões e oportunidades que você nunca veria sozinho. Otimize com base em dados reais.',
    stat: 'ROI médio +127%',
  },
  {
    icon: Zap,
    title: 'Respostas Instantâneas',
    description: 'Dúvida sobre uma métrica? Pergunta na hora, resposta na hora. Sem esperar relatórios ou analistas.',
    stat: 'Respostas em < 5 segundos',
  },
  {
    icon: Shield,
    title: 'Seguro e Confiável',
    description: 'Seus dados são protegidos com criptografia de ponta a ponta. Nunca compartilhamos com terceiros.',
    stat: 'Certificação SOC 2',
  },
  {
    icon: Users,
    title: 'Escalável para Equipes',
    description: 'Toda a equipe pode conversar com a IA. Insights compartilhados, conhecimento democratizado.',
    stat: 'Múltiplos usuários inclusos',
  },
  {
    icon: TrendingUp,
    title: 'Sempre Atualizado',
    description: 'Dados em tempo real, direto da API do Meta. Sem atrasos, sem defasagem. Sempre a informação mais recente.',
    stat: 'Sync a cada 15 minutos',
  },
];

export const BenefitsSection = () => {
  return (
    <section className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">BENEFÍCIOS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Por que escolher <span className="text-[#46CCC6]">ChatData?</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Muito mais que um assistente. É uma transformação na forma como você gerencia suas campanhas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <LiquidGlass key={index} className="p-6 flex flex-col hover:scale-105 transition-transform">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] flex items-center justify-center mb-5">
                <benefit.icon className="w-7 h-7 text-black" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-white/70 leading-relaxed mb-4 flex-1 text-sm">
                {benefit.description}
              </p>

              {/* Stat */}
              <div className="pt-4 border-t border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#46CCC6]/10 border border-[#46CCC6]/20">
                  <span className="text-[#46CCC6] text-xs font-bold">{benefit.stat}</span>
                </div>
              </div>
            </LiquidGlass>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            ChatData vs <span className="text-white/40">Forma Tradicional</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional way */}
            <LiquidGlass className="p-8 opacity-60">
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
                  <span className="text-red-400 text-sm font-semibold">Método Tradicional</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Abrir múltiplas plataformas',
                  'Exportar planilhas manualmente',
                  'Analisar dados por horas',
                  'Criar relatórios customizados',
                  'Agendar reuniões para discutir',
                  'Esperar dias por insights',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60">
                    <span className="text-red-400 mt-1">✗</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </LiquidGlass>

            {/* ChatData way */}
            <LiquidGlass className="p-8 border-2 border-[#46CCC6]/30">
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 bg-[#46CCC6]/10 border border-[#46CCC6]/20 rounded-full mb-4">
                  <span className="text-[#46CCC6] text-sm font-semibold">Com ChatData</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Abrir WhatsApp (que você já usa)',
                  'Perguntar o que quiser',
                  'Receber resposta em segundos',
                  'Insights automáticos e acionáveis',
                  'Compartilhar na hora com a equipe',
                  'Tomar decisões imediatamente',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <span className="text-[#46CCC6] mt-1">✓</span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </section>
  );
};
