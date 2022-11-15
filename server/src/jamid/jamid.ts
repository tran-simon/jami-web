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

import {
  AccountDetails,
  AccountTextMessage,
  ConversationMessage,
  Message,
  VolatileDetails,
  WebSocketMessage,
  WebSocketMessageType,
} from 'jami-web-common';
import log from 'loglevel';
import { filter, firstValueFrom, map, Subject } from 'rxjs';
import { Service } from 'typedi';

import { WebSocketServer } from '../websocket/websocket-server.js';
import { JamiSignal } from './jami-signal.js';
import {
  AccountDetailsChanged,
  AccountMessageStatusChanged,
  ContactAdded,
  ContactRemoved,
  ConversationLoaded,
  ConversationReady,
  ConversationRemoved,
  IncomingAccountMessage,
  KnownDevicesChanged,
  MessageReceived,
  NameRegistrationEnded,
  RegisteredNameFound,
  RegistrationStateChanged,
  VolatileDetailsChanged,
} from './jami-signal-interfaces.js';
import { JamiSwig, StringMap, stringMapToRecord, stringVectToArray, vectMapToRecordArray } from './jami-swig.js';

const require = createRequire(import.meta.url);

// TODO: Convert Records to interfaces and replace them in common/ (e.g. Contact)

@Service()
export class Jamid {
  private jamiSwig: JamiSwig;
  private usernamesToAccountIds = new Map<string, string>();
  private readonly events;

  constructor(private webSocketServer: WebSocketServer) {
    this.jamiSwig = require('../../jamid.node') as JamiSwig;

    // Setup signal handlers
    const handlers: Record<string, unknown> = {};

    // Add default handler for all signals
    const createDefaultHandler = (signal: string) => {
      return (...args: unknown[]) => log.warn('Unhandled', signal, args);
    };
    for (const signal in JamiSignal) {
      handlers[signal] = createDefaultHandler(signal);
    }

    // Overwrite handlers for handled signals using RxJS Subjects, converting multiple arguments to objects
    const onAccountsChanged = new Subject<void>();
    handlers.AccountsChanged = () => onAccountsChanged.next();

    const onAccountDetailsChanged = new Subject<AccountDetailsChanged>();
    handlers.AccountDetailsChanged = (accountId: string, details: AccountDetails) =>
      onAccountDetailsChanged.next({ accountId, details });

    const onVolatileDetailsChanged = new Subject<VolatileDetailsChanged>();
    handlers.VolatileDetailsChanged = (accountId: string, details: VolatileDetails) =>
      onVolatileDetailsChanged.next({ accountId, details });

    const onRegistrationStateChanged = new Subject<RegistrationStateChanged>();
    handlers.RegistrationStateChanged = (accountId: string, state: string, code: number, details: string) =>
      onRegistrationStateChanged.next({ accountId, state, code, details });

    const onNameRegistrationEnded = new Subject<NameRegistrationEnded>();
    handlers.NameRegistrationEnded = (accountId: string, state: number, username: string) =>
      onNameRegistrationEnded.next({ accountId, state, username });

    const onRegisteredNameFound = new Subject<RegisteredNameFound>();
    handlers.RegisteredNameFound = (accountId: string, state: number, address: string, username: string) =>
      onRegisteredNameFound.next({ accountId, state, address, username });

    const onKnownDevicesChanged = new Subject<KnownDevicesChanged>();
    handlers.KnownDevicesChanged = (accountId: string, devices: Record<string, string>) =>
      onKnownDevicesChanged.next({ accountId, devices });

    const onIncomingAccountMessage = new Subject<IncomingAccountMessage>();
    handlers.IncomingAccountMessage = (accountId: string, from: string, payload: Record<string, string>) =>
      onIncomingAccountMessage.next({ accountId, from, payload });

    const onAccountMessageStatusChanged = new Subject<AccountMessageStatusChanged>();
    handlers.AccountMessageStatusChanged = (accountId: string, messageId: string, peer: string, state: number) =>
      onAccountMessageStatusChanged.next({ accountId, messageId, peer, state });

    const onContactAdded = new Subject<ContactAdded>();
    handlers.ContactAdded = (accountId: string, contactId: string, confirmed: boolean) =>
      onContactAdded.next({ accountId, contactId, confirmed });

    const onContactRemoved = new Subject<ContactRemoved>();
    handlers.ContactRemoved = (accountId: string, contactId: string, banned: boolean) =>
      onContactRemoved.next({ accountId, contactId, banned });

    const onConversationReady = new Subject<ConversationReady>();
    handlers.ConversationReady = (accountId: string, conversationId: string) =>
      onConversationReady.next({ accountId, conversationId });

    const onConversationRemoved = new Subject<ConversationRemoved>();
    handlers.ConversationRemoved = (accountId: string, conversationId: string) =>
      onConversationRemoved.next({ accountId, conversationId });

    const onConversationLoaded = new Subject<ConversationLoaded>();
    handlers.ConversationLoaded = (id: number, accountId: string, conversationId: string, messages: Message[]) =>
      onConversationLoaded.next({ id, accountId, conversationId, messages });

    const onMessageReceived = new Subject<MessageReceived>();
    handlers.MessageReceived = (accountId: string, conversationId: string, message: Message) =>
      onMessageReceived.next({ accountId, conversationId, message });

    // Expose all signals in an events object to allow other handlers to subscribe after jamiSwig.init()
    this.events = {
      onAccountsChanged: onAccountsChanged.asObservable(),
      onAccountDetailsChanged: onAccountDetailsChanged.asObservable(),
      onVolatileDetailsChanged: onVolatileDetailsChanged.asObservable(),
      onRegistrationStateChanged: onRegistrationStateChanged.asObservable(),
      onNameRegistrationEnded: onNameRegistrationEnded.asObservable(),
      onRegisteredNameFound: onRegisteredNameFound.asObservable(),
      onKnownDevicesChanged: onKnownDevicesChanged.asObservable(),
      onIncomingAccountMessage: onIncomingAccountMessage.asObservable(),
      onAccountMessageStatusChanged: onAccountMessageStatusChanged.asObservable(),
      onContactAdded: onContactAdded.asObservable(),
      onContactRemoved: onContactRemoved.asObservable(),
      onConversationReady: onConversationReady.asObservable(),
      onConversationRemoved: onConversationRemoved.asObservable(),
      onConversationLoaded: onConversationLoaded.asObservable(),
      onMessageReceived: onMessageReceived.asObservable(),
    };

    this.setupSignalHandlers();

    // RxJS Subjects are used as signal handlers for the following reasons:
    // 1. You cannot change event handlers after calling jamiSwig.init()
    // 2. You cannot specify multiple handlers for the same event
    // 3. You cannot specify a default handler
    this.jamiSwig.init(handlers);
  }

  stop(): void {
    this.jamiSwig.fini();
  }

  getVolatileAccountDetails(accountId: string): VolatileDetails {
    return stringMapToRecord(this.jamiSwig.getVolatileAccountDetails(accountId)) as unknown as VolatileDetails;
  }

  getAccountDetails(accountId: string): AccountDetails {
    return stringMapToRecord(this.jamiSwig.getAccountDetails(accountId)) as unknown as AccountDetails;
  }

  setAccountDetails(accountId: string, accountDetails: AccountDetails): void {
    const accountDetailsStringMap: StringMap = new this.jamiSwig.StringMap();
    for (const [key, value] of Object.entries(accountDetails)) {
      accountDetailsStringMap.set(key, value);
    }
    this.jamiSwig.setAccountDetails(accountId, accountDetailsStringMap);
  }

  async addAccount(details: Map<string, string | number | boolean>): Promise<string> {
    const detailsStringMap: StringMap = new this.jamiSwig.StringMap();

    detailsStringMap.set('Account.type', 'RING');
    for (const [key, value] of details.entries()) {
      detailsStringMap.set('Account.' + key, value.toString());
    }

    const accountId = this.jamiSwig.addAccount(detailsStringMap);
    return firstValueFrom(
      this.events.onRegistrationStateChanged.pipe(
        filter((value) => value.accountId === accountId),
        // TODO: is it the only state?
        // TODO: Replace with string enum in common/
        filter((value) => value.state === 'REGISTERED'),
        map((value) => value.accountId)
      )
    );
  }

  removeAccount(accountId: string): void {
    this.jamiSwig.removeAccount(accountId);
  }

  getAccountIds(): string[] {
    return stringVectToArray(this.jamiSwig.getAccountList());
  }

  sendAccountTextMessage(from: string, to: string, message: string): void {
    const messageStringMap: StringMap = new this.jamiSwig.StringMap();
    messageStringMap.set('application/json', message);
    this.jamiSwig.sendAccountTextMessage(from, to, messageStringMap);
  }

  // TODO: Add interface for returned type
  async lookupUsername(username: string, accountId?: string) {
    const hasRingNs = this.jamiSwig.lookupName(accountId || '', '', username);
    if (!hasRingNs) {
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(
      this.events.onRegisteredNameFound.pipe(
        filter((value) => value.username === username),
        map(({ accountId: _, ...response }) => response) // Remove accountId from response
      )
    );
  }

  // TODO: Add interface for returned type
  async lookupAddress(address: string, accountId?: string) {
    const hasRingNs = this.jamiSwig.lookupAddress(accountId || '', '', address);
    if (!hasRingNs) {
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(
      this.events.onRegisteredNameFound.pipe(
        filter((value) => value.address === address),
        map(({ accountId: _, ...response }) => response) // Remove accountId from response
      )
    );
  }

  // TODO: Create enum for state and return that rather than a number
  async registerUsername(accountId: string, username: string, password: string): Promise<number> {
    const hasRingNs = this.jamiSwig.registerName(accountId, password, username);
    if (!hasRingNs) {
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(
      this.events.onNameRegistrationEnded.pipe(
        filter((value) => value.accountId === accountId),
        map((value) => value.state)
      )
    );
  }

  getDevices(accountId: string): Record<string, string> {
    return stringMapToRecord(this.jamiSwig.getKnownRingDevices(accountId));
  }

  addContact(accountId: string, contactId: string): void {
    this.jamiSwig.addContact(accountId, contactId);
  }

  removeContact(accountId: string, contactId: string): void {
    this.jamiSwig.removeContact(accountId, contactId, false);
  }

  blockContact(accountId: string, contactId: string): void {
    this.jamiSwig.removeContact(accountId, contactId, true);
  }

  // TODO: Replace Record with interface
  getContacts(accountId: string): Record<string, string>[] {
    return vectMapToRecordArray(this.jamiSwig.getContacts(accountId));
  }

  // TODO: Replace Record with interface
  getContactDetails(accountId: string, contactId: string): Record<string, string> {
    return stringMapToRecord(this.jamiSwig.getContactDetails(accountId, contactId));
  }

  getDefaultModeratorUris(accountId: string): string[] {
    return stringVectToArray(this.jamiSwig.getDefaultModerators(accountId));
  }

  addDefaultModerator(accountId: string, contactId: string): void {
    this.jamiSwig.setDefaultModerator(accountId, contactId, true);
  }

  removeDefaultModerator(accountId: string, contactId: string): void {
    this.jamiSwig.setDefaultModerator(accountId, contactId, false);
  }

  getConversationIds(accountId: string): string[] {
    return stringVectToArray(this.jamiSwig.getConversations(accountId));
  }

  // TODO: Replace Record with interface
  getConversationInfos(accountId: string, conversationId: string): Record<string, string> {
    return stringMapToRecord(this.jamiSwig.conversationInfos(accountId, conversationId));
  }

  // TODO: Replace Record with interface
  getConversationMembers(accountId: string, conversationId: string): Record<string, string>[] {
    return vectMapToRecordArray(this.jamiSwig.getConversationMembers(accountId, conversationId));
  }

  async getConversationMessages(accountId: string, conversationId: string, fromMessage?: string): Promise<Message[]> {
    const requestId = this.jamiSwig.loadConversationMessages(accountId, conversationId, fromMessage || '', 32);
    return firstValueFrom(
      this.events.onConversationLoaded.pipe(
        filter((value) => value.id === requestId),
        map((value) => value.messages)
      )
    );
  }

  sendConversationMessage(accountId: string, conversationId: string, message: string, replyTo?: string): void {
    this.jamiSwig.sendMessage(accountId, conversationId, message, replyTo || '');
  }

  getCallIds(accountId: string): string[] {
    return stringVectToArray(this.jamiSwig.getCallList(accountId));
  }

  // TODO: Replace Record with interface
  getCallDetails(accountId: string, callId: string): Record<string, string> {
    return stringMapToRecord(this.jamiSwig.getCallDetails(accountId, callId));
  }

  getAccountIdFromUsername(username: string): string | undefined {
    return this.usernamesToAccountIds.get(username);
  }

  private setupSignalHandlers(): void {
    this.events.onAccountsChanged.subscribe(() => {
      log.debug('Received AccountsChanged');
    });

    this.events.onAccountDetailsChanged.subscribe((signal) => {
      log.debug('Received AccountsDetailsChanged', JSON.stringify(signal));
    });

    this.events.onVolatileDetailsChanged.subscribe(({ accountId, details }) => {
      const username = details['Account.registeredName'];
      log.debug(
        `Received VolatileDetailsChanged: {"accountId":"${accountId}",` +
          `"details":{"Account.registeredName":"${username}", ...}}`
      );
      // Keep map of usernames to account IDs
      if (username) {
        this.usernamesToAccountIds.set(username, accountId);
      }
    });

    this.events.onRegistrationStateChanged.subscribe((signal) => {
      log.debug('Received RegistrationStateChanged:', JSON.stringify(signal));
    });

    this.events.onNameRegistrationEnded.subscribe((signal) => {
      log.debug('Received NameRegistrationEnded:', JSON.stringify(signal));
    });

    this.events.onRegisteredNameFound.subscribe((signal) => {
      log.debug('Received RegisteredNameFound:', JSON.stringify(signal));
    });

    this.events.onKnownDevicesChanged.subscribe(({ accountId }) => {
      log.debug(`Received KnownDevicesChanged: {"accountId":"${accountId}", ...}`);
    });

    this.events.onIncomingAccountMessage.subscribe((signal) => {
      log.debug('Received IncomingAccountMessage:', JSON.stringify(signal));
      const message: WebSocketMessage<any> = JSON.parse(signal.payload['application/json']);

      if (message === undefined) {
        log.warn('Undefined account message');
        return;
      }

      if (message.type === undefined || message.data === undefined) {
        log.warn('Account message is not a valid WebSocketMessage (missing type or data fields)');
        return;
      }

      if (!Object.values(WebSocketMessageType).includes(message.type)) {
        log.warn(`Invalid WebSocket message type: ${message.type}`);
        return;
      }

      const data: AccountTextMessage<unknown> = {
        from: signal.from,
        to: signal.accountId,
        message: message.data.message,
      };

      this.webSocketServer.send(signal.accountId, message.type, data);
    });

    this.events.onAccountMessageStatusChanged.subscribe((signal) => {
      log.debug('Received AccountMessageStatusChanged:', JSON.stringify(signal));
    });

    this.events.onContactAdded.subscribe((signal) => {
      log.debug('Received ContactAdded:', JSON.stringify(signal));
    });

    this.events.onContactRemoved.subscribe((signal) => {
      log.debug('Received ContactRemoved:', JSON.stringify(signal));
    });

    this.events.onConversationReady.subscribe((signal) => {
      log.debug('Received ConversationReady:', JSON.stringify(signal));
    });

    this.events.onConversationRemoved.subscribe((signal) => {
      log.debug('Received ConversationRemoved:', JSON.stringify(signal));
    });

    this.events.onConversationLoaded.subscribe(({ id, accountId, conversationId }) => {
      log.debug(
        `Received ConversationLoaded: {"id":"${id}","accountId":"${accountId}",` +
          `"conversationId":"${conversationId}","messages":[...]}`
      );
    });

    this.events.onMessageReceived.subscribe((signal) => {
      log.debug('Received MessageReceived:', JSON.stringify(signal));
      const data: ConversationMessage = {
        conversationId: signal.conversationId,
        message: signal.message,
      };
      this.webSocketServer.send(signal.accountId, WebSocketMessageType.ConversationMessage, data);
    });
  }
}
