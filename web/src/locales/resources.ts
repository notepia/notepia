import en from './en';
import zhTW from './zh-TW';

export const resources = {
  en: {
    translation: en
  },
  'zh-TW': {
    translation: zhTW
  }
} as const;

export type I18nNamespace = keyof typeof resources;
export type TranslationKeys = keyof typeof en; 