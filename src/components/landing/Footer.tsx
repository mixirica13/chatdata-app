import { Logo } from '@/components/Logo';
import { Facebook, Instagram, Linkedin, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <Logo className="h-12 w-auto mb-4" />
            <p className="text-white/60 text-sm leading-relaxed">
              Inteligência Artificial que transforma dados do Meta Ads e WhatsApp em decisões lucrativas.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Produto
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Integrações
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Atualizações
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Empresa
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/termos" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="/privacidade" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="/exclusao-dados" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Exclusão de Dados
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-[#46CCC6] transition-colors text-sm">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} ChatData. Todos os direitos reservados.
          </p>

          {/* Social links */}
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#46CCC6]/30 flex items-center justify-center transition-all group"
            >
              <Instagram className="w-5 h-5 text-white/60 group-hover:text-[#46CCC6] transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#46CCC6]/30 flex items-center justify-center transition-all group"
            >
              <Facebook className="w-5 h-5 text-white/60 group-hover:text-[#46CCC6] transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#46CCC6]/30 flex items-center justify-center transition-all group"
            >
              <Linkedin className="w-5 h-5 text-white/60 group-hover:text-[#46CCC6] transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#46CCC6]/30 flex items-center justify-center transition-all group"
            >
              <Twitter className="w-5 h-5 text-white/60 group-hover:text-[#46CCC6] transition-colors" />
            </a>
            <a
              href="mailto:contato@chatdata.com.br"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#46CCC6]/30 flex items-center justify-center transition-all group"
            >
              <Mail className="w-5 h-5 text-white/60 group-hover:text-[#46CCC6] transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
