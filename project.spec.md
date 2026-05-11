# IFAL Projetos – Gestão de Projetos Acadêmicos

## 1. Visão Geral

<<<<<<< HEAD
O IFAL Projetos é uma plataforma web voltada para o gerenciamento de projetos acadêmicos, como Projetos Integradores, Trabalhos de Conclusão de Curso e projetos de pesquisa/extensão.
=======
O IFAL Projetos é um aplicativo voltado para o gerenciamento de projetos acadêmicos, como Projetos Integradores, Trabalhos de Conclusão de Curso e projetos de pesquisa/extensão.
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

O sistema tem como objetivo melhorar a organização, o acompanhamento e a documentação de projetos longos desenvolvidos por estudantes, professores orientadores e coordenadores acadêmicos.

---

## 2. Problema

Atualmente, muitos projetos acadêmicos são acompanhados de forma descentralizada, utilizando mensagens, documentos soltos, planilhas, repositórios separados e reuniões informais.

Isso gera problemas como:

- Falta de organização das etapas do projeto
- Dificuldade no acompanhamento de prazos
- Pouca visibilidade do progresso da equipe
- Perda de versões antigas de entregas
- Dificuldade para professores acompanharem vários projetos ao mesmo tempo
- Falta de padronização nos relatórios acadêmicos
- Baixa integração entre tarefas, entregas e repositórios Git

---

## 3. Proposta de Valor

<<<<<<< HEAD
O IFAL Projetos centraliza o gerenciamento de projetos acadêmicos em uma única plataforma, permitindo que equipes, orientadores e coordenadores acompanhem o progresso dos trabalhos de forma organizada, transparente e eficiente.

A plataforma oferece criação de projetos com equipes, quadro Kanban, controle de versões de entregas, integração com repositórios Git e geração automática de relatórios com apoio de IA.
=======
O IFAL Projetos centraliza o gerenciamento de projetos acadêmicos em um único aplicativo, permitindo que equipes, orientadores e coordenadores acompanhem o progresso dos trabalhos de forma organizada, transparente e eficiente.

O aplicativo oferece criação de projetos com equipes, quadro Kanban, controle de versões de entregas, integração com repositórios Git e geração automática de relatórios com apoio de IA.
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

---

## 4. Público-Alvo

### Usuários principais

- Estudantes
- Professores orientadores
- Coordenadores de curso
- Avaliadores de bancas

### Instituição

- IFAL
- Cursos técnicos, superiores e pós-graduação
- Coordenações acadêmicas
- Núcleos de pesquisa e extensão

---

## 5. Objetivos do Sistema

### Objetivo geral

<<<<<<< HEAD
Criar uma plataforma para organizar, acompanhar e documentar projetos acadêmicos de longa duração.
=======
Criar um aplicativo para organizar, acompanhar e documentar projetos acadêmicos de longa duração.
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

### Objetivos específicos

- Permitir a criação e gerenciamento de projetos acadêmicos
- Organizar equipes de estudantes e orientadores
- Acompanhar tarefas por meio de Kanban
- Controlar prazos e entregas
- Registrar versões de documentos e arquivos
- Integrar links de repositórios Git
- Gerar relatórios automáticos com IA
- Facilitar o acompanhamento por professores e coordenadores

---

## 6. Funcionalidades Principais

## 6.1 Cadastro e Autenticação de Usuários

### Descrição

<<<<<<< HEAD
O sistema deve permitir que usuários acessem a plataforma por meio de login seguro.
=======
O sistema deve permitir que usuários acessem o aplicativo por meio de login seguro.
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

### Requisitos

- Cadastro de usuário
- Login com e-mail e senha
- Recuperação de senha
- Perfis de acesso:
  - Estudante
  - Professor orientador
  - Coordenador
  - Avaliador
  - Administrador

### Critérios de aceite

- O usuário deve conseguir criar uma conta
- O usuário deve conseguir acessar o sistema com credenciais válidas
- O sistema deve impedir acesso com credenciais inválidas
- Cada perfil deve ter permissões específicas

---

## 6.2 Criação de Projetos

### Descrição

O sistema deve permitir a criação de projetos acadêmicos com informações básicas e membros associados.

### Campos do projeto

- Título do projeto
- Descrição
- Tipo de projeto:
  - Projeto Integrador
  - TCC
  - Pesquisa
  - Extensão
  - Outro
- Curso
- Período/Semestre
- Data de início
- Data prevista de conclusão
- Status:
  - Planejado
  - Em andamento
  - Em revisão
  - Concluído
  - Cancelado
- Professor orientador
- Equipe de estudantes
- Links externos

### Critérios de aceite

- Um estudante ou professor deve poder criar um projeto
- O projeto deve permitir a inclusão de múltiplos membros
- O orientador deve conseguir visualizar os projetos vinculados a ele
- O coordenador deve conseguir visualizar projetos do curso

---

## 6.3 Gestão de Equipes

### Descrição

O sistema deve permitir a formação e manutenção das equipes dos projetos.

### Funcionalidades

- Adicionar estudantes ao projeto
- Remover membros da equipe
- Definir papéis dos membros
- Associar professor orientador
- Associar avaliadores, quando necessário

### Papéis possíveis

- Líder do projeto
- Desenvolvedor
- Pesquisador
- Documentador
- Designer
- Orientador
- Avaliador

### Critérios de aceite

- Um projeto deve ter pelo menos um responsável
- Apenas usuários autorizados devem poder alterar a equipe
- O orientador deve visualizar todos os membros do projeto

---

## 6.4 Kanban de Tarefas

### Descrição

O sistema deve possuir um quadro Kanban para acompanhar as atividades do projeto.

### Colunas padrão

- A fazer
- Em andamento
- Em revisão
- Concluído

### Campos da tarefa

- Título
- Descrição
- Responsável
- Prioridade:
  - Baixa
  - Média
  - Alta
  - Crítica
- Data de criação
- Prazo
- Status
- Comentários
- Anexos
- Projeto vinculado

### Funcionalidades

- Criar tarefa
- Editar tarefa
- Excluir tarefa
- Mover tarefa entre colunas
- Atribuir tarefa a membro da equipe
- Definir prazo
- Adicionar comentários
- Anexar arquivos

### Critérios de aceite

- Os membros da equipe devem conseguir visualizar o Kanban do projeto
- O sistema deve permitir mover tarefas entre colunas
- O orientador deve conseguir acompanhar o progresso das tarefas
- Tarefas atrasadas devem ser destacadas

---

## 6.5 Controle de Versões de Entregas

### Descrição

O sistema deve permitir o envio e controle de versões das entregas acadêmicas.

### Tipos de entrega

- Documento parcial
- Documento final
- Apresentação
- Código-fonte
- Relatório
- Protótipo
- Outro arquivo

### Campos da entrega

- Título
- Descrição
- Arquivo enviado
- Versão
- Data de envio
- Responsável pelo envio
- Comentários do orientador
- Status da entrega:
  - Enviada
  - Em análise
  - Aprovada
  - Reprovada
  - Solicitação de ajustes

### Funcionalidades

- Enviar nova entrega
- Registrar nova versão de uma entrega
- Visualizar histórico de versões
- Baixar arquivos enviados
- Comentar entrega
- Aprovar ou solicitar ajustes

### Critérios de aceite

- O sistema deve manter o histórico de versões
- Uma nova versão não deve apagar versões anteriores
- O orientador deve poder comentar e avaliar entregas
- Os estudantes devem visualizar feedbacks recebidos

---

## 6.6 Integração com Git

### Descrição

O sistema deve permitir vincular repositórios Git aos projetos acadêmicos.

### Funcionalidades

- Adicionar link de repositório GitHub, GitLab ou Bitbucket
- Exibir link do repositório no projeto
- Registrar múltiplos repositórios por projeto
- Validar formato básico da URL
- Permitir descrição do repositório

### Campos do repositório

- Nome
- URL
- Plataforma:
  - GitHub
  - GitLab
  - Bitbucket
  - Outro
- Descrição
- Data de cadastro

### Critérios de aceite

- O usuário deve conseguir adicionar um link de repositório válido
- O sistema deve impedir URLs inválidas
- O orientador deve conseguir acessar os repositórios vinculados
- O projeto deve permitir mais de um repositório

---

## 6.7 Geração Automática de Relatórios com IA

### Descrição

O sistema deve utilizar IA para gerar relatórios automáticos com base nas informações do projeto.

### Fontes de dados usadas pela IA

- Descrição do projeto
- Tarefas do Kanban
- Entregas realizadas
- Comentários do orientador
- Histórico de versões
- Status do projeto
- Prazos cumpridos e atrasados
- Links de repositórios

### Tipos de relatório

- Relatório parcial
- Relatório final
- Relatório de progresso
- Relatório para orientação
- Resumo executivo do projeto

### Funcionalidades

- Gerar relatório automaticamente
- Permitir edição manual do relatório
- Exportar relatório em PDF
- Exportar relatório em DOCX
- Salvar histórico de relatórios gerados

### Critérios de aceite

- O sistema deve gerar um relatório com base nos dados reais do projeto
- O usuário deve poder revisar e editar o relatório antes de exportar
- O relatório deve conter informações claras sobre progresso, entregas e pendências
- O sistema deve informar que o relatório foi gerado com auxílio de IA

---

## 6.8 Dashboard

### Descrição

O sistema deve possuir um painel de acompanhamento geral dos projetos.

### Informações exibidas

- Total de projetos
- Projetos em andamento
- Projetos concluídos
- Projetos atrasados
- Tarefas pendentes
- Tarefas concluídas
- Entregas aguardando revisão
- Próximos prazos
- Projetos por orientador
- Projetos por curso

### Critérios de aceite

- O estudante deve visualizar seus próprios projetos
- O professor deve visualizar projetos orientados por ele
- O coordenador deve visualizar projetos do curso
- O administrador deve visualizar todos os projetos

---

## 6.9 Comentários e Comunicação

### Descrição

O sistema deve permitir comentários em tarefas, entregas e projetos.

### Funcionalidades

- Comentar em tarefas
- Comentar em entregas
- Marcar membros da equipe
- Registrar data e autor do comentário
- Visualizar histórico de comentários

### Critérios de aceite

- Comentários devem ficar associados ao item correto
- O autor e a data do comentário devem ser exibidos
- Usuários autorizados devem conseguir responder comentários

---

## 6.10 Notificações

### Descrição

O sistema deve enviar notificações sobre eventos importantes do projeto.

### Tipos de notificação

- Nova tarefa atribuída
- Tarefa próxima do prazo
- Tarefa atrasada
- Nova entrega enviada
- Entrega comentada pelo orientador
- Solicitação de ajustes
- Projeto concluído
- Relatório gerado

### Canais

- Notificação interna no sistema
- E-mail, se habilitado

### Critérios de aceite

- O usuário deve receber notificações relevantes ao seu perfil
- O sistema deve notificar sobre prazos próximos
- O usuário deve visualizar notificações lidas e não lidas

---

## 7. Requisitos Não Funcionais

## 7.1 Segurança

- As senhas devem ser armazenadas com hash seguro
- O sistema deve usar autenticação por token ou sessão segura
- As permissões devem ser controladas por perfil
- Usuários não autorizados não devem acessar projetos privados
- Arquivos enviados devem ser validados

## 7.2 Usabilidade

<<<<<<< HEAD
- Interface simples e responsiva
- Compatível com desktop, tablet e celular
=======
- Interface simples, responsiva e otimizada para uso móvel
- Compatível com smartphones e tablets, com possibilidade de execução web quando suportada pela tecnologia escolhida
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5
- Navegação clara entre projetos, tarefas e entregas
- Dashboard visual e fácil de entender

## 7.3 Desempenho

<<<<<<< HEAD
- O sistema deve carregar páginas principais em até 3 segundos em condições normais
=======
- O sistema deve carregar telas principais em até 3 segundos em condições normais
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5
- O Kanban deve atualizar alterações de forma rápida
- Consultas ao banco devem ser otimizadas

## 7.4 Escalabilidade

- O sistema deve permitir crescimento no número de usuários, projetos e arquivos
- A arquitetura deve permitir expansão futura para outros campi ou instituições

## 7.5 Disponibilidade

<<<<<<< HEAD
- O sistema deve estar disponível para acesso web
=======
- O sistema deve estar disponível como aplicativo para dispositivos móveis
- Quando houver versão web complementar, ela deve manter os mesmos dados e permissões da versão móvel
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5
- Deve possuir rotina de backup dos dados
- Deve registrar logs de erros e operações importantes

---

## 8. Perfis e Permissões

| Perfil | Permissões principais |
|---|---|
| Estudante | Criar/participar de projetos, gerenciar tarefas, enviar entregas, gerar relatórios |
| Líder do projeto | Gerenciar membros, organizar tarefas, enviar versões e acompanhar progresso |
| Professor orientador | Acompanhar projetos, comentar entregas, aprovar versões, solicitar ajustes |
| Coordenador | Visualizar projetos do curso, acompanhar indicadores e relatórios |
| Avaliador | Visualizar projeto, entregas e relatórios autorizados |
| Administrador | Gerenciar usuários, cursos, permissões e configurações gerais |

---

## 9. Entidades Principais do Sistema

## 9.1 Usuário

Atributos:

- id
- nome
- e-mail
- senha_hash
- perfil
- curso
- matrícula ou SIAPE
- data_criacao
- status

## 9.2 Projeto

Atributos:

- id
- titulo
- descricao
- tipo
- curso
- semestre
- data_inicio
- data_fim_prevista
- status
- orientador_id
- criado_por
- data_criacao

## 9.3 MembroProjeto

Atributos:

- id
- projeto_id
- usuario_id
- papel
- data_entrada

## 9.4 Tarefa

Atributos:

- id
- projeto_id
- titulo
- descricao
- responsavel_id
- prioridade
- status
- prazo
- data_criacao
- data_conclusao

## 9.5 Entrega

Atributos:

- id
- projeto_id
- titulo
- descricao
- arquivo_url
- versao
- status
- enviado_por
- data_envio

## 9.6 RepositorioGit

Atributos:

- id
- projeto_id
- nome
- url
- plataforma
- descricao
- data_cadastro

## 9.7 RelatorioIA

Atributos:

- id
- projeto_id
- tipo
- conteudo
- gerado_por
- data_geracao
- editado_manualmente

## 9.8 Comentario

Atributos:

- id
- usuario_id
- entidade_tipo
- entidade_id
- conteudo
- data_criacao

---

## 10. Fluxos Principais

## 10.1 Fluxo de Criação de Projeto

<<<<<<< HEAD
1. Usuário acessa a plataforma
=======
1. Usuário acessa o aplicativo
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5
2. Usuário cria um novo projeto
3. Informa título, descrição, tipo, curso e prazo
4. Adiciona membros da equipe
5. Define professor orientador
6. Sistema salva o projeto
7. Projeto aparece no dashboard dos membros e do orientador

---

## 10.2 Fluxo de Gerenciamento de Tarefas

1. Usuário acessa um projeto
2. Abre o quadro Kanban
3. Cria uma nova tarefa
4. Define responsável e prazo
5. Move tarefa conforme andamento
6. Sistema atualiza o status do projeto
7. Orientador acompanha o progresso

---

## 10.3 Fluxo de Entrega com Versões

1. Estudante acessa a área de entregas
2. Envia um arquivo
3. Sistema registra a versão
4. Orientador analisa a entrega
5. Orientador comenta, aprova ou solicita ajustes
6. Estudante envia nova versão, se necessário
7. Sistema mantém histórico completo

---

## 10.4 Fluxo de Geração de Relatório com IA

1. Usuário acessa o projeto
2. Seleciona a opção “Gerar relatório”
3. Escolhe o tipo de relatório
4. Sistema coleta dados do projeto
5. IA gera o texto do relatório
6. Usuário revisa e edita
7. Sistema salva o relatório
8. Usuário exporta em PDF ou DOCX

---

## 11. Regras de Negócio

- Um projeto deve possuir pelo menos um estudante responsável
- Um projeto pode ter mais de um estudante
- Um projeto pode ter apenas um orientador principal
- Uma tarefa deve pertencer a um projeto
- Uma entrega deve pertencer a um projeto
- Uma nova versão de entrega não deve excluir versões anteriores
- Apenas membros do projeto podem editar tarefas internas
- Apenas orientadores podem aprovar ou reprovar entregas
- Coordenadores podem visualizar projetos vinculados ao curso
- Relatórios gerados por IA devem ser revisáveis antes da exportação
- O sistema deve registrar o histórico das principais ações

---

## 12. Critérios Gerais de Aceite

- O sistema permite criar projetos acadêmicos com equipe e orientador
- O sistema possui Kanban funcional para tarefas
- O sistema permite envio e controle de versões de entregas
- O sistema permite vincular repositórios Git ao projeto
- O sistema gera relatórios automáticos com apoio de IA
- O sistema possui dashboard com indicadores principais
- O sistema respeita permissões por perfil de usuário
<<<<<<< HEAD
- O sistema é responsivo e acessível por navegador web
=======
- O sistema é responsivo e acessível em dispositivos móveis
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

---

## 13. MVP

A primeira versão do sistema deve conter:

- Login e cadastro de usuários
- Criação de projetos
- Cadastro de equipe
- Kanban básico
- Envio de entregas com histórico de versões
- Cadastro de links de repositórios Git
- Dashboard simples
- Geração básica de relatório com IA

---

## 14. Funcionalidades Futuras

- Integração direta com GitHub API
- Análise automática de commits
- Calendário acadêmico integrado
- Chat interno por projeto
- Rubricas de avaliação
- Assinatura digital de entregas
- Exportação automática para modelo institucional
- Integração com SUAP
- Relatórios comparativos por curso
- Métricas de produtividade da equipe

---

## 15. Tecnologias Sugeridas

<<<<<<< HEAD
### Front-end

- React
- Next.js
- Tailwind CSS
=======
### Aplicativo

- React Native
- Expo
- TypeScript
- React Navigation

### Web complementar (opcional)

- React ou Next.js
- Tailwind CSS ou biblioteca de componentes compatível com a identidade visual
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

### Back-end

- Node.js
- NestJS ou Express

### Banco de Dados

- PostgreSQL

### Autenticação

- JWT
- Controle de acesso por perfil

### Armazenamento de Arquivos

- AWS S3
- Supabase Storage
- MinIO
- Google Cloud Storage

### IA

- API de modelo de linguagem para geração de relatórios
- Prompt estruturado com dados do projeto
- Revisão humana obrigatória antes da exportação

### Integração Git

- Cadastro inicial por URL
- Futuramente integração via GitHub/GitLab API

---

## 16. Possível Estrutura de Rotas

### Autenticação

- POST /auth/register
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password

### Usuários

- GET /users
- GET /users/:id
- PATCH /users/:id
- DELETE /users/:id

### Projetos

- GET /projects
- POST /projects
- GET /projects/:id
- PATCH /projects/:id
- DELETE /projects/:id

### Membros

- POST /projects/:id/members
- GET /projects/:id/members
- DELETE /projects/:id/members/:memberId

### Tarefas

- GET /projects/:id/tasks
- POST /projects/:id/tasks
- PATCH /tasks/:id
- DELETE /tasks/:id

### Entregas

- GET /projects/:id/deliveries
- POST /projects/:id/deliveries
- GET /deliveries/:id/versions
- PATCH /deliveries/:id/review

### Repositórios

- GET /projects/:id/repositories
- POST /projects/:id/repositories
- DELETE /repositories/:id

### Relatórios

- POST /projects/:id/reports/generate
- GET /projects/:id/reports
- GET /reports/:id
- PATCH /reports/:id
- POST /reports/:id/export

---

## 17. Prioridades de Desenvolvimento

### Alta prioridade

- Autenticação
- Criação de projetos
- Gestão de equipe
- Kanban
- Entregas com versionamento
- Permissões por perfil

### Média prioridade

- Dashboard
- Comentários
- Notificações
- Integração Git por URL
- Exportação de relatórios

### Baixa prioridade

- Integração direta com APIs Git
- Análise automática de commits
- Chat interno
- Integração com SUAP

---

## 18. Riscos do Projeto

| Risco | Impacto | Mitigação |
|---|---|---|
| Baixa adesão dos usuários | Alto | Interface simples e treinamento inicial |
| Complexidade da IA | Médio | Começar com geração simples de relatórios |
| Problemas com armazenamento de arquivos | Alto | Usar serviço confiável de storage |
| Falta de padronização dos projetos | Médio | Criar modelos de projeto e relatório |
| Permissões mal configuradas | Alto | Implementar controle de acesso desde o início |
| Dependência de APIs externas | Médio | Começar com links Git antes de integração direta |

---

## 19. Indicadores de Sucesso

- Número de projetos cadastrados
- Número de usuários ativos
- Percentual de tarefas concluídas no prazo
- Quantidade de entregas versionadas
- Quantidade de relatórios gerados
- Redução de atrasos em entregas
- Satisfação de estudantes e orientadores
- Uso recorrente por professores e coordenadores

---

## 20. Resumo Executivo

<<<<<<< HEAD
O IFAL Projetos é uma plataforma acadêmica para organizar e acompanhar projetos integradores, TCCs e outros trabalhos de longa duração.
=======
O IFAL Projetos é um aplicativo acadêmico para organizar e acompanhar projetos integradores, TCCs e outros trabalhos de longa duração.
>>>>>>> 5fbd74ee84e62ff7ab729887ca02677ca573e0c5

A solução centraliza equipe, tarefas, entregas, versões, repositórios Git e relatórios em um único ambiente. Com o apoio de IA, o sistema facilita a geração de relatórios e melhora a comunicação entre estudantes, orientadores e coordenações.

O MVP deve priorizar a criação de projetos, Kanban, controle de entregas, integração Git por link e geração básica de relatórios.
