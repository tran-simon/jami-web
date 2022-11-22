/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import i18n, { Resource, ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEn from './locale/en/translation.json';
import translationFr from './locale/fr/translation.json';

interface LanguageInfo {
  tag: string;
  fullName: string;
  translation: ResourceLanguage;
}

export const availableLanguages: LanguageInfo[] = [
  {
    tag: 'fr',
    fullName: 'Français',
    translation: translationFr,
  },
  {
    tag: 'en',
    fullName: 'English',
    translation: translationEn,
  },
];

const resources = availableLanguages.reduce((resources: Resource, { tag, translation }) => {
  resources[tag] = { translation };
  return resources;
}, {});

i18n.use(initReactI18next).init({
  debug: import.meta.env.DEV,
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources,
});

export default i18n;
