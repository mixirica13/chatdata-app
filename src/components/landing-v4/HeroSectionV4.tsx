import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowRight, MessageCircle, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTracking } from '@/hooks/useTracking';

export const HeroSectionV4 = () => {
  const navigate = useNavigate();
  const { trackEvent } = useTracking();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial from-[#46CCC6]/20 via-black to-black opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#46CCC6]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#46CCC6]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <Logo className="h-24 w-auto md:h-32" />
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <Smartphone className="w-4 h-4 text-[#46CCC6]" />
            <span className="text-sm text-white/90 font-medium">100% via WhatsApp • Nenhum app necessário</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight text-center animate-fade-in-up" style={{ fontFamily: 'Exo 2, sans-serif' }}>
          IA de Tráfego Pago
          <br />
          <span className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] bg-clip-text text-transparent">
            no WhatsApp
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8 text-center leading-relaxed animate-fade-in-up">
          Pergunte sobre suas campanhas, receba insights e ações para melhorar seu ROI, tudo no Whatsapp
        </p>

        {/* Value prop */}
        <div className="flex justify-center mb-12 animate-fade-in-up">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#46CCC6]" />
              Sem dashboard complicado
            </span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#46CCC6]" />
              Sem app para baixar
            </span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#46CCC6]" />
              Só você e o WhatsApp
            </span>
          </div>
        </div>

        {/* WhatsApp Preview - Mobile first */}
        <div className="max-w-6xl mx-auto mb-12 animate-fade-in-up">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity" />

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-[#46CCC6]/30 transition-all">
              {/* WhatsApp interface mockup - center single phone */}
              <div className="max-w-md mx-auto">
                <div className="aspect-[9/16] bg-gradient-to-br from-white/10 to-transparent rounded-3xl flex flex-col items-center justify-center p-8 relative overflow-hidden border border-white/10">
                  {/* Phone mockup header */}
                  <div className="absolute top-0 left-0 right-0 p-4 bg-[#075E54] rounded-t-3xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src="/logo-hd.png" alt="ChatData" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">ChatData IA</div>
                        <div className="text-white/70 text-xs">online agora</div>
                      </div>
                    </div>
                  </div>

                  {/* Messages preview */}
                  <div className="mt-20 w-full space-y-3">
                    <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm max-w-[85%] ml-auto">
                      <p className="text-gray-800 text-xs">Como tá o desempenho da campanha [C007]Black Friday?</p>
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%]">
                      <p className="text-gray-800 text-xs font-semibold mb-1">📊 [C007]Black Friday - Overview</p>
                      <p className="text-gray-800 text-xs mb-2">Últimas 24h:</p>
                      <p className="text-gray-800 text-xs">💰 Gasto: R$ 2.847,50</p>
                      <p className="text-gray-800 text-xs">👁️ Impressões: 124.5K</p>
                      <p className="text-gray-800 text-xs">🎯 Cliques: 3.2K (CTR 2.57%)</p>
                      <p className="text-gray-800 text-xs">🛒 Conversões: 87 vendas</p>
                      <p className="text-gray-800 text-xs">📈 ROAS: 4.2x</p>
                      <p className="text-gray-800 text-xs mt-2">✅ Performance acima da média! 🚀</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="max-w-6xl mx-auto mb-12 animate-fade-in-up">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-all animate-pulse" />
            <Button
              size="lg"
              className="relative w-full bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] hover:from-[#52D9D3] hover:to-[#3AADA8] text-black font-bold px-8 py-7 text-xl rounded-3xl shadow-2xl shadow-[#46CCC6]/50 hover:shadow-[#46CCC6]/70 hover:scale-[1.02] transition-all group border-2 border-white/20"
              onClick={() => {
                trackEvent('cta_clicked', {
                  cta_text: 'Testar Grátis',
                  cta_location: 'hero_section',
                });
                navigate('/register');
              }}
            >
              Testar Grátis
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Social proof quick stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-in-up">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#46CCC6] mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              0
            </div>
            <p className="text-white/60 text-xs md:text-sm">Apps para instalar</p>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#46CCC6] mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              100%
            </div>
            <p className="text-white/60 text-xs md:text-sm">No WhatsApp</p>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#46CCC6] mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              24/7
            </div>
            <p className="text-white/60 text-xs md:text-sm">Disponível</p>
          </div>
        </div>
      </div>
    </section>
  );
};
