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
import { Constructable } from '../interfaces.js';
import { itMap, itRange, itToArr, itToRecord } from './utils.js';

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

// TODO: Review these conversion functions
const swigVecToIt = <T>(v: SwigVec<T>) => itMap(itRange(0, v.size()), (i) => v.get(i));
const swigMapToIt = <T, U>(m: SwigMap<T, U>) => itMap(swigVecToIt(m.keys()), (k): [T, U] => [k, m.get(k)]);

// export type IntVect = SwigVec<number>;
// export type UintVect = SwigVec<number>;
// export type FloatVect = SwigVec<number>;
export type StringVect = SwigVec<string>;
// export type IntegerMap = SwigMap<string, number>;
export type StringMap = SwigMap<string, string>;
export type VectMap = SwigVec<StringMap>;
// export type Blob = SwigVec<number>;

export const stringVectToArray = (sv: StringVect) => itToArr(swigVecToIt(sv));
export const stringMapToRecord = (sm: StringMap) => itToRecord(swigMapToIt(sm));
export const vectMapToRecordArray = (vm: VectMap) => itToArr(itMap(swigVecToIt(vm), stringMapToRecord));

/**
 * Non-exhaustive list of properties for JamiSwig.
 *
 * The full list of methods can be found in SWIG interface files (`.i`) in `daemon/bin/nodejs`.
 */
export interface JamiSwig {
  init(args: Record<string, unknown>): void;
  fini(): void;

  getAccountDetails(accountId: string): StringMap;
  getVolatileAccountDetails(accountId: string): StringMap;
  setAccountDetails(accountId: string, details: StringMap): void;
  setAccountActive(accountId: string, active: Bool): void;

  addAccount(details: StringMap): string;
  removeAccount(accountId: string): void;

  getAccountList(): StringVect;

  sendAccountTextMessage(accountId: string, contactId: string, message: StringMap): void;

  lookupName(accountId: string, nameserver: string, username: string): boolean;
  lookupAddress(accountId: string, nameserver: string, address: string): boolean;
  registerName(accountId: string, password: string, username: string): boolean;

  getKnownRingDevices(accountId: string): StringMap;

  addContact(accountId: string, contactId: string): void;
  removeContact(accountId: string, contactId: string, ban: boolean): void;
  getContacts(accountId: string): VectMap;
  getContactDetails(accountId: string, contactId: string): StringMap;

  getDefaultModerators(accountId: string): StringVect;
  setDefaultModerators(accountId: string, uri: string, state: boolean): void;

  getConversations(accountId: string): StringVect;
  conversationInfos(accountId: string, conversationId: string): StringMap;
  getConversationMembers(accountId: string, conversationId: string): VectMap;

  sendMessage(accountId: string, conversationId: string, message: string, replyTo: string): void;
  loadConversationMessages(accountId: string, conversationId: string, fromMessage: string, n: number): number;

  // IntVect: Constructable<IntVect>;
  // UintVect: Constructable<UintVect>;
  // FloatVect: Constructable<FloatVect>;
  // StringVect: Constructable<StringVect>;
  // IntegerMap: Constructable<IntegerMap>
  StringMap: Constructable<StringMap>;
  // VectMap: Constructable<VectMap>;
  // IntegerMap: Constructable<IntegerMap>;
}
