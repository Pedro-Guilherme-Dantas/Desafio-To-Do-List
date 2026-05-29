# API Contract - To-Do List

Este documento lista todos os endpoints da API, os métodos suportados, o que é esperado no `Body` ou em `Query Params`, e o formato padrão de resposta.

---

## 🔒 Autenticação (Authentication)

### `POST /api/users/register/`
- **Descrição**: Cria uma nova conta de usuário.
- **Body**:
  ```json
  {
    "username": "joao_silva",
    "email": "joao@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "id": 1,
    "username": "joao_silva",
    "email": "joao@example.com"
  }
  ```

### `POST /api/users/login/`
- **Descrição**: Autentica e gera tokens JWT.
- **Body**:
  ```json
  {
    "username": "joao_silva",
    "password": "strongpassword123"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1...",
    "refresh": "eyJhbGciOiJIUzI1..."
  }
  ```

### `POST /api/users/token/refresh/`
- **Descrição**: Renova um token de acesso expirado usando o refresh token.
- **Body**: `{"refresh": "..."}`
- **Response** `200 OK`: `{"access": "..."}`

---

## 👤 Usuário (Profile)
*Requer Autenticação JWT (Bearer)*

### `GET /api/users/`
- **Descrição**: Retorna a lista de usuários, permitindo busca pelo nome de usuário ou e-mail.
- **Query Params**: `?search=joao`
- **Response** `200 OK`:
  ```json
  [
    {
      "id": 1,
      "username": "joao_silva",
      "email": "joao@example.com"
    }
  ]
  ```

### `GET /api/users/me/`
- **Descrição**: Retorna os dados do usuário autenticado.
- **Response** `200 OK`:
  ```json
  {
    "id": 1,
    "username": "joao_silva",
    "email": "joao@example.com"
  }
  ```

### `PATCH /api/users/me/`
- **Descrição**: Atualiza parcialmente os dados do usuário.
- **Body** *(opcional)*: `{"username": "joao2", "email": "novo@email.com", "password": "..."}`
- **Response** `200 OK`: `{"id": 1, "username": "joao2", "email": "novo@email.com"}`

### `DELETE /api/users/me/`
- **Descrição**: Deleta a própria conta.
- **Response**: `204 No Content`

---

## 🤝 Amizades (Friendships)
*Requer Autenticação JWT (Bearer)*

### `GET /api/users/friendships/`
- **Descrição**: Lista todos os amigos aceitos.
- **Response** `200 OK`:
  ```json
  [
    {
      "id": 15,
      "friend": {
        "id": 2,
        "username": "maria",
        "email": "maria@example.com"
      },
      "status": "ACCEPTED",
      "created_at": "2026-05-28T10:00:00Z"
    }
  ]
  ```

### `GET /api/users/friendships/requests/`
- **Descrição**: Lista todas as solicitações de amizade pendentes (tanto enviadas quanto recebidas).
- **Response** `200 OK`:
  ```json
  [
    {
      "id": 16,
      "friend": {
        "id": 2,
        "username": "maria",
        "email": "maria@example.com"
      },
      "status": "PENDING",
      "created_at": "2026-05-28T10:05:00Z"
    }
  ]
  ```

### `POST /api/users/friendships/`
- **Descrição**: Envia um convite de amizade.
- **Body**: `{"to_user_id": 2}`
- **Response** `201 Created`:
  ```json
  {
    "id": 16,
    "friend": {"id": 2, "username": "maria", "email": "maria@example.com"},
    "status": "PENDING",
    "created_at": "2026-05-28T10:05:00Z"
  }
  ```

### `POST /api/users/friendships/{from_user_id}/accept/`
- **Descrição**: Aceita um convite pendente.
- **Response** `200 OK`: `{"id": 16, "friend": {...}, "status": "ACCEPTED", "created_at": "..."}`

### `DELETE /api/users/friendships/{id}/`
- **Descrição**: Remove uma amizade ou rejeita um convite. O `id` na URL refere-se ao ID do outro usuário.
- **Response**: `204 No Content`

---

## 📂 Categorias (Categories)
*Requer Autenticação JWT (Bearer)*

### `GET /api/categories/`
- **Descrição**: Lista todas as categorias.
- **Response** `200 OK`:
  ```json
  [
    {
      "id": 1,
      "name": "Trabalho",
      "color": "#FF0000"
    }
  ]
  ```

### `POST /api/categories/`
- **Descrição**: Cria uma categoria global.
- **Body**: `{"name": "Trabalho", "color": "#FF0000"}`
- **Response** `201 Created`: `{"id": 1, "name": "Trabalho", "color": "#FF0000"}`

### `PATCH /api/categories/{id}/`
- **Descrição**: Atualiza uma categoria existente.
- **Body**: `{"name": "Estudos"}`
- **Response** `200 OK`: `{"id": 1, "name": "Estudos", "color": "#FF0000"}`

---

## 📝 Tarefas (Tasks)
*Requer Autenticação JWT (Bearer)*

### `GET /api/tasks/`
- **Descrição**: Lista as tarefas do usuário (com paginação e filtros opcionais).
- **Query Params**: `?category_id=1` | `?priority=HIGH` | `?is_completed=true` | `?page=1`
- **Response** `200 OK`:
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "title": "Estudar Python",
        "description": "Fazer os módulos 1 a 3",
        "priority": "HIGH",
        "is_completed": false,
        "due_date": "2026-06-01T23:59:00Z",
        "category": {
          "id": 1,
          "name": "Estudos",
          "color": "#FF0000"
        },
        "created_at": "2026-05-28T10:00:00Z",
        "updated_at": "2026-05-28T10:00:00Z"
      }
    ]
  }
  ```

### `POST /api/tasks/`
- **Descrição**: Cria uma nova tarefa.
- **Body**:
  ```json
  {
    "title": "Estudar Python",
    "description": "Fazer os módulos 1 a 3",
    "priority": "HIGH",
    "due_date": "2026-06-01T23:59:00Z",
    "category_id": 1
  }
  ```
- **Response** `201 Created`: *(Mesmo formato de item em `results` do GET)*

### `PATCH /api/tasks/{id}/`
- **Descrição**: Atualiza parcialmente a tarefa (apenas Dono ou `EDITOR`).
- **Body**: `{"is_completed": true}`
- **Response** `200 OK`: *(Item atualizado)*

### `DELETE /api/tasks/{id}/`
- **Descrição**: Deleta uma tarefa permanentemente.
- **Response**: `204 No Content`

---

## 👥 Compartilhamento & Comentários (Sharing & Comments)
*Requer Autenticação JWT (Bearer)*

### `POST /api/tasks/{task_id}/participations/`
- **Descrição**: Compartilha uma tarefa com um amigo.
- **Body**:
  ```json
  {
    "user_id": 2,
    "role": "EDITOR"
  }
  ```
  *(Roles permitidos: `VIEWER`, `EDITOR`)*
- **Response** `201 Created`:
  ```json
  {
    "id": 1,
    "user": {"id": 2, "username": "maria", "email": "maria@example.com"},
    "role": "EDITOR",
    "created_at": "2026-05-28T10:00:00Z"
  }
  ```

### `DELETE /api/tasks/{task_id}/participations/{user_id}/`
- **Descrição**: Remove um participante de uma tarefa. Pode ser chamado pelo dono da tarefa, ou pelo próprio participante querendo sair do compartilhamento.
- **Response**: `204 No Content`

### `POST /api/tasks/{task_id}/comments/`
- **Descrição**: Adiciona um comentário na tarefa compartilhada.
- **Body**: `{"text": "Estou travado na parte 2!"}`
- **Response** `201 Created`:
  ```json
  {
    "id": 1,
    "user": {"id": 2, "username": "maria", "email": "maria@example.com"},
    "text": "Estou travado na parte 2!",
    "created_at": "2026-05-28T10:05:00Z"
  }
  ```
