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
import log from 'loglevel';
import { filter, firstValueFrom, Subject } from 'rxjs';
import { Service } from 'typedi';

import { itMap, itRange, itToArr, itToMap, require } from './utils.js';

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
type StringVect = SwigVec<string>;
// type IntegerMap = SwigMap<string, number>;
type StringMap = SwigMap<string, string>;
// type VectMap = SwigVec<StringMap>;
// type Blob = SwigVec<number>;

const stringVectToArr = (sv: StringVect) => itToArr(swigVecToIt(sv));
const stringMapToMap = (sm: StringMap) => itToMap(swigMapToIt(sm));
// const vectMapToJs = (vm: VectMap) => itToArr(itMap(swigVecToIt(vm), stringMapToMap));

interface JamiSwig {
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

enum JamiSignal {
  // using DRing::ConfigurationSignal;
  AccountsChanged = 'AccountsChanged',
  AccountDetailsChanged = 'AccountDetailsChanged',
  RegistrationStateChanged = 'RegistrationStateChanged',
  ContactAdded = 'ContactAdded',
  ContactRemoved = 'ContactRemoved',
  ExportOnRingEnded = 'ExportOnRingEnded',
  NameRegistrationEnded = 'NameRegistrationEnded',
  RegisteredNameFound = 'RegisteredNameFound',
  VolatileDetailsChanged = 'VolatileDetailsChanged',
  KnownDevicesChanged = 'KnownDevicesChanged',
  IncomingAccountMessage = 'IncomingAccountMessage',
  AccountMessageStatusChanged = 'AccountMessageStatusChanged',

  // using DRing::CallSignal;
  StateChange = 'StateChange',
  IncomingMessage = 'IncomingMessage',
  IncomingCall = 'IncomingCall',
  IncomingCallWithMedia = 'IncomingCallWithMedia',
  MediaChangeRequested = 'MediaChangeRequested',

  // using DRing::ConversationSignal;
  ConversationLoaded = 'ConversationLoaded',
  MessagesFound = 'MessagesFound',
  MessageReceived = 'MessageReceived',
  ConversationProfileUpdated = 'ConversationProfileUpdated',
  ConversationRequestReceived = 'ConversationRequestReceived',
  ConversationRequestDeclined = 'ConversationRequestDeclined',
  ConversationReady = 'ConversationReady',
  ConversationRemoved = 'ConversationRemoved',
  ConversationMemberEvent = 'ConversationMemberEvent',
  OnConversationError = 'OnConversationError',
  OnConferenceInfosUpdated = 'OnConferenceInfosUpdated',
}

interface VolatileDetailsChanged {
  accountId: string;
  details: Map<string, string>;
}

interface RegistrationStateChanged {
  accountId: string;
  state: string;
  code: number;
  details: string;
}

interface NameRegistrationEnded {
  accountId: string;
  state: number;
  username: string;
}

interface RegisteredNameFound {
  accountId: string;
  state: number;
  address: string;
  username: string;
}

@Service()
export class Jamid {
  private readonly jamid: JamiSwig;
  private readonly mapUsernameToAccountId: Map<string, string>;
  private readonly events;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.jamid = require('../jamid.node') as JamiSwig;

    const handlers: Record<string, unknown> = {};
    const handler = (sig: string) => {
      return (...args: unknown[]) => log.warn('Unhandled', sig, args);
    };
    Object.keys(JamiSignal).forEach((sig) => (handlers[sig] = handler(sig)));

    const onVolatileDetailsChanged = new Subject<VolatileDetailsChanged>();
    handlers.VolatileDetailsChanged = (accountId: string, details: Record<string, string>) =>
      onVolatileDetailsChanged.next({ accountId, details: new Map(Object.entries(details)) });

    const onRegistrationStateChanged = new Subject<RegistrationStateChanged>();
    handlers.RegistrationStateChanged = (accountId: string, state: string, code: number, details: string) =>
      onRegistrationStateChanged.next({ accountId, state, code, details });

    const onNameRegistrationEnded = new Subject<NameRegistrationEnded>();
    handlers.NameRegistrationEnded = (accountId: string, state: number, username: string) =>
      onNameRegistrationEnded.next({ accountId, state, username });

    const onRegisteredNameFound = new Subject<RegisteredNameFound>();
    handlers.RegisteredNameFound = (accountId: string, state: number, address: string, username: string) =>
      onRegisteredNameFound.next({ accountId, state, address, username });

    this.events = {
      onVolatileDetailsChanged: onVolatileDetailsChanged.asObservable(),
      onRegistrationStateChanged: onRegistrationStateChanged.asObservable(),
      onNameRegistrationEnded: onNameRegistrationEnded.asObservable(),
      onRegisteredNameFound: onRegisteredNameFound.asObservable(),
    };

    this.events.onVolatileDetailsChanged.subscribe(({ accountId, details }) => {
      log.debug('[1] Received onVolatileDetailsChanged with', { accountId, details });
      // Keep map of usernames to account IDs as Jamid cannot do this by itself (AFAIK)
      const username = details.get('Account.registeredName');
      if (username) {
        this.mapUsernameToAccountId.set(username, accountId);
      }
    });
    this.events.onRegistrationStateChanged.subscribe((ctx) =>
      log.debug('[1] Received onRegistrationStateChanged with', ctx)
    );
    this.events.onNameRegistrationEnded.subscribe((ctx) => log.debug('[1] Received onNameRegistrationEnded with', ctx));
    this.events.onRegisteredNameFound.subscribe((ctx) => log.debug('[1] Received onRegisteredNameFound with', ctx));

    this.mapUsernameToAccountId = new Map<string, string>();

    // 1. You cannot change event handlers after init
    // 2. You cannot specify multiple handlers for the same event
    // 3. You cannot specify a default handler
    // So we rely on the Subject() instead of Observable()
    // Also, handlers receive multiple argument instead of tuple or object!
    this.jamid.init(handlers);
  }

  getAccountList() {
    return stringVectToArr(this.jamid.getAccountList());
  }

  async createAccount(details: Map<string, string | number | boolean>) {
    // TODO: add proper typing directly into JamiSwig
    const stringMapDetails: StringMap = new (this.jamid as any).StringMap();

    stringMapDetails.set('Account.type', 'RING');
    itMap(details.entries(), ([k, v]) => stringMapDetails.set('Account.' + k, v.toString()));

    const id = this.jamid.addAccount(stringMapDetails);
    return firstValueFrom(
      this.events.onRegistrationStateChanged.pipe(
        filter(({ accountId }) => accountId === id),
        // TODO: is it the only state?
        filter(({ state }) => state === 'REGISTERED')
      )
    );
  }

  destroyAccount(id: string) {
    this.jamid.removeAccount(id);
  }

  async registerUsername(id: string, username: string, password: string) {
    const hasRingNs = this.jamid.registerName(id, password, username);
    if (!hasRingNs) {
      log.error('Jami does not have NS');
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(this.events.onNameRegistrationEnded.pipe(filter(({ accountId }) => accountId === id)));
  }

  // TODO: Ideally, we would fetch the username directly from Jami instead of
  // keeping an internal map.
  usernameToAccountId(username: string) {
    return this.mapUsernameToAccountId.get(username);
  }

  async lookupUsername(username: string) {
    const hasRingNs = this.jamid.lookupName('', '', username);
    if (!hasRingNs) {
      log.error('Jami does not have NS');
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(this.events.onRegisteredNameFound.pipe(filter((r) => r.username === username)));
  }

  getAccountDetails(id: string) {
    return stringMapToMap(this.jamid.getAccountDetails(id));
  }
}
