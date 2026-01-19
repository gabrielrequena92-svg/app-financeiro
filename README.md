# Sistema Financeiro Pessoal e Compartilhado

## 🎯 Objetivo
Um sistema financeiro focado em clareza, permitindo controle de movimentações, contas, patrimônio e investimentos em contextos pessoais e compartilhados.

## 🧱 Princípio Fundamental
**Nenhuma informação financeira existe fora de um contexto.**
- Todo dado pertence a um contexto.
- Isolamento total entre contextos.
- Acesso definido por RBAC (Role-Based Access Control) dentro do contexto.

## 👤 Usuários e Contextos
- **Contextos**: Pessoais, Compartilhados (família, projetos, viagens).
- **Papéis**:
  - `Administrador`: Controle total.
  - `Colaborador`: Registra dados.
  - `Visualizador`: Apenas leitura.

## 🏦 Entidades Principais
- **User**: O usuário do sistema.
- **Context**: O ambiente onde as finanças ocorrem.
- **ContextUser**: Vínculo usuário-contexto com papéis.
- **Account**: Caixa, Crédito, Investimento, Patrimonial (sempre dentro de um contexto).
- **Transaction**: A fonte da verdade (Entrada, Consumo, Transferência, etc.).
- **Commitment**: Contas futuras, parcelas.
- **Asset/Investment**: Ativos financeiros.

## 🛠 Tech Stack
- **Backend**: NestJS, Prisma ORM, PostgreSQL.
- **Frontend**: Next.js, Vanilla CSS, PWA.
- **Infra**: Docker.

## 📅 Roadmap (Resumo)
- [x] **Sprint 1: Auth + Contextos** (Concluído)
- [x] **Sprint 2: Contas** (Concluído)
- [x] **Sprint 3: Movimentações** (Concluído)
- [x] **Sprint 4: Compromissos Futuros** (Concluído)
- [x] **Sprint 5: Relatórios e Análises** (Concluído)
- [x] **Sprint 6: Investimentos e Patrimônio** (Concluído)
- [x] **Sprint 7: Metas e Orçamentos** (Concluído)
  - [x] Definição de metas de gastos por categoria
  - [x] Barra de progresso de orçamento
- [x] **Sprint 8: Compartilhamento e Permissões** (Concluído)
  - [x] Convite de membros por email
  - [x] Gerenciamento de membros
- [x] **Sprint 10: Segurança e Refinamentos** (Concluído)
  - [x] RBAC (Permissões de Admin no Backend)
  - [x] Layout com Sidebar Lateral
  - [x] Refinamento de cores e contraste (Modo Claro Premium)
- [x] **MVP CONCLUÍDO** 🚀

## 🚀 Evolução Pós-MVP (Refinamentos de UI/UX)
Foco total na experiência do usuário, paridade entre plataformas e usabilidade.

### 📱 Mobile Experience (App-like)
- **Minhas Contas**: Carrossel horizontal de contas com acesso rápido para edição ("Toque para editar").
- **Inputs Otimizados**: Teclado numérico automático para valores e prefixo "R$" em todos os formulários.
- **Sincronização**: Botão "Sync" (🔄) para atualização manual de dados sem recarregar a página.
- **Filtros**: Navegação mensal intuitiva na seção de pagamentos pendentes.

### 💻 Desktop Experience (Pro)
- **Paridade de Funcionalidades**:
  - Ações Rápidas (Despesa, Receita, Transferir) idênticas ao mobile.
  - Funcionalidade "Olhinho" (👁️) para ocultar/exibir valores sensíveis.
  - Menu lateral expandido com atalhos para Categorias e Contas.
- **Novo Layout de Dashboard**:
  - **Grid de Contas**: Visualização em 4 colunas para melhor aproveitamento de tela.
  - **Fluxo Vertical**: Seção de "Próximos Pagamentos" integrada ao corpo principal com filtro de data.
  - **Extrato Recente**: Lista detalhada de últimas movimentações.

### ⚙️ Melhorias Gerais
- **Categorias**: Separação visual clara entre categorias de Despesa e Receita.
- **Investimentos**: Modal dedicado para aportes com cálculo automático (Qtd x Preço).
- **Performance**: Otimização no carregamento de dados (useCallback/Hooks) para maior fluidez.

---

## 🎯 Próximos Passos (Sprint 11: Segurança e Produção) (Concluído) 🚀
Objetivos para preparar o sistema para uso externo:
- [x] **Autenticação Real**: Implementado hashing de senhas (bcrypt) e validação de login.
- [x] **Sessões Seguras**: Implementado tokens JWT para controle de acesso persistente.
- [x] **Preparação para Deploy**: Configurado suporte a variáveis de ambiente (.env) e ConfigModule.
- [x] **Testes Externos**: Sistema estabilizado e tipado para os primeiros usuários.
