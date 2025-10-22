import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/landing/Footer';

const PrivacyPolicy = () => {
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
            Política de Privacidade
          </h1>

          <p className="text-white/60 mb-8">
            <strong className="text-white">Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8">
            {/* Seção 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                1. Introdução
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                A ChatData, inscrita no CNPJ sob o nº 58.192.682/0001-61 ("ChatData", "nós", "nosso" ou "nossa"),
                está comprometida em proteger a privacidade e segurança dos dados pessoais de seus usuários
                ("você", "seu" ou "usuário").
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos, compartilhamos e
                protegemos suas informações pessoais quando você utiliza nossa plataforma ChatData
                (disponível em chatdata.com.br), em conformidade com a Lei Geral de Proteção de Dados
                (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.
              </p>
              <p className="text-white/70 leading-relaxed">
                Ao utilizar nossos serviços, você concorda com os termos desta Política de Privacidade.
                Se você não concorda com qualquer parte desta política, não utilize nossos serviços.
              </p>
            </section>

            {/* Seção 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                2. Definições
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Para fins desta política, consideramos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada ou identificável</li>
                <li><strong className="text-white">Tratamento:</strong> Toda operação realizada com dados pessoais (coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação, controle, modificação, comunicação, transferência, difusão ou extração)</li>
                <li><strong className="text-white">Titular:</strong> Pessoa natural a quem se referem os dados pessoais que são objeto de tratamento</li>
                <li><strong className="text-white">Controlador:</strong> Pessoa a quem competem as decisões referentes ao tratamento de dados pessoais (ChatData)</li>
                <li><strong className="text-white">Encarregado (DPO):</strong> Pessoa indicada pelo controlador para atuar como canal de comunicação entre o controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD)</li>
              </ul>
            </section>

            {/* Seção 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                3. Dados Pessoais Coletados
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.1. Dados que você nos fornece diretamente:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Dados de cadastro:</strong> Nome completo, e-mail, telefone, empresa, cargo</li>
                <li><strong className="text-white">Dados de autenticação:</strong> E-mail e senha criptografada (ou autenticação via Google)</li>
                <li><strong className="text-white">Dados de pagamento:</strong> Informações de cartão de crédito e cobrança (processados pela Stripe, não armazenamos dados completos de cartão)</li>
                <li><strong className="text-white">Dados de comunicação:</strong> Mensagens enviadas através de nossos canais de suporte</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.2. Dados coletados automaticamente:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Dados de uso:</strong> Páginas acessadas, recursos utilizados, tempo de permanência, cliques e interações</li>
                <li><strong className="text-white">Dados técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional, dispositivo, resolução de tela</li>
                <li><strong className="text-white">Dados de localização:</strong> País e cidade aproximada baseada no endereço IP</li>
                <li><strong className="text-white">Cookies e tecnologias similares:</strong> Identificadores únicos para melhorar a experiência do usuário</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.3. Dados obtidos de plataformas integradas:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Meta Ads (Facebook/Instagram):</strong> Dados de campanhas publicitárias, métricas de desempenho, gastos com anúncios, alcance, conversões, públicos-alvo</li>
                <li><strong className="text-white">WhatsApp Business:</strong> Dados de conversas (quando autorizado), métricas de mensagens, status de entrega, dados de contatos comerciais</li>
                <li><strong className="text-white">Google (autenticação):</strong> Nome, e-mail, foto de perfil (quando você opta por login via Google)</li>
              </ul>
            </section>

            {/* Seção 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                4. Finalidades do Tratamento de Dados
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Utilizamos seus dados pessoais para as seguintes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Prestação de serviços:</strong> Fornecer acesso à plataforma, processar análises de dados, gerar insights por IA, criar dashboards e relatórios</li>
                <li><strong className="text-white">Gestão de conta:</strong> Criar e gerenciar sua conta de usuário, autenticar seu acesso, personalizar sua experiência</li>
                <li><strong className="text-white">Processamento de pagamentos:</strong> Processar cobranças de assinatura, emitir notas fiscais, gerenciar cancelamentos e reembolsos</li>
                <li><strong className="text-white">Comunicação:</strong> Enviar notificações sobre o serviço, responder dúvidas e solicitações de suporte, enviar atualizações sobre novos recursos</li>
                <li><strong className="text-white">Marketing (com consentimento):</strong> Enviar newsletters, ofertas especiais e materiais promocionais (você pode cancelar a qualquer momento)</li>
                <li><strong className="text-white">Melhoria do serviço:</strong> Analisar o uso da plataforma para aprimorar funcionalidades, corrigir bugs e desenvolver novos recursos</li>
                <li><strong className="text-white">Segurança:</strong> Detectar e prevenir fraudes, abusos, atividades ilegais e violações dos Termos de Serviço</li>
                <li><strong className="text-white">Cumprimento legal:</strong> Atender requisitos legais, regulatórios, processos judiciais e solicitações governamentais</li>
              </ul>
            </section>

            {/* Seção 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                5. Base Legal para o Tratamento
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                O tratamento de seus dados pessoais está fundamentado nas seguintes bases legais previstas na LGPD:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Execução de contrato (Art. 7º, V):</strong> Para prestar os serviços contratados</li>
                <li><strong className="text-white">Consentimento (Art. 7º, I):</strong> Para envio de comunicações de marketing e uso de cookies não essenciais</li>
                <li><strong className="text-white">Legítimo interesse (Art. 7º, IX):</strong> Para melhoria do serviço, segurança e prevenção de fraudes</li>
                <li><strong className="text-white">Cumprimento de obrigação legal (Art. 7º, II):</strong> Para emissão de notas fiscais e atendimento a requisições judiciais</li>
                <li><strong className="text-white">Exercício regular de direitos (Art. 7º, VI):</strong> Para defesa em processos judiciais ou administrativos</li>
              </ul>
            </section>

            {/* Seção 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                6. Compartilhamento de Dados
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">6.1. Não vendemos seus dados pessoais.</strong> Podemos compartilhar seus dados nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Provedores de serviços:</strong> Empresas que nos auxiliam a operar a plataforma (hospedagem, pagamentos, análise de dados, e-mail)</li>
                <li><strong className="text-white">Autoridades governamentais:</strong> Quando exigido por lei, ordem judicial ou regulamentação</li>
                <li><strong className="text-white">Parceiros de negócios:</strong> Com seu consentimento explícito para integrações específicas</li>
                <li><strong className="text-white">Sucessores empresariais:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
                <li><strong className="text-white">Defesa de direitos:</strong> Para proteger nossos direitos legais, propriedade ou segurança</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">6.2. Principais provedores de serviços terceirizados:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Supabase:</strong> Infraestrutura de banco de dados e autenticação (servidores localizados nos EUA)</li>
                <li><strong className="text-white">Stripe:</strong> Processamento de pagamentos com cartão de crédito</li>
                <li><strong className="text-white">Vercel:</strong> Hospedagem da aplicação web</li>
                <li><strong className="text-white">Meta/Facebook:</strong> APIs para integração com Meta Ads e WhatsApp Business</li>
                <li><strong className="text-white">OpenAI/Anthropic:</strong> Processamento de IA para geração de insights (dados anonimizados)</li>
              </ul>

              <p className="text-white/70 leading-relaxed mt-4">
                Todos os nossos parceiros são obrigados contratualmente a proteger seus dados pessoais e
                utilizá-los apenas para as finalidades específicas para as quais foram compartilhados.
              </p>
            </section>

            {/* Seção 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                7. Transferência Internacional de Dados
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Alguns de nossos provedores de serviços estão localizados fora do Brasil, especialmente
                nos Estados Unidos. Ao utilizar nossos serviços, você concorda com a transferência
                internacional de seus dados pessoais.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Garantimos que todas as transferências internacionais de dados são realizadas em conformidade
                com a LGPD e incluem salvaguardas adequadas, como:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Cláusulas contratuais padrão aprovadas pela ANPD</li>
                <li>Certificações de conformidade dos fornecedores (SOC 2, ISO 27001)</li>
                <li>Compromisso contratual de proteção de dados equivalente à LGPD</li>
                <li>Mecanismos de anonimização e pseudonimização quando aplicável</li>
              </ul>
            </section>

            {/* Seção 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                8. Segurança de Dados
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Implementamos medidas técnicas e organizacionais robustas para proteger seus dados pessoais
                contra acesso não autorizado, perda, alteração, divulgação ou destruição, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Criptografia:</strong> Dados sensíveis criptografados em trânsito (TLS/SSL) e em repouso (AES-256)</li>
                <li><strong className="text-white">Autenticação:</strong> Sistema de autenticação seguro com senhas criptografadas (bcrypt) e opção de autenticação de dois fatores</li>
                <li><strong className="text-white">Controle de acesso:</strong> Acesso restrito aos dados apenas para funcionários autorizados que necessitam para desempenhar suas funções</li>
                <li><strong className="text-white">Monitoramento:</strong> Logs de segurança e monitoramento contínuo para detectar atividades suspeitas</li>
                <li><strong className="text-white">Backups:</strong> Backups regulares e redundância de dados para prevenir perda de informações</li>
                <li><strong className="text-white">Auditorias:</strong> Revisões periódicas de segurança e testes de vulnerabilidade</li>
                <li><strong className="text-white">Treinamento:</strong> Capacitação de equipe sobre boas práticas de segurança e proteção de dados</li>
              </ul>

              <p className="text-white/70 leading-relaxed">
                Apesar de todos os esforços, nenhum sistema é 100% seguro. Em caso de incidente de segurança
                que possa gerar risco ou dano relevante aos titulares, comunicaremos a você e à ANPD conforme
                exigido pela legislação.
              </p>
            </section>

            {/* Seção 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                9. Retenção de Dados
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades
                para as quais foram coletados, incluindo requisitos legais, contábeis ou de relatório.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Dados de conta ativa:</strong> Enquanto sua conta estiver ativa e pelo período de prescrição legal após o cancelamento</li>
                <li><strong className="text-white">Dados de pagamento:</strong> Por até 5 anos após a última transação (requisito fiscal brasileiro)</li>
                <li><strong className="text-white">Dados de comunicação:</strong> Por até 2 anos após o último contato</li>
                <li><strong className="text-white">Logs de acesso:</strong> Por até 6 meses (conforme Marco Civil da Internet)</li>
                <li><strong className="text-white">Dados anonimizados:</strong> Podemos manter indefinidamente para análises estatísticas</li>
              </ul>

              <p className="text-white/70 leading-relaxed">
                Após o período de retenção, seus dados serão excluídos de forma segura ou anonimizados
                de forma irreversível.
              </p>
            </section>

            {/* Seção 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                10. Seus Direitos como Titular de Dados (LGPD)
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Conforme a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Confirmação e acesso:</strong> Confirmar a existência de tratamento e acessar seus dados</li>
                <li><strong className="text-white">Correção:</strong> Solicitar correção de dados incompletos, inexatos ou desatualizados</li>
                <li><strong className="text-white">Anonimização, bloqueio ou eliminação:</strong> Solicitar anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade</li>
                <li><strong className="text-white">Portabilidade:</strong> Solicitar portabilidade dos dados a outro fornecedor de serviço ou produto (formato estruturado e interoperável)</li>
                <li><strong className="text-white">Eliminação de dados:</strong> Solicitar eliminação de dados tratados com base no consentimento (exceto quando houver outra base legal)</li>
                <li><strong className="text-white">Informação sobre compartilhamento:</strong> Obter informações sobre entidades públicas e privadas com as quais compartilhamos dados</li>
                <li><strong className="text-white">Informação sobre não consentimento:</strong> Ser informado sobre a possibilidade e consequências de não fornecer consentimento</li>
                <li><strong className="text-white">Revogação do consentimento:</strong> Revogar o consentimento a qualquer momento</li>
                <li><strong className="text-white">Oposição ao tratamento:</strong> Opor-se ao tratamento realizado com fundamento em uma das hipóteses de dispensa de consentimento</li>
                <li><strong className="text-white">Revisão de decisões automatizadas:</strong> Solicitar revisão de decisões tomadas unicamente com base em tratamento automatizado</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">Como exercer seus direitos:</strong>
              </p>
              <p className="text-white/70 leading-relaxed">
                Para exercer qualquer um desses direitos, entre em contato conosco através do e-mail
                <strong className="text-white"> dpo@chatdata.com.br</strong>. Responderemos à sua solicitação em até 15 dias,
                podendo ser prorrogado por mais 15 dias mediante justificativa. Podemos solicitar informações
                adicionais para verificar sua identidade antes de processar a solicitação.
              </p>
            </section>

            {/* Seção 11 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                11. Cookies e Tecnologias de Rastreamento
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso
                da plataforma e personalizar conteúdo. Você pode gerenciar suas preferências de cookies
                através das configurações do seu navegador.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">Tipos de cookies utilizados:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Cookies essenciais:</strong> Necessários para o funcionamento básico da plataforma (autenticação, segurança)</li>
                <li><strong className="text-white">Cookies de desempenho:</strong> Coletam informações sobre como você usa a plataforma para melhorias</li>
                <li><strong className="text-white">Cookies de funcionalidade:</strong> Lembram suas preferências e personalizam sua experiência</li>
                <li><strong className="text-white">Cookies de marketing:</strong> Utilizados para exibir anúncios relevantes (apenas com seu consentimento)</li>
              </ul>
            </section>

            {/* Seção 12 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                12. Dados de Menores de Idade
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Nossos serviços são destinados a pessoas com 18 anos ou mais. Não coletamos intencionalmente
                dados pessoais de menores de 18 anos sem o consentimento dos pais ou responsáveis legais.
              </p>
              <p className="text-white/70 leading-relaxed">
                Se tomarmos conhecimento de que coletamos dados de um menor sem a devida autorização,
                tomaremos medidas imediatas para excluir essas informações. Se você acredita que podemos
                ter dados de um menor, entre em contato conosco imediatamente.
              </p>
            </section>

            {/* Seção 13 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                13. Alterações nesta Política
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em
                nossas práticas, legislação ou serviços. Quando fizermos alterações materiais, notificaremos
                você por e-mail ou através de um aviso destacado na plataforma com pelo menos 15 dias de
                antecedência.
              </p>
              <p className="text-white/70 leading-relaxed">
                Recomendamos que você revise esta política regularmente. A data da última atualização está
                indicada no topo desta página. O uso continuado dos serviços após a entrada em vigor das
                alterações constitui aceitação da política atualizada.
              </p>
            </section>

            {/* Seção 14 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                14. Legislação e Foro
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Esta Política de Privacidade é regida pelas leis da República Federativa do Brasil,
                em especial:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD)</li>
                <li>Lei nº 12.965/2014 (Marco Civil da Internet)</li>
                <li>Lei nº 8.078/1990 (Código de Defesa do Consumidor)</li>
              </ul>
              <p className="text-white/70 leading-relaxed">
                Quaisquer disputas relacionadas a esta política serão resolvidas no foro da comarca
                onde você reside, conforme previsto no Código de Defesa do Consumidor.
              </p>
            </section>

            {/* Seção 15 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                15. Encarregado de Dados (DPO)
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Nomeamos um Encarregado de Proteção de Dados (Data Protection Officer - DPO) para atuar
                como canal de comunicação entre o ChatData, os titulares de dados e a Autoridade Nacional
                de Proteção de Dados (ANPD).
              </p>
              <p className="text-white/70 leading-relaxed">
                O DPO é responsável por aceitar reclamações e comunicações dos titulares, prestar
                esclarecimentos e adotar providências relacionadas ao tratamento de dados pessoais.
              </p>
            </section>

            {/* Seção 16 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                16. Contato
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Para questões sobre esta Política de Privacidade, exercer seus direitos como titular de
                dados ou entrar em contato com nosso Encarregado de Dados (DPO), utilize os canais abaixo:
              </p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-2">
                <p className="text-white/70">
                  <strong className="text-white">ChatData</strong>
                </p>
                <p className="text-white/70">
                  <strong className="text-white">CNPJ:</strong> 58.192.682/0001-61
                </p>
                <p className="text-white/70">
                  <strong className="text-white">E-mail geral:</strong> contato@chatdata.com.br
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
                Ao usar o ChatData, você reconhece que leu, compreendeu e concordou com os termos desta
                Política de Privacidade e com o tratamento de seus dados pessoais conforme aqui descrito.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
