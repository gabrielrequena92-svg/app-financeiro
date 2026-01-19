# Tutorial de Deploy para Iniciantes: Do Zero ao Ar 🚀

Olá! Serei seu professor nesta jornada. Vamos colocar seu **App Financeiro** na internet de forma **100% gratuita**.

Não se preocupe com termos técnicos complicados. Vamos dividir isso em 4 "Aulas" práticas. Siga a ordem exata, pois uma etapa depende da anterior.

---

## 🎒 Material Necessário (Pré-requisitos)
Antes de começar, certifique-se de ter criado conta nestes sites (são todos gratuitos):
1.  **[GitHub](https://github.com)** (Onde guardamos o código).
2.  **[Supabase](https://supabase.com)** (Nosso Banco de Dados).
3.  **[Render](https://render.com)** (Onde rodará o Backend/API).
4.  **[Vercel](https://vercel.com)** (Onde ficará o site que você vê).

---

## 📘 Aula 1: O Código no GitHub
Para que o Render e a Vercel acessem seu código, ele precisa estar "na nuvem".

1.  **Crie um Repositório:** No site do GitHub, clique no `+` lá no topo e depois em `New repository`. Dê o nome de `app-financeiro`. Deixe como **Public** ou **Private**.
2.  **Envie seu Código:**
    *   No seu computador (VS Code), abra o terminal.
    *   Se você ainda não tem git configurado, digite estes comandos um por um:
        ```bash
        git init
        git add .
        git commit -m "Meu primeiro deploy"
        git branch -M main
        git remote add origin https://github.com/SEU_USUARIO/app-financeiro.git
        git push -u origin main
        ```
    *   *(Troque `SEU_USUARIO` pelo seu nome de usuário no GitHub)*.

✅ **Objetivo:** Você deve conseguir ver seus arquivos no site do GitHub.

---

## 📕 Aula 2: O Coração (Banco de Dados no Supabase)
Vamos criar o "caderno" onde o sistema anota os usuários e finanças.

1.  **Novo Projeto:** No Supabase, clique em `New Project`.
2.  **Configuração:**
    *   **Name:** `FinanceiroDB`
    *   **Database Password:** Crie uma senha forte (e **ANOTE ELA AGORA** num bloco de notas, você precisará dela já já).
    *   **Region:** Escolha `Sao Paulo` (para ser mais rápido) ou `US East` (se SP não estiver disponível no grátis).
3.  **Pegando a Conexão:**
    *   Quando o projeto criar, vá em **Project Settings** (ícone de engrenagem) -> **Database**.
    *   Procure por **Connection String**.
    *   Mude para a aba **URI** (não use JDBC/Nodejs).
    *   Copie o texto que começa com `postgresql://...`.
    *   Cole no seu bloco de notas e **substitua** onde diz `[YOUR-PASSWORD]` pela senha que você criou.

✅ **Objetivo:** Ter a "Connection String" pronta no bloco de notas.

---

## 📙 Aula 3: O Cérebro (Backend no Render)
Agora vamos ligar a inteligência do sistema.

1.  No site do **Render**, clique em `New +` e escolha `Web Service`.
2.  **Conecte o GitHub:** Selecione o repositório `app-financeiro` que você criou.
3.  **Configuração Fina (Muita atenção aqui):**
    *   **Name:** `api-financeiro`
    *   **Region:** A mesma do banco (ex: Ohio/US East).
    *   **Root Directory:** `backend` (⚠️ **Crucial:** Escreva `backend` aqui, senão falha).
    *   **Runtime:** `Node`.
    *   **Build Command:** `npm ci && npx prisma migrate deploy && npm run build`
        *   *(Isso diz: "Instale as ferramentas", "Crie as tabelas no banco" e "Prepare o código").*
    *   **Start Command:** `npm run start:prod`
4.  **Variáveis de Ambiente (Environment Variables):**
    Role para baixo até achar essa sessão. Clique em `Add Environment Variable`:
    *   Chave: `DATABASE_URL` | Valor: (Cole a string do Supabase que está no seu bloco de notas).
    *   Chave: `JWT_SECRET` | Valor: (Digite qualquer senha maluca, ex: `batata123segredo`).
    *   Chave: `PORT` | Valor: `10000`.
5.  **Finalizar:** Clique em `Create Web Service`.
6.  **Espere:** Vai demorar uns minutos. Quando aparecer `Live` em verde, copiei o link lá no topo (ex: `https://api-financeiro.onrender.com`).

✅ **Objetivo:** Ter o link do seu Backend funcionando.

---

## 📗 Aula 4: A Cara (Frontend na Vercel)
Por fim, o site bonito que os usuários vão acessar.

1.  No site da **Vercel**, clique em `Add New...` -> `Project`.
2.  **Importe o Git:** Escolha o `app-financeiro`.
3.  **Configuração:**
    *   **Framework Preset:** Ele deve identificar `Next.js` sozinho.
    *   **Root Directory:** Clique em `Edit` e selecione a pasta `frontend`.
4.  **Variáveis:**
    *   Abra a aba **Environment Variables**.
    *   Chave: `NEXT_PUBLIC_API_URL`
    *   Valor: (Cole o link do Render da Aula 3 **SEM** a barra `/` no final).
5.  **Deploy:** Clique no botão `Deploy`.

🎉 **Parabéns!** Quando os confetes caírem na tela, seu sistema estará online para todo o mundo.
