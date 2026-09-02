export const metadata = {
  title: 'Política de Privacidade — DUOS',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="text-sm text-violet hover:text-white transition-colors">
          ← Voltar pro DUOS
        </a>

        <h1 className="font-display font-extrabold text-3xl text-white mt-6 mb-2">
          Política de Privacidade
        </h1>
        <p className="text-xs text-zinc-500 mb-10">Última atualização: setembro de 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <p>
              Esta Política de Privacidade descreve como o DUOS coleta, usa e protege seus dados
              pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
              13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              1. Quem é o controlador dos dados
            </h2>
            <p>
              O controlador dos dados pessoais tratados pelo DUOS é{' '}
              <span className="text-white">[razão social / nome do responsável a definir]</span>,
              contato:{' '}
              <span className="text-white">[e-mail de contato a definir]</span>.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              2. Quais dados coletamos
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Dados de conta:</strong> um identificador anônimo
                gerado automaticamente e, caso você opte por vincular, seu e-mail;
              </li>
              <li>
                <strong className="text-white">Dados de perfil:</strong> nome de exibição, cidade
                (opcional), saldo de Vibe Points;
              </li>
              <li>
                <strong className="text-white">Conteúdo gerado por você:</strong> pedidos
                publicados no mural, mensagens de texto, fotos e vídeos enviados no chat das
                salas;
              </li>
              <li>
                <strong className="text-white">Dados técnicos:</strong> registros de acesso e uso
                do app, necessários para segurança e funcionamento (coletados pela nossa
                infraestrutura de hospedagem).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              3. Base legal para o tratamento
            </h2>
            <p>
              Tratamos seus dados com base na <strong className="text-white">execução do contrato</strong>{' '}
              (viabilizar o funcionamento do app que você optou por usar), no{' '}
              <strong className="text-white">consentimento</strong> (quando você opta por vincular
              e-mail) e no <strong className="text-white">legítimo interesse</strong> em manter a
              segurança e o bom funcionamento da plataforma, nos termos do art. 7º da LGPD.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              4. Com quem compartilhamos seus dados
            </h2>
            <p className="mb-2">
              Usamos os seguintes fornecedores (operadores de dados) para viabilizar o DUOS:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Supabase</strong> — banco de dados, autenticação e
                armazenamento de arquivos;
              </li>
              <li>
                <strong className="text-white">Vercel</strong> — hospedagem do site;
              </li>
              <li>
                <strong className="text-white">Jitsi Meet (8x8, Inc.)</strong> — chamadas de
                áudio/vídeo, processadas diretamente entre você e a outra pessoa, fora da nossa
                infraestrutura;
              </li>
              <li>
                <strong className="text-white">Provedor de e-mail</strong> — envio de e-mails de
                confirmação de conta.
              </li>
            </ul>
            <p className="mt-2">
              Não vendemos seus dados pessoais a terceiros para fins de marketing.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              5. Por quanto tempo guardamos seus dados
            </h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Mensagens e mídias trocadas em
              salas encerradas permanecem armazenadas por padrão, salvo solicitação de exclusão
              (ver seção 7). Você pode solicitar a exclusão da sua conta e dos dados associados a
              qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              6. Menores de idade
            </h2>
            <p>
              O DUOS não é destinado a menores de 18 anos e não coleta intencionalmente dados de
              menores. Se identificarmos uma conta pertencente a um menor, ela será excluída
              junto com os dados associados.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              7. Seus direitos como titular de dados
            </h2>
            <p className="mb-2">Nos termos do art. 18 da LGPD, você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento e acessar seus dados;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Solicitar a portabilidade dos seus dados;</li>
              <li>Revogar o consentimento e solicitar a exclusão da sua conta;</li>
              <li>Obter informação sobre com quem compartilhamos seus dados.</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail informado na
              seção 1.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas razoáveis para proteger seus dados (controle de acesso por
              linha no banco de dados, conexões criptografadas). Nenhum sistema é 100% seguro, e
              não podemos garantir proteção absoluta contra acessos não autorizados.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              9. Cookies e armazenamento local
            </h2>
            <p>
              Usamos armazenamento local do navegador para manter sua sessão ativa (login) e
              lembrar preferências básicas. Não usamos cookies de rastreamento publicitário de
              terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">
              10. Alterações nesta política
            </h2>
            <p>
              Podemos atualizar esta Política periodicamente. Mudanças relevantes serão
              comunicadas por aviso no app, com indicação da data da última atualização no topo
              desta página.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-2">11. Contato</h2>
            <p>
              Dúvidas sobre esta Política ou sobre o tratamento dos seus dados podem ser enviadas
              para <span className="text-white">[e-mail de contato a definir]</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
