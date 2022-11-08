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
import { filesize } from 'filesize';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// 'filesize.js' library requires us to define the symbols ourselves for localization:
// https://github.com/avoidwork/filesize.js/issues/64
// https://github.com/avoidwork/filesize.js/issues/96
// Could not find a library doing it by itself
const dataSizeSymbols: Record<string, Record<string, string>> = {
  fr: { B: 'o', kB: 'ko', MB: 'Mo', GB: 'Go', TB: 'To', PB: 'Po', EB: 'Eo', ZB: 'Zo', YB: 'Yo' },
  ru: { B: 'Б', kB: 'кБ', MB: 'МБ', GB: 'ГБ', TB: 'ТБ', PB: 'ПБ', EB: 'ЭБ', ZB: 'ЗБ', YB: 'ЙБ' },
  default: { B: 'B', kB: 'kB', MB: 'MB', GB: 'GB', TB: 'TB', PB: 'PB', EB: 'EB', ZB: 'ZB', YB: 'YB' },
};

export const useDataSizeUnits = (nbBytes: number) => {
  const { i18n } = useTranslation();
  return useMemo(() => {
    const options = {
      symbols: dataSizeSymbols[i18n.language] || dataSizeSymbols['default'], // undefined is not supported
      locale: i18n.language,
    };
    return filesize(nbBytes, options);
  }, [i18n, nbBytes]);
};
