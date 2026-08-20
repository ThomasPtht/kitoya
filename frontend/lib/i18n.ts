import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem("userLanguage");
  const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";

  i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, fr: { translation: fr } },
    lng: savedLanguage || deviceLanguage,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
};

initI18n();

export default i18n;
