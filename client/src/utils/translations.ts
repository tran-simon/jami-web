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

export type Interpolations = Record<string, string>;

export interface TranslateEnumerationOptions<T> {
  // partial i18next interpolation key to which an index will be added
  elementPartialKey: string;
  // function to retrieve the i18next interpolation value
  getElementValue: (element: T) => string;
  // functions to translate the enumeration according to the number of elements
  // The index of the function corresponds to the number of elements in the enumeration
  // If the number of elements is higher than the number of functions, then the last function of the array will be used
  translaters: ((interpolations: Interpolations) => string)[];
}

export const translateEnumeration = <T>(list: T[], options: TranslateEnumerationOptions<T>): string => {
  const quantity = list.length;
  const max = options.translaters.length;

  const interpolations: Interpolations = {};

  for (let i = 0; i < quantity && i < max; i++) {
    const elementKey = `${options.elementPartialKey}${i}`;
    interpolations[elementKey] = options.getElementValue(list[i]);
  }

  interpolations.excess = (max - quantity + 1).toString();

  const translaterIndex = quantity <= max ? quantity : max;

  return options.translaters[translaterIndex](interpolations);
};
