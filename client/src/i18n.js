import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import translationEn from "../public/locale/en/translation.json"
import translationFr from "../public/locale/fr/translation.json"

i18n
.use(initReactI18next)
.init({
  debug: process.env.NODE_ENV == "development",
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: translationEn,
    },
    fr: {
      translation: translationFr,
    },
  },
})

export default i18n
