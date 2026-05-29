import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      auth: {
        login: {
          title: "Login",
          username: "Username",
          password: "Password",
          noAccount: "Don't have an account?",
          registerLink: "Sign up",
          authFailed: "Authentication failed:",
          invalidCredentials: "Username or password incorrect.",
          button: "Login",
          loading: "..."
        },
        register: {
          title: "Register",
          username: "Username",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          passwordMismatch: "Passwords do not match.",
          success: "Account created successfully! Please log in.",
          button: "Create Account",
          loading: "...",
          haveAccount: "Already have an account?",
          loginLink: "Login",
          error: "Error creating account:"
        }
      },
      dashboard: {
        title: "Dashboard",
        logout: "Logout",
        newTask: "New Task",
        loading: "Loading...",
        error: "Error loading tasks.",
        loadMore: "Load More Tasks",
        loadingMore: "Loading more...",
        noTasks: "No tasks",
        columns: {
          today: "Today",
          next3Days: "Next 3 Days",
          next5Days: "Next 5 Days",
          nextWeeks: "Next Weeks",
          nextMonth: "Next Month",
          noDeadline: "No Deadline"
        }
      },
      task: {
        editTask: "Edit Task",
        manageCategories: "Manage Categories",
        members: "Members",
        noMembers: "No members",
        selectFriend: "Select a friend to add...",
        add: "Add",
        comments: "Comments",
        noComments: "No comments",
        addComment: "Add comment...",
        send: "Send",
        errorLoadingMembers: "Error loading members:",
        errorLoadingComments: "Error loading comments."
      },
      modal: {
        createTask: "Create Task",
        editTask: "Edit Task",
        title: "Title",
        description: "Description",
        dueDate: "Due Date",
        priority: "Priority",
        category: "Category",
        cancel: "Cancel",
        save: "Save"
      },
      filters: {
        status: "Status",
        priority: "Priority",
        category: "Category",
        all: "All",
        pending: "Pending",
        completed: "Completed"
      },
      friends: {
        title: "Friends",
        loading: "Loading...",
        noFriends: "No friends yet.",
        searchTitle: "Find Friends",
        searchPlaceholder: "Search username or email...",
        searchButton: "Search",
        addFriend: "Add Friend",
        requestSent: "Request Sent",
        noUsersFound: "No users found.",
        status: {
          PENDING: "Pending",
          ACCEPTED: "Accepted",
          REJECTED: "Rejected",
          cancel: "Cancel",
          accept: "Accept",
          reject: "Reject"
        }
      },
      categories: {
        title: "Manage Categories",
        name: "Name",
        color: "Color",
        actions: "Actions",
        add: "Add Category",
        delete: "Delete",
        close: "Close"
      }
    }
  },
  "pt-BR": {
    translation: {
      auth: {
        login: {
          title: "Entrar",
          username: "Nome de Usuário",
          password: "Senha",
          noAccount: "Não tem uma conta?",
          registerLink: "Cadastre-se",
          authFailed: "Falha na autenticação:",
          invalidCredentials: "Nome de usuário ou senha incorretos.",
          button: "Entrar",
          loading: "..."
        },
        register: {
          title: "Cadastro",
          username: "Nome de Usuário",
          email: "E-mail",
          password: "Senha",
          confirmPassword: "Confirmar Senha",
          passwordMismatch: "As senhas não coincidem.",
          success: "Conta criada com sucesso! Faça login.",
          button: "Criar Conta",
          loading: "...",
          haveAccount: "Já tem uma conta?",
          loginLink: "Faça Login",
          error: "Erro ao criar a conta:"
        }
      },
      dashboard: {
        title: "Dashboard",
        logout: "Sair",
        newTask: "Nova Tarefa",
        loading: "Carregando...",
        error: "Erro ao carregar tarefas.",
        loadMore: "Carregar Mais Tarefas",
        loadingMore: "Carregando mais...",
        noTasks: "Nenhuma tarefa",
        columns: {
          today: "Hoje",
          next3Days: "Próx. 3 Dias",
          next5Days: "Próx. 5 Dias",
          nextWeeks: "Próx. Semanas",
          nextMonth: "Próx. Mês",
          noDeadline: "Sem Prazo"
        }
      },
      task: {
        editTask: "Editar Tarefa",
        manageCategories: "Gerenciar Categorias",
        members: "Membros",
        noMembers: "Nenhum membro",
        selectFriend: "Selecione um amigo...",
        add: "Adicionar",
        comments: "Comentários",
        noComments: "Nenhum comentário",
        addComment: "Adicionar comentário...",
        send: "Enviar",
        errorLoadingMembers: "Erro ao carregar membros:",
        errorLoadingComments: "Erro ao carregar comentários."
      },
      modal: {
        createTask: "Criar Tarefa",
        editTask: "Editar Tarefa",
        title: "Título",
        description: "Descrição",
        dueDate: "Data de Vencimento",
        priority: "Prioridade",
        category: "Categoria",
        cancel: "Cancelar",
        save: "Salvar"
      },
      filters: {
        status: "Status",
        priority: "Prioridade",
        category: "Categoria",
        all: "Todos",
        pending: "Pendentes",
        completed: "Concluídas"
      },
      friends: {
        title: "Amigos",
        loading: "Carregando...",
        noFriends: "Nenhum amigo ainda.",
        searchTitle: "Encontrar Amigos",
        searchPlaceholder: "Buscar por usuário ou e-mail...",
        searchButton: "Buscar",
        addFriend: "Adicionar Amigo",
        requestSent: "Solicitação Enviada",
        noUsersFound: "Nenhum usuário encontrado.",
        status: {
          PENDING: "Pendente",
          ACCEPTED: "Aceito",
          REJECTED: "Rejeitado",
          cancel: "Cancelar",
          accept: "Aceitar",
          reject: "Recusar"
        }
      },
      categories: {
        title: "Gerenciar Categorias",
        name: "Nome",
        color: "Cor",
        actions: "Ações",
        add: "Adicionar Categoria",
        delete: "Excluir",
        close: "Fechar"
      }
    }
  }
}

const savedLanguage = localStorage.getItem('i18nextLng') || 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n
