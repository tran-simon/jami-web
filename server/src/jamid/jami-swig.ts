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
import { Constructable } from '../interfaces/constructable.js';

interface SwigVect<T> {
  size(): number;
  get(index: number): T | undefined;
}

interface SwigMap<T, U> {
  keys(): SwigVect<T>;
  get(key: T): U | undefined;
  set(key: T, value: U): void;
}

// export type IntVect = SwigVec<number>;
// export type UintVect = SwigVec<number>;
// export type FloatVect = SwigVec<number>;
export type StringVect = SwigVect<string>;
// export type IntegerMap = SwigMap<string, number>;
export type StringMap = SwigMap<string, string>;
export type VectMap = SwigVect<StringMap>;
// export type Blob = SwigVec<number>;

function* swigVectToIt<T>(swigVect: SwigVect<T>) {
  const size = swigVect.size();
  for (let i = 0; i < size; i++) {
    yield swigVect.get(i)!;
  }
}

function* swigMapToIt<T, U>(swigMap: SwigMap<T, U>) {
  const keys = swigVectToIt(swigMap.keys());
  for (const key of keys) {
    const value = swigMap.get(key)!;
    yield [key, value];
  }
}

export function stringVectToArray(stringVect: StringVect): string[] {
  const elements = swigVectToIt(stringVect);
  return Array.from(elements);
}

export function stringMapToRecord(stringMap: StringMap): Record<string, string> {
  const keyValuePairs = swigMapToIt(stringMap);
  const record: Record<string, string> = {};
  for (const [key, value] of keyValuePairs) {
    record[key] = value;
  }
  return record;
}

export function vectMapToRecordArray(vectMap: VectMap): Record<string, string>[] {
  const stringMaps = swigVectToIt(vectMap);
  const records = [];
  for (const stringMap of stringMaps) {
    const record = stringMapToRecord(stringMap);
    records.push(record);
  }
  return records;
}

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
  setDefaultModerator(accountId: string, uri: string, state: boolean): void;

  getConversations(accountId: string): StringVect;
  conversationInfos(accountId: string, conversationId: string): StringMap;
  getConversationMembers(accountId: string, conversationId: string): VectMap;

  sendMessage(accountId: string, conversationId: string, message: string, replyTo: string): void;
  loadConversationMessages(accountId: string, conversationId: string, fromMessage: string, n: number): number;

  getCallList(accountId: string): StringVect;
  getCallDetails(accountId: string, callId: string): StringMap;

  // IntVect: Constructable<IntVect>;
  // UintVect: Constructable<UintVect>;
  // FloatVect: Constructable<FloatVect>;
  // StringVect: Constructable<StringVect>;
  // IntegerMap: Constructable<IntegerMap>
  StringMap: Constructable<StringMap>;
  // VectMap: Constructable<VectMap>;
  // IntegerMap: Constructable<IntegerMap>;
}
