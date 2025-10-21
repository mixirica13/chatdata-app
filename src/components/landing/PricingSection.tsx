import { LiquidGlass } from '@/components/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 'R$ 97',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      '1 conta Meta Ads conectada',
      '1 número WhatsApp',
      'Relatórios diários por IA',
      'Suporte por email',
      'Dashboard básico',
    ],
    cta: 'Começar Grátis',
    popular: false,
  },
  {
    name: 'Professional',
    icon: Crown,
    price: 'R$ 197',
    period: '/mês',
    description: 'Mais popular entre profissionais',
    features: [
      '3 contas Meta Ads',
      '2 números WhatsApp',
      'Relatórios em tempo real',
      'Suporte prioritário',
      'Dashboard avançado',
      'Alertas personalizados',
      'Exportação de dados',
    ],
    cta: 'Começar Teste Grátis',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Rocket,
    price: 'R$ 397',
    period: '/mês',
    description: 'Para agências e empresas',
    features: [
      'Contas Meta Ads ilimitadas',
      'WhatsApp ilimitado',
      'IA personalizada',
      'Suporte dedicado 24/7',
      'Dashboard white-label',
      'API de integração',
      'Consultoria mensal',
      'Treinamento da equipe',
    ],
    cta: 'Falar com Vendas',
    popular: false,
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">PLANOS E PREÇOS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Escolha o plano <span className="text-[#46CCC6]">ideal</span> para você
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-4">
            Todos os planos incluem 14 dias de teste grátis. Cancele quando quiser.
          </p>
          <p className="text-[#46CCC6] font-semibold">
            🎉 50% OFF nos primeiros 3 meses para novos usuários
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] text-black px-4 py-1 rounded-full text-sm font-bold">
                    MAIS POPULAR
                  </div>
                </div>
              )}

              <LiquidGlass
                className={`p-8 h-full flex flex-col ${
                  plan.popular ? 'border-2 border-[#46CCC6]/50 scale-105' : ''
                }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[#46CCC6] to-[#2D9B96]'
                    : 'bg-white/10'
                }`}>
                  <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-black' : 'text-[#46CCC6]'}`} />
                </div>

                {/* Plan name */}
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  {plan.name}
                </h3>
                <p className="text-white/60 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                      {plan.price}
                    </span>
                    <span className="text-white/60">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#46CCC6]/20 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#46CCC6]" />
                      </div>
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  size="lg"
                  className={`w-full rounded-xl font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] hover:opacity-90 text-black'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                  onClick={() => navigate('/register')}
                >
                  {plan.cta}
                </Button>
              </LiquidGlass>
            </div>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="mt-12 text-center">
          <LiquidGlass className="max-w-2xl mx-auto p-6">
            <p className="text-white/80">
              <span className="font-semibold text-[#46CCC6]">Garantia de 30 dias:</span> Se você não estiver
              satisfeito, devolvemos 100% do seu dinheiro, sem perguntas.
            </p>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
};
