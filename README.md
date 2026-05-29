# Desafio To-Do List

Aplicação web completa para gerenciamento de tarefas, com suporte a compartilhamento entre amigos, permissões granulares, internacionalização (i18n) e notificações assíncronas.

## 🏗 Arquitetura do Projeto

O projeto foi construído utilizando um ecossistema moderno e escalável, dividido nas seguintes tecnologias:

### Frontend
- **Framework:** React com Vite (rápido e otimizado).
- **Gerenciamento de Estado/Cache:** React Query (TanStack Query) para sincronização eficiente com o backend.
- **Roteamento:** React Router DOM.
- **Estilização:** Bootstrap.
- **Internacionalização (i18n):** Suporte nativo a múltiplos idiomas (ex: Português e Inglês) usando `i18next`.
- **Testes:** Jest e Selenium WebDriver para testes E2E.

### Backend
- **Framework Web:** Django e Django REST Framework (DRF) para uma API robusta e desacoplada.
- **Banco de Dados:** PostgreSQL para persistência relacional.
- **Cache e Mensageria:** Redis.
- **Processamento Assíncrono:** Celery para processamento de tarefas em background.
- **Autenticação:** JWT (JSON Web Tokens) stateless via cabeçalho HTTP Authorization.

## 🧠 Principais Decisões de Design

Com base nas especificações do projeto (`backend/specs`), o sistema foi desenhado considerando os seguintes pilares:

1. **Isolamento e Segurança:**
   - O usuário tem um ambiente estritamente isolado. Apenas é possível visualizar e interagir com tarefas próprias ou aquelas que foram explicitamente compartilhadas.
   - Autenticação JWT stateless garante segurança na comunicação entre frontend e backend sem persistência de estado na API.

2. **Compartilhamento Colaborativo:**
   - **Sistema de Amizades:** Para compartilhar tarefas, os usuários precisam estar conectados. Desfazer uma amizade automaticamente remove o acesso a tarefas compartilhadas.
   - **Permissões Granulares:** Ao compartilhar, é possível definir níveis de acesso: Leitor (Viewer), Comentador (Commenter) e Editor. Somente o criador da tarefa pode excluí-la.

3. **Performance e Cache:**
   - Consultas frequentes são cacheadas utilizando **Redis**.
   - A invalidação do cache é *ativa e imediata*, garantindo que qualquer alteração no banco de dados (criação, edição ou deleção) reflita imediatamente aos usuários.

4. **Notificações Baseadas em Eventos (Webhooks):**
   - O projeto simula uma API externa de lembretes que roda como um microsserviço autônomo.
   - Sempre que um evento importante acontece (convite de amizade, tarefa finalizada, etc.), o **Celery** despacha Webhooks HTTP de forma assíncrona, evitando bloquear o fluxo de requisições principal.

5. **Categorização Universal:**
   - Categorias (tags) são globais e case-insensitive, evitando duplicação e mantendo a base limpa.

## 🚀 Como Rodar o Projeto

Para executar a aplicação localmente, certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Subindo os containers
Na raiz do projeto, execute o comando abaixo para realizar o build e levantar todos os serviços (PostgreSQL, Redis, API Django, Celery Worker e Frontend):

```bash
docker compose up --build -d
```

### 2. Rodando as Migrações do Banco de Dados
Com os containers rodando, crie as tabelas no PostgreSQL executando as migrações:

```bash
docker compose exec web python manage.py migrate
```

### 3. Acessando a Aplicação
- **Frontend:** Abra seu navegador em `http://localhost:5173`.
- **Documentação da API (Swagger):** Acesse `http://localhost:8000/api/docs/`.

### 4. Visualizando Logs (Celery e Notificações)
Para ver os disparos de webhooks e logs do Celery worker:
```bash
docker compose logs -f celery_worker
```

## 🧪 Como Rodar os Testes

Os testes automatizados podem ser executados com os seguintes comandos:

**Testes de Integração/Unitários (Backend):**
```bash
docker compose exec web pytest
```
*(ou se configurado no compose: `docker compose run --rm tests pytest`)*

**Testes E2E (Frontend):**
Para testar os fluxos principais da interface gráfica usando o arquivo dev:
```bash
docker compose -f docker-compose.dev.yml exec frontend npm run test:e2e
```
