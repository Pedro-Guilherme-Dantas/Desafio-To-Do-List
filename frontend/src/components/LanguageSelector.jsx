import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSelector = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <select 
      className="form-select form-select-sm w-auto d-inline-block"
      value={i18n.language} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="pt-BR">Português</option>
      <option value="en">English</option>
    </select>
  )
}

export default LanguageSelector
