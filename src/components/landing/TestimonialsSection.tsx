import { LiquidGlass } from '@/components/LiquidGlass';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'João Silva',
    role: 'CEO',
    company: 'E-commerce Brasil',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Reduzi 35% do custo por aquisição em apenas 2 semanas. A IA identifica problemas que eu nunca teria visto sozinho.',
  },
  {
    name: 'Maria Santos',
    role: 'Gestora de Tráfego',
    company: 'Agência Digital',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Receber insights direto no WhatsApp mudou meu workflow. Consigo otimizar campanhas em tempo real, de qualquer lugar.',
  },
  {
    name: 'Carlos Mendes',
    role: 'Diretor de Marketing',
    company: 'Tech Startup',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Finalmente consigo apresentar dados claros para a diretoria. O ChatData transforma números complexos em ações práticas.',
  },
  {
    name: 'Ana Paula',
    role: 'Empreendedora',
    company: 'Loja Online',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Como não tenho equipe técnica, o ChatData é essencial. A IA faz o trabalho de um analista profissional por mim.',
  },
  {
    name: 'Roberto Costa',
    role: 'Coordenador de Mídia',
    company: 'Rede de Franquias',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Escalei a operação de 5 para 20 campanhas sem contratar mais gente. A automação é impressionante.',
  },
  {
    name: 'Fernanda Lima',
    role: 'Performance Manager',
    company: 'Multinacional',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'ROI aumentou 127% em 3 meses. Os alertas inteligentes me salvaram de desperdiçar milhares em campanhas mal configuradas.',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="relative py-16 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#46CCC6]/5 to-black" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">DEPOIMENTOS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Resultados <span className="text-[#46CCC6]">comprovados</span> por quem usa
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já transformaram seus resultados com ChatData.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <LiquidGlass key={index} className="p-6 flex flex-col">
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#46CCC6] text-[#46CCC6]" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote className="w-8 h-8 text-[#46CCC6]/30 mb-4" />

              {/* Testimonial text */}
              <p className="text-white/80 mb-6 leading-relaxed flex-1">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#46CCC6] to-[#2D9B96] flex items-center justify-center">
                  <span className="text-black font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-white/60 text-sm">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </LiquidGlass>
          ))}
        </div>

        {/* Social proof stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              500+
            </div>
            <p className="text-white/60">Usuários Ativos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              98%
            </div>
            <p className="text-white/60">Satisfação</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              R$2M+
            </div>
            <p className="text-white/60">Economizados</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#46CCC6] mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              4.9/5
            </div>
            <p className="text-white/60">Avaliação</p>
          </div>
        </div>
      </div>
    </section>
  );
};
