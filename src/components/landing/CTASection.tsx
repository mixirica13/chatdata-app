import { Button } from '@/components/ui/button';
import { LiquidGlass } from '@/components/LiquidGlass';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#46CCC6]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <LiquidGlass className="max-w-4xl mx-auto p-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#46CCC6]/10 border border-[#46CCC6]/20 mb-8">
            <Sparkles className="w-4 h-4 text-[#46CCC6]" />
            <span className="text-sm text-[#46CCC6] font-semibold">OFERTA ESPECIAL</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Pronto para <span className="text-[#46CCC6]">10x seus resultados</span> com IA?
          </h2>

          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já estão usando ChatData para otimizar campanhas e
            aumentar vendas. Comece grátis hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] hover:opacity-90 text-black font-semibold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#46CCC6]/25 group"
              onClick={() => navigate('/register')}
            >
              Começar Teste Grátis de 7 Dias
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#46CCC6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#46CCC6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#46CCC6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Setup em 2 minutos</span>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </section>
  );
};
