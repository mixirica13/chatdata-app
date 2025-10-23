import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft, Mail, Shield, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Footer } from '@/components/landing/Footer';

const DataDeletion = () => {
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
          {/* Header com ícone */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <Trash2 className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-0" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Exclusão de Dados
            </h1>
          </div>

          <p className="text-white/60 mb-8">
            <strong className="text-white">Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8">
            {/* Introdução */}
            <section>
              <p className="text-white/70 leading-relaxed mb-4">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e as
                políticas de privacidade das plataformas Meta (Facebook, Instagram, WhatsApp), o ChatData
                respeita seu direito de solicitar a exclusão de seus dados pessoais.
              </p>
              <p className="text-white/70 leading-relaxed">
                Esta página fornece instruções detalhadas sobre como você pode solicitar a exclusão de
                seus dados armazenados em nossa plataforma.
              </p>
            </section>

            {/* O que será excluído */}
            <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-[#46CCC6]" />
                <h2 className="text-2xl font-semibold text-white mb-0" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  O que será excluído?
                </h2>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                Ao solicitar a exclusão de seus dados, as seguintes informações serão removidas permanentemente
                de nossos sistemas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Dados da conta:</strong> Nome, e-mail, telefone, informações de perfil</li>
                <li><strong className="text-white">Dados de autenticação:</strong> Credenciais e tokens de acesso</li>
                <li><strong className="text-white">Dados de uso:</strong> Histórico de conversas com a IA, consultas, dashboards salvos</li>
                <li><strong className="text-white">Dados de integração:</strong> Tokens de acesso do Meta Ads e WhatsApp (serão revogados)</li>
                <li><strong className="text-white">Dados de pagamento:</strong> Informações de assinatura (dados de cartão são armazenados apenas pela Stripe)</li>
                <li><strong className="text-white">Preferências e configurações:</strong> Todas as configurações personalizadas</li>
              </ul>
            </section>

            {/* Informações importantes */}
            <section className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-amber-400" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Informações Importantes
              </h2>
              <ul className="list-disc pl-6 space-y-3 text-white/70">
                <li>
                  <strong className="text-white">Esta ação é irreversível.</strong> Uma vez que seus dados forem
                  excluídos, não será possível recuperá-los.
                </li>
                <li>
                  <strong className="text-white">Sua assinatura será cancelada</strong> automaticamente ao excluir
                  seus dados. Você não terá mais acesso à plataforma.
                </li>
                <li>
                  <strong className="text-white">Obrigações legais:</strong> Alguns dados podem ser retidos por
                  períodos específicos para cumprimento de obrigações fiscais e legais (ex: notas fiscais por 5 anos).
                </li>
                <li>
                  <strong className="text-white">Dados anonimizados:</strong> Dados estatísticos anonimizados podem
                  ser mantidos para análises, sem identificação pessoal.
                </li>
                <li>
                  <strong className="text-white">Prazo de processamento:</strong> A exclusão será processada em até
                  30 dias após a solicitação.
                </li>
              </ul>
            </section>

            {/* Como solicitar */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Como Solicitar a Exclusão de Dados
              </h2>

              <div className="space-y-4">
                {/* Opção 1 */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#46CCC6]/10 rounded-full flex items-center justify-center border border-[#46CCC6]/20">
                      <span className="text-[#46CCC6] font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Pela Plataforma (Recomendado)
                      </h3>
                      <ol className="list-decimal pl-6 space-y-2 text-white/70">
                        <li>Faça login na sua conta ChatData</li>
                        <li>Acesse o menu <strong className="text-white">Configurações</strong></li>
                        <li>Clique na aba <strong className="text-white">Conta</strong></li>
                        <li>Role até a seção <strong className="text-white">"Zona de Perigo"</strong></li>
                        <li>Clique em <strong className="text-white">"Excluir Minha Conta e Dados"</strong></li>
                        <li>Confirme a exclusão (você precisará digitar sua senha)</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Opção 2 */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#46CCC6]/10 rounded-full flex items-center justify-center border border-[#46CCC6]/20">
                      <span className="text-[#46CCC6] font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Por E-mail
                      </h3>
                      <p className="text-white/70 mb-3">
                        Se você não consegue acessar sua conta ou prefere solicitar por e-mail:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2 text-white/70 mb-4">
                        <li>Envie um e-mail para <strong className="text-white">dpo@chatdata.com.br</strong></li>
                        <li>Use o e-mail cadastrado na plataforma</li>
                        <li>Assunto: <strong className="text-white">"Solicitação de Exclusão de Dados"</strong></li>
                        <li>No corpo do e-mail, inclua:
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Seu nome completo</li>
                            <li>E-mail cadastrado</li>
                            <li>Confirmação de que deseja excluir todos os seus dados</li>
                            <li>Motivo da exclusão (opcional)</li>
                          </ul>
                        </li>
                      </ol>
                      <div className="bg-black/30 border border-white/10 p-4 rounded-lg">
                        <p className="text-white/60 text-sm mb-2">
                          <strong className="text-white">Modelo de e-mail:</strong>
                        </p>
                        <div className="bg-black/50 p-4 rounded border border-white/5 font-mono text-sm text-white/70">
                          <p className="mb-2">Assunto: Solicitação de Exclusão de Dados</p>
                          <p className="mb-2">---</p>
                          <p className="mb-2">Olá,</p>
                          <p className="mb-2">Solicito a exclusão completa de todos os meus dados pessoais da plataforma ChatData.</p>
                          <p className="mb-2">Nome: [Seu nome completo]</p>
                          <p className="mb-2">E-mail: [seu@email.com]</p>
                          <p className="mb-2">Confirmo que estou ciente de que esta ação é irreversível.</p>
                          <p>Atenciosamente,<br />[Seu nome]</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opção 3 - Usuários de apps Meta */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#46CCC6]/10 rounded-full flex items-center justify-center border border-[#46CCC6]/20">
                      <span className="text-[#46CCC6] font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Para Usuários de Apps Meta (Facebook/Instagram)
                      </h3>
                      <p className="text-white/70 mb-3">
                        Se você conectou sua conta através do Facebook ou Instagram:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2 text-white/70">
                        <li>Acesse as configurações do Facebook/Instagram</li>
                        <li>Vá em <strong className="text-white">Aplicativos e Sites</strong></li>
                        <li>Encontre <strong className="text-white">ChatData</strong> na lista</li>
                        <li>Clique em <strong className="text-white">Remover</strong></li>
                        <li>Selecione a opção <strong className="text-white">"Excluir seus dados do ChatData"</strong></li>
                      </ol>
                      <p className="text-white/60 text-sm mt-4">
                        💡 Após remover o aplicativo pelo Meta, recomendamos também enviar um e-mail para
                        dpo@chatdata.com.br confirmando a exclusão completa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Processo após solicitação */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                O que acontece após a solicitação?
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#46CCC6] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      1. Confirmação (até 48 horas)
                    </h3>
                    <p className="text-white/70">
                      Você receberá um e-mail confirmando o recebimento da sua solicitação de exclusão.
                      Podemos solicitar informações adicionais para verificar sua identidade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Trash2 className="h-6 w-6 text-[#46CCC6] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      2. Processamento (até 30 dias)
                    </h3>
                    <p className="text-white/70">
                      Seus dados serão removidos permanentemente de nossos sistemas, incluindo backups.
                      Tokens de acesso a plataformas integradas (Meta, WhatsApp) serão revogados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-[#46CCC6] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      3. Confirmação Final
                    </h3>
                    <p className="text-white/70">
                      Você receberá um e-mail final confirmando que todos os seus dados foram excluídos
                      com sucesso. Este será o último contato da plataforma com você.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Alternativas */}
            <section className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Considerando outras opções?
              </h2>
              <p className="text-white/70 mb-4">
                Se você está preocupado com privacidade mas não quer excluir sua conta completamente,
                considere estas alternativas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Desconectar integrações:</strong> Remova apenas as conexões com Meta Ads ou WhatsApp</li>
                <li><strong className="text-white">Cancelar assinatura:</strong> Pause sua assinatura mantendo seus dados para uso futuro</li>
                <li><strong className="text-white">Limpar histórico:</strong> Exclua apenas o histórico de conversas com a IA</li>
                <li><strong className="text-white">Atualizar preferências:</strong> Ajuste suas configurações de privacidade</li>
              </ul>
            </section>

            {/* Contato */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Precisa de Ajuda?
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Se você tiver dúvidas sobre o processo de exclusão de dados ou seus direitos de privacidade,
                entre em contato com nosso Encarregado de Proteção de Dados (DPO):
              </p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-5 w-5 text-[#46CCC6]" />
                  <p className="text-white/70 mb-0">
                    <strong className="text-white">E-mail do DPO:</strong> dpo@chatdata.com.br
                  </p>
                </div>
                <p className="text-white/70 text-sm mb-2">
                  <strong className="text-white">E-mail geral:</strong> contato@chatdata.com.br
                </p>
                <p className="text-white/70 text-sm">
                  <strong className="text-white">Tempo de resposta:</strong> Até 15 dias úteis
                </p>
              </div>
            </section>

            {/* Links relacionados */}
            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Documentos Relacionados
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/privacidade"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-[#46CCC6] transition-colors text-sm"
                >
                  Política de Privacidade
                </a>
                <a
                  href="/termos"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-[#46CCC6] transition-colors text-sm"
                >
                  Termos de Serviço
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DataDeletion;
