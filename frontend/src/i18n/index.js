import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      "auth.login.title": "Login",
      "dashboard.welcome": "Welcome",
      // ... more translations to follow
    }
  },
  "pt-BR": {
    translation: {
      "auth.login.title": "Entrar",
      "dashboard.welcome": "Bem-vindo",
      // ... more translations to follow
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt-BR", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
