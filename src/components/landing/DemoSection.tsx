import { LiquidGlass } from '@/components/LiquidGlass';
import { Smartphone, Play } from 'lucide-react';

export const DemoSection = () => {
  return (
    <section id="demo" className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Veja o ChatData <span className="text-[#46CCC6]">em ação</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Descubra como é fácil receber insights poderosos diretamente no seu WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Screenshot do WhatsApp */}
          <LiquidGlass className="p-8">
            <div className="aspect-[9/16] bg-gradient-to-br from-white/10 to-transparent rounded-3xl flex flex-col items-center justify-center max-w-sm mx-auto">
              <Smartphone className="w-16 h-16 text-[#46CCC6] mb-4" />
              <p className="text-white/60 text-center mb-2">Preview WhatsApp</p>
              <p className="text-white/40 text-sm text-center px-8">
                Adicione aqui o screenshot das conversas com a IA
              </p>
            </div>
          </LiquidGlass>

          {/* Screenshot do Dashboard */}
          <div className="space-y-6">
            <LiquidGlass className="p-8">
              <div className="aspect-video bg-gradient-to-br from-white/10 to-transparent rounded-2xl flex flex-col items-center justify-center">
                <Play className="w-12 h-12 text-[#46CCC6] mb-4" />
                <p className="text-white/60 text-center mb-2">Dashboard em Tempo Real</p>
                <p className="text-white/40 text-sm text-center px-8">
                  Adicione aqui o vídeo ou screenshot do dashboard
                </p>
              </div>
            </LiquidGlass>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <LiquidGlass className="p-6 text-center">
                <div className="text-3xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  24/7
                </div>
                <p className="text-white/60 text-sm">Monitoramento</p>
              </LiquidGlass>
              <LiquidGlass className="p-6 text-center">
                <div className="text-3xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  &lt;2min
                </div>
                <p className="text-white/60 text-sm">Setup</p>
              </LiquidGlass>
              <LiquidGlass className="p-6 text-center">
                <div className="text-3xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  100%
                </div>
                <p className="text-white/60 text-sm">Automático</p>
              </LiquidGlass>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
