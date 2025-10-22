import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/landing/Footer';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black sticky top-0 z-50 backdrop-blur-lg bg-black/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo className="h-10 w-auto" />
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 text-white hover:text-[#46CCC6] hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Termos de Serviço
          </h1>

          <p className="text-white/60 mb-8">
            <strong className="text-white">Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8">
            {/* Seção 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                1. Aceitação dos Termos
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Ao acessar e usar a plataforma ChatData ("Plataforma", "Serviço", "nós" ou "nosso"),
                você ("Usuário", "você" ou "seu") concorda em cumprir e estar vinculado a estes
                Termos de Serviço ("Termos"). Se você não concorda com estes Termos, não utilize
                nossos serviços.
              </p>
              <p className="text-white/70 leading-relaxed">
                O ChatData é uma plataforma de inteligência artificial que transforma dados do
                Meta Ads e WhatsApp em insights e decisões de negócio, disponibilizada pela
                ChatData, inscrita no CNPJ sob o nº 58.192.682/0001-61.
              </p>
            </section>

            {/* Seção 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                2. Descrição dos Serviços
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                O ChatData oferece os seguintes serviços:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Análise de dados e métricas do Meta Ads (Facebook e Instagram Ads)</li>
                <li>Análise de conversas e métricas do WhatsApp Business</li>
                <li>Geração de insights através de inteligência artificial</li>
                <li>Dashboards e relatórios de desempenho</li>
                <li>Recomendações automatizadas para otimização de campanhas</li>
                <li>Integração com plataformas Meta (Facebook, Instagram, WhatsApp)</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Reservamo-nos o direito de modificar, suspender ou descontinuar, temporária ou
                permanentemente, o Serviço (ou qualquer parte dele) com ou sem aviso prévio.
              </p>
            </section>

            {/* Seção 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                3. Cadastro e Conta do Usuário
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.1. Elegibilidade:</strong> Para usar o ChatData, você deve ter pelo menos
                18 anos de idade e capacidade legal para celebrar contratos vinculativos.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.2. Informações de Cadastro:</strong> Ao criar uma conta, você concorda em
                fornecer informações precisas, atuais e completas. Você é responsável por manter a
                confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.3. Segurança da Conta:</strong> Você deve notificar-nos imediatamente sobre
                qualquer uso não autorizado de sua conta ou qualquer outra violação de segurança.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">3.4. Conta Única:</strong> Você não pode ter mais de uma conta ativa sem nossa
                autorização prévia por escrito.
              </p>
            </section>

            {/* Seção 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                4. Assinaturas e Pagamentos
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.1. Planos de Assinatura:</strong> O ChatData oferece diferentes planos de
                assinatura com recursos e preços variados. Os detalhes de cada plano estão disponíveis
                em nossa página de preços.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.2. Cobrança:</strong> As assinaturas são cobradas de forma recorrente
                (mensal ou anual) através da plataforma de pagamentos Stripe. Ao assinar, você autoriza
                a cobrança automática no cartão de crédito ou método de pagamento cadastrado.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.3. Renovação Automática:</strong> Sua assinatura será renovada automaticamente
                ao final de cada período, a menos que você cancele antes da data de renovação.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.4. Alteração de Preços:</strong> Reservamo-nos o direito de modificar os
                preços de nossas assinaturas. Notificaremos você com pelo menos 30 dias de antecedência
                sobre qualquer alteração de preço que afete sua assinatura ativa.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.5. Política de Reembolso:</strong> Oferecemos uma garantia de satisfação de 7 dias.
                Se você não estiver satisfeito com o serviço, pode solicitar o cancelamento e reembolso
                integral dentro dos primeiros 7 dias da sua primeira assinatura. Após este período, não
                oferecemos reembolsos proporcionais.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">4.6. Impostos:</strong> Todos os preços são apresentados em Reais (BRL) e podem
                estar sujeitos a impostos aplicáveis conforme a legislação brasileira.
              </p>
            </section>

            {/* Seção 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                5. Cancelamento e Suspensão
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">5.1. Cancelamento pelo Usuário:</strong> Você pode cancelar sua assinatura a
                qualquer momento através das configurações da sua conta. O cancelamento terá efeito ao
                final do período de cobrança atual, e você manterá acesso aos serviços até essa data.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">5.2. Suspensão ou Cancelamento pelo ChatData:</strong> Reservamo-nos o direito
                de suspender ou cancelar sua conta se você violar estes Termos, realizar atividades
                fraudulentas, ou por qualquer outro motivo legítimo, com ou sem aviso prévio.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">5.3. Efeito do Cancelamento:</strong> Após o cancelamento, você perderá acesso
                aos recursos da plataforma. Seus dados poderão ser mantidos conforme nossa Política de
                Privacidade e requisitos legais.
              </p>
            </section>

            {/* Seção 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                6. Uso Aceitável e Proibições
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Ao usar o ChatData, você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Violar quaisquer leis, regulamentos ou direitos de terceiros</li>
                <li>Usar o serviço para fins ilegais, fraudulentos ou prejudiciais</li>
                <li>Tentar obter acesso não autorizado a sistemas, dados ou redes</li>
                <li>Interferir ou interromper o funcionamento da plataforma</li>
                <li>Usar técnicas de scraping, crawling ou mineração de dados sem autorização</li>
                <li>Compartilhar suas credenciais de acesso com terceiros</li>
                <li>Fazer engenharia reversa, descompilar ou desarmontar qualquer parte do serviço</li>
                <li>Enviar spam, vírus, malware ou qualquer código malicioso</li>
                <li>Usar o serviço de forma que viole os Termos de Serviço do Meta/Facebook/WhatsApp</li>
                <li>Revender ou redistribuir o serviço sem autorização expressa por escrito</li>
              </ul>
            </section>

            {/* Seção 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                7. Propriedade Intelectual
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">7.1. Propriedade do ChatData:</strong> Todo o conteúdo, recursos, funcionalidades,
                código-fonte, design, marcas, logos e outros materiais da plataforma são de propriedade
                exclusiva do ChatData e são protegidos por leis de propriedade intelectual.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">7.2. Licença de Uso:</strong> Concedemos a você uma licença limitada, não exclusiva,
                intransferível e revogável para acessar e usar a plataforma de acordo com estes Termos.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">7.3. Seus Dados:</strong> Você mantém todos os direitos sobre os dados que carrega
                ou gera através da plataforma. Concede-nos uma licença para processar esses dados conforme
                necessário para fornecer nossos serviços.
              </p>
            </section>

            {/* Seção 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                8. Privacidade e Proteção de Dados (LGPD)
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.1. Coleta e Uso de Dados:</strong> Coletamos e processamos seus dados pessoais
                conforme descrito em nossa Política de Privacidade, em conformidade com a Lei Geral de
                Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.2. Dados de Terceiros:</strong> Ao conectar suas contas do Meta Ads e WhatsApp,
                você autoriza o ChatData a acessar e processar dados dessas plataformas para fornecer nossos
                serviços de análise e insights.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.3. Segurança:</strong> Implementamos medidas técnicas e organizacionais adequadas
                para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.4. Direitos do Titular:</strong> Conforme a LGPD, você tem direito a: acessar,
                corrigir, excluir, portar, revogar consentimento e opor-se ao tratamento de seus dados
                pessoais. Para exercer esses direitos, entre em contato conosco.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">8.5. Compartilhamento de Dados:</strong> Não vendemos seus dados pessoais. Podemos
                compartilhar dados com provedores de serviços terceirizados (como Stripe para pagamentos e
                Supabase para infraestrutura) que nos auxiliam a operar a plataforma.
              </p>
            </section>

            {/* Seção 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                9. Integrações com Terceiros
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">9.1. Meta/Facebook/WhatsApp:</strong> O ChatData se integra com plataformas da Meta
                (Facebook, Instagram, WhatsApp) através de suas APIs oficiais. Ao usar essas integrações,
                você também está sujeito aos Termos de Serviço dessas plataformas.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">9.2. Responsabilidade:</strong> Não somos responsáveis por alterações, interrupções
                ou descontinuação das APIs ou serviços de terceiros que possam afetar o funcionamento do
                ChatData.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">9.3. Autorizações:</strong> Você é responsável por manter as autorizações e
                permissões necessárias nas plataformas de terceiros para que possamos acessar seus dados.
              </p>
            </section>

            {/* Seção 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                10. Isenção de Garantias
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER TIPO,
                EXPRESSAS OU IMPLÍCITAS. NÃO GARANTIMOS QUE:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>O serviço atenderá suas necessidades específicas</li>
                <li>O serviço será ininterrupto, oportuno, seguro ou livre de erros</li>
                <li>Os resultados obtidos através do serviço serão precisos ou confiáveis</li>
                <li>Quaisquer erros no serviço serão corrigidos</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Os insights e recomendações gerados pela IA são baseados em análise de dados e não
                constituem aconselhamento profissional. Você é responsável por suas decisões de negócio.
              </p>
            </section>

            {/* Seção 11 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                11. Limitação de Responsabilidade
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI, O CHATDATA, SEUS DIRETORES, FUNCIONÁRIOS,
                PARCEIROS E AFILIADOS NÃO SERÃO RESPONSÁVEIS POR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Danos indiretos, incidentais, especiais, consequenciais ou punitivos</li>
                <li>Perda de lucros, receitas, dados, uso ou outras perdas intangíveis</li>
                <li>Danos resultantes do uso ou incapacidade de usar o serviço</li>
                <li>Danos resultantes de acesso não autorizado aos seus dados</li>
                <li>Danos causados por condutas de terceiros no serviço</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Nossa responsabilidade total em qualquer reivindicação relacionada ao serviço será limitada
                ao valor pago por você nos 12 meses anteriores ao evento que deu origem à reivindicação.
              </p>
            </section>

            {/* Seção 12 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                12. Indenização
              </h2>
              <p className="text-white/70 leading-relaxed">
                Você concorda em indenizar, defender e isentar o ChatData, seus diretores, funcionários,
                parceiros e afiliados de quaisquer reivindicações, responsabilidades, danos, perdas e
                despesas (incluindo honorários advocatícios) decorrentes de: (a) seu uso do serviço;
                (b) violação destes Termos; (c) violação de direitos de terceiros; ou (d) qualquer
                conteúdo que você envie ou compartilhe através do serviço.
              </p>
            </section>

            {/* Seção 13 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                13. Modificações dos Termos
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Quando fizermos
                alterações materiais, notificaremos você por e-mail ou através de um aviso na plataforma
                com pelo menos 15 dias de antecedência.
              </p>
              <p className="text-white/70 leading-relaxed">
                O uso continuado do serviço após a entrada em vigor das alterações constitui sua aceitação
                dos novos Termos. Se você não concordar com as alterações, deve cancelar sua conta.
              </p>
            </section>

            {/* Seção 14 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                14. Legislação Aplicável e Jurisdição
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Estes Termos são regidos pelas leis da República Federativa do Brasil, especialmente:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD)</li>
                <li>Lei nº 12.965/2014 (Marco Civil da Internet)</li>
                <li>Lei nº 8.078/1990 (Código de Defesa do Consumidor)</li>
                <li>Lei nº 10.406/2002 (Código Civil)</li>
              </ul>
              <p className="text-white/70 leading-relaxed">
                Fica eleito o foro da comarca de [CIDADE/ESTADO] para dirimir quaisquer controvérsias
                decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado
                que seja.
              </p>
            </section>

            {/* Seção 15 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                15. Disposições Gerais
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.1. Acordo Integral:</strong> Estes Termos, juntamente com nossa Política de
                Privacidade, constituem o acordo integral entre você e o ChatData.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.2. Renúncia:</strong> A falha em exercer ou fazer cumprir qualquer direito ou
                disposição destes Termos não constituirá renúncia de tal direito ou disposição.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.3. Divisibilidade:</strong> Se qualquer disposição destes Termos for considerada
                inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.4. Cessão:</strong> Você não pode ceder ou transferir estes Termos sem nosso
                consentimento prévio por escrito. Podemos ceder nossos direitos a qualquer afiliada ou
                sucessora.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">15.5. Sobrevivência:</strong> As disposições que, por sua natureza, devem
                sobreviver ao término destes Termos (incluindo disposições de propriedade intelectual,
                isenções de garantia e limitações de responsabilidade) continuarão em vigor.
              </p>
            </section>

            {/* Seção 16 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                16. Contato
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Para questões sobre estes Termos de Serviço ou para exercer seus direitos conforme a LGPD,
                entre em contato conosco:
              </p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-2">
                <p className="text-white/70">
                  <strong className="text-white">E-mail:</strong> contato@chatdata.com.br
                </p>
                <p className="text-white/70">
                  <strong className="text-white">E-mail do Encarregado de Dados (DPO):</strong> dpo@chatdata.com.br
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Website:</strong> https://chatdata.com.br
                </p>
              </div>
            </section>

            {/* Consentimento */}
            <section className="border-t border-white/10 pt-8 mt-8">
              <p className="text-white/70 leading-relaxed font-medium">
                Ao usar o ChatData, você reconhece que leu, compreendeu e concordou em estar vinculado a
                estes Termos de Serviço.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer da LP-V3 */}
      <Footer />
    </div>
  );
};

export default TermsOfService;
