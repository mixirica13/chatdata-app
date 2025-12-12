import { LiquidGlass } from '@/components/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    price: 'R$ 47',
    period: '/mês',
    description: 'Ideal para começar com IA',
    features: [
      'Acesso à IA ChatData no WhatsApp',
      'Dashboard geral com métricas principais',
      '50 requisições/dia',
    ],
    cta: 'Testar 7 Dias Grátis',
    popular: true,
    order: 1, // Primeiro no mobile, centro no desktop
  },
  {
    name: 'Pro',
    icon: Crown,
    price: 'R$ 97',
    period: '/mês',
    description: 'Para profissionais que buscam mais',
    features: [
      'Acesso à IA ChatData no WhatsApp',
      'Dashboard customizável',
      'Burn-up chart para acompanhamento',
      'Controle de gastos detalhado',
      'Alerta de saldo para contas pré-pagas',
      '100 requisições/dia',
    ],
    cta: 'Assinar Agora',
    popular: false,
    order: 2, // Segundo no mobile, terceiro no desktop
  },
  {
    name: 'Agency',
    icon: Rocket,
    price: 'R$ 197',
    period: '/mês',
    description: 'Solução completa para agências',
    features: [
      'Todos os recursos do Pro',
      'Dashboard customizável avançado',
      'Burn-up chart detalhado',
      'Controle completo de gastos',
      'Alertas personalizados',
      'Requisições ilimitadas',
    ],
    cta: 'Assinar Agora',
    popular: false,
    order: 3, // Terceiro no mobile, segundo no desktop (antes do popular)
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">PLANOS E PREÇOS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Escolha o plano <span className="text-[#46CCC6]">ideal</span> para você
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Cancele quando quiser, sem complicação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Mobile: Basic primeiro | Desktop: Agency, Basic (centro), Pro */}
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative ${
                plan.name === 'Basic' ? 'order-1 md:order-2' :
                plan.name === 'Agency' ? 'order-3 md:order-1' :
                'order-2 md:order-3'
              }`}
            >
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

        {/* Trial info */}
        <div className="mt-12 text-center">
          <LiquidGlass className="max-w-2xl mx-auto p-6">
            <p className="text-white/80">
              <span className="font-semibold text-[#46CCC6]">7 dias para testar:</span> Experimente o plano Basic gratuitamente por 7 dias. Cancele quando quiser, sem compromisso.
            </p>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
};
