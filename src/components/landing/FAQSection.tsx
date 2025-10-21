import { LiquidGlass } from '@/components/LiquidGlass';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Como funciona o período de teste grátis?',
    answer: 'Você tem 14 dias para testar o ChatData sem compromisso. Não pedimos cartão de crédito no cadastro. Explore todas as funcionalidades e decida se é para você.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Absolutamente. Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados do Meta Ads e WhatsApp são protegidos com os mesmos padrões bancários. Nunca compartilhamos suas informações com terceiros.',
  },
  {
    question: 'Preciso ter conhecimento técnico para usar?',
    answer: 'Não! O ChatData foi desenvolvido para ser intuitivo. A IA traduz dados complexos em linguagem simples. Se você sabe usar WhatsApp, já sabe usar o ChatData.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, sem multas ou burocracia. Cancele com um clique no painel de configurações. Não fazemos retenção forçada - se não estiver agregando valor, você é livre para sair.',
  },
  {
    question: 'Como é feita a integração com Meta Ads?',
    answer: 'A integração é feita via OAuth oficial do Facebook, em menos de 2 minutos. Você autoriza o acesso (somente leitura por padrão) e pronto. Não precisamos de senhas ou acessos administrativos.',
  },
  {
    question: 'A IA funciona em português?',
    answer: 'Sim! Nossa IA foi treinada especificamente para o mercado brasileiro. Todos os insights, relatórios e alertas chegam em português claro e direto.',
  },
  {
    question: 'Quantas campanhas posso monitorar?',
    answer: 'Depende do plano escolhido. O Starter permite 1 conta, Professional até 3 contas, e Enterprise ilimitado. Dentro de cada conta, monitoramos todas as campanhas ativas automaticamente.',
  },
  {
    question: 'Posso migrar de plano depois?',
    answer: 'Claro! Você pode fazer upgrade ou downgrade a qualquer momento. Ajustamos o valor proporcionalmente ao tempo restante do ciclo de cobrança.',
  },
];

export const FAQSection = () => {
  return (
    <section className="relative py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-white/80 font-semibold text-sm">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Perguntas <span className="text-[#46CCC6]">frequentes</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Tire suas dúvidas sobre o ChatData. Não encontrou a resposta? Fale conosco no chat.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <LiquidGlass className="p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-white/10 last:border-0"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-[#46CCC6] transition-colors py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/70 leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
};
