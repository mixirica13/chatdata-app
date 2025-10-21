import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial from-[#46CCC6]/20 via-black to-black opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#46CCC6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#46CCC6]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <Logo className="h-24 w-auto md:h-32" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-[#46CCC6]" />
          <span className="text-sm text-white/80">Inteligência Artificial para WhatsApp e Meta Ads</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ fontFamily: 'Exo 2, sans-serif' }}>
          Transforme Seus Dados em
          <br />
          <span className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] bg-clip-text text-transparent">
            Decisões Inteligentes
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12 animate-fade-in-up">
          Conecte seu Meta Ads e WhatsApp. Receba insights poderosos gerados por IA diretamente no seu celular.
          Otimize suas campanhas e venda mais com análises em tempo real.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up">
          <Button
            size="lg"
            className="bg-[#46CCC6] hover:bg-[#3AB5AF] text-black font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#46CCC6]/25 hover:shadow-[#46CCC6]/40 transition-all group"
            onClick={() => navigate('/register')}
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-6 text-lg rounded-xl backdrop-blur-xl"
            onClick={() => {
              const demoSection = document.getElementById('demo');
              demoSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Ver Demonstração
          </Button>
        </div>

        {/* Screenshot placeholder */}
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 hover:border-[#46CCC6]/30 transition-all">
              {/* Placeholder para screenshot do dashboard */}
              <div className="aspect-video bg-gradient-to-br from-white/10 to-transparent rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#46CCC6]" />
                  </div>
                  <p className="text-white/60 text-sm">Preview do Dashboard</p>
                  <p className="text-white/40 text-xs mt-2">Adicione sua screenshot aqui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
