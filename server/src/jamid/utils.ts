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
import { createRequire } from 'node:module';

// TODO: Move these functions to jami-swig.ts

export function* itRange(lo: number, hi: number) {
  for (let i = lo; i < hi; ++i) {
    yield i;
  }
}

export function* itMap<T, U>(it: Iterable<T>, cb: (value: T, index: number) => U) {
  let i = 0;
  for (const item of it) {
    yield cb(item, i++);
  }
}

export function* itFilter<T>(it: Iterable<T>, cb: (value: T, index: number) => boolean) {
  let i = 0;
  for (const item of it) {
    if (cb(item, i++)) {
      yield item;
    }
  }
}

export const itToArr = <T>(it: Iterable<T>) => Array.from(it);

export const itToMap = <T, U>(it: Iterable<[T, U]>) => {
  const m = new Map<T, U>();
  for (const [k, v] of it) {
    m.set(k, v);
  }
  return m;
};

export const itToRecord = <T>(it: Iterable<[string, T]>) => {
  const r: Record<string, T> = {};
  for (const [k, v] of it) {
    r[k] = v;
  }
  return r;
};

export const require = createRequire(import.meta.url);
