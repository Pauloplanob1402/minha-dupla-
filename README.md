# DUOS — app

Next.js + Tailwind no front, Supabase (Postgres + Auth + Realtime) no back.
O mural ao vivo, o "Topar Dupla" e os Vibe Points já funcionam de verdade — não são mais simulados com `setTimeout`.

## 1. Criar o projeto no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New Project**.
2. Anote a senha do banco (você não vai precisar dela aqui, mas guarde num lugar seguro).
3. Espere o projeto provisionar (~2 min).
4. Vá em **Authentication > Providers** e confirme que **Anonymous Sign-ins** está habilitado
   (ele já vem ligado por padrão na maioria dos projetos novos; se não estiver, ative).
5. Vá em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
   Isso cria as tabelas (`profiles`, `intentions`, `rooms`, `points_transactions`), as
   políticas de segurança (RLS) e habilita o Realtime na tabela `intentions`.
6. Vá em **Settings > API** e copie:
   - **Project URL**
   - **anon public key**

## 2. Configurar o projeto localmente

```bash
# instale as dependências
npm install

# copie o arquivo de exemplo e cole as chaves do passo anterior
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Rode localmente:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O site já deve carregar o mural
(vazio no início — poste um pedido pelo formulário pra testar) e o "Topar Dupla" já
grava de verdade no banco.

## 3. Testar o fluxo completo

1. Abra o site em duas abas do navegador (simula dois usuários diferentes, cada um
   com sua própria sessão anônima).
2. Na aba 1, poste um pedido no formulário do mural.
3. Na aba 2, o pedido deve aparecer sozinho, em tempo real (é o Supabase Realtime
   funcionando) — sem precisar dar refresh.
4. Clique em "Topar Dupla" na aba 2. O status muda pra "Sala aberta ✅", os dois
   usuários ganham 20 Vibe Points (confira na tabela `points_transactions` no
   Supabase), e uma linha nova aparece em `rooms`.

## 5. Habilitar o login por e-mail (magic link)

O código já está pronto (formulário "Salvar meus pontos" logo abaixo do Hero),
mas falta uma configuração no painel do Supabase pra ela funcionar:

1. Vá em **Authentication > URL Configuration**.
2. Em **Site URL**, coloque a URL de produção: `https://minhadupla.com.br`
   (ou a URL da Vercel, se ainda não apontou o domínio).
3. Em **Redirect URLs**, adicione (uma por linha):
   - `https://minhadupla.com.br/auth/callback`
   - `http://localhost:3000/auth/callback` (pra testar local)
   - a URL de preview da Vercel, se for testar em deploys de preview
     (ex: `https://duos-app-*.vercel.app/auth/callback`)
4. Confirme em **Authentication > Providers** que o provider **Email** está
   habilitado (vem ligado por padrão).

Como funciona na prática: a pessoa já entra anônima (como já estava
funcionando). Se ela digitar o e-mail no campo "Salvar meus pontos", o
Supabase manda um link mágico; ao clicar, a sessão anônima vira permanente
com o **mesmo user_id** — ou seja, os Vibe Points e o histórico continuam
lá, só que agora atrelados a um e-mail de verdade.

## 6. Deploy na Vercel

1. Suba este projeto pra um repositório no GitHub (`git init`, `git add .`,
   `git commit`, crie o repo no GitHub e faça o push).
2. Entre em [vercel.com](https://vercel.com), clique em **Add New > Project** e
   importe o repositório.
3. Na tela de configuração, adicione as variáveis de ambiente
   (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — as mesmas do
   seu `.env.local`.
4. Clique em **Deploy**.
5. Depois, em **Settings > Domains**, adicione `minhadupla.com.br` e siga as
   instruções da Vercel pra apontar o DNS (ela te dá os registros exatos pra
   configurar no registro.br).

## 7. O que ainda falta pra virar produto de verdade

Isso aqui é a fundação técnica — o schema, o mural e o login por e-mail já
funcionam com dados reais. Ainda faltam, na ordem que eu recomendaria:

- **Sala de áudio de verdade**: integrar Daily.co ou Agora.io na tabela `rooms`
  pra abrir uma chamada real quando alguém topa a dupla (hoje só cria o registro
  no banco, sem áudio/chat de fato).
- **Chat de texto dentro da sala**: uma tabela `messages` ligada a `rooms`, com
  Realtime igual ao mural.
- **Login por celular/SMS**: precisa de um provedor externo pago (Twilio,
  MessageBird) configurado em Authentication > Providers > Phone.
- **Expiração automática do mural**: um job (Supabase Edge Function agendada,
  ou `pg_cron`) que marca intenções com mais de X minutos como `expired`.
- **Resgate de recompensas**: por enquanto, gerencie manualmente olhando a
  tabela `profiles.vibe_points` e enviando os vouchers na mão.
