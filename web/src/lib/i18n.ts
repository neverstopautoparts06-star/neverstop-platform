import messages from './messages.json';
export const locales = ['vi', 'en', 'zh', 'ar', 'es', 'pt'] as const;
export type Locale = typeof locales[number];
export type MessageKey = keyof typeof messages.vi;
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }
export function localeOf(value: string | null | undefined): Locale { return value && isLocale(value) ? value : 'vi'; }
export function dictionary(locale: Locale) { return messages[contentLocale(locale)]; }
export function localized<T extends { nameVi: string; nameEn: string | null; nameZh: string | null }>(value: T, locale: Locale) {
  return (locale !== 'vi' && locale !== 'zh' ? value.nameEn : locale === 'zh' ? value.nameZh : value.nameVi) || value.nameVi;
}

// Existing catalog copy falls back to English for the newly added header locales.
export function contentLocale(locale:Locale):'vi'|'en'|'zh' {return locale==='vi'||locale==='zh'?locale:'en';}
