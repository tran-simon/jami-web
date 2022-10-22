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
import { itMap, itRange, itToArr, itToMap } from '../utils.js';

enum Bool {
  False = 'false',
  True = 'true',
}

interface SwigVec<T> {
  size(): number;
  get(i: number): T; // TODO: | undefined;
}

interface SwigMap<T, U> {
  keys(): SwigVec<T>;
  get(k: T): U; // TODO: | undefined;
  set(k: T, v: U): void;
}

const swigVecToIt = <T>(v: SwigVec<T>) => itMap(itRange(0, v.size()), (i) => v.get(i));
const swigMapToIt = <T, U>(m: SwigMap<T, U>) => itMap(swigVecToIt(m.keys()), (k): [T, U] => [k, m.get(k)]);

// type IntVect = SwigVec<number>;
// type UintVect = SwigVec<number>;
// type FloatVect = SwigVec<number>;
export type StringVect = SwigVec<string>;
// type IntegerMap = SwigMap<string, number>;
export type StringMap = SwigMap<string, string>;
// type VectMap = SwigVec<StringMap>;
// type Blob = SwigVec<number>;

export const stringVectToArr = (sv: StringVect) => itToArr(swigVecToIt(sv));
export const stringMapToMap = (sm: StringMap) => itToMap(swigMapToIt(sm));
// const vectMapToJs = (vm: VectMap) => itToArr(itMap(swigVecToIt(vm), stringMapToMap));

export interface JamiSwig {
  init(args: Record<string, unknown>): void;

  // IntVect(): IntVect;
  // UintVect(): UintVect;
  // FloatVect(): FloatVect;
  // StringVect(): StringVect;
  // IntegerMap(): IntegerMap
  // StringMap(): StringMap;
  // VectMap(): VectMap;
  // IntegerMap(): IntegerMap;

  addAccount(details: StringMap): string;
  removeAccount(id: string): void;

  getAccountList(): StringVect;

  registerName(id: string, password: string, username: string): boolean;
  lookupName(id: string, nameserver: string, username: string): boolean;
  lookupAddress(id: string, nameserver: string, address: string): boolean;

  getAccountDetails(id: string): StringMap;
  setAccountDetails(id: string, details: StringMap): void;
  setAccountActive(id: string, active: Bool): void;
}
