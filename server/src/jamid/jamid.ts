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
  ContactDetails,
  ConversationInfos,
  ConversationMessage,
  Devices,
  LookupResult,
  Message,
  RegisteredNameFoundState,
  VolatileDetails,
  WebSocketMessage,
  WebSocketMessageType,
} from 'jami-web-common';
import log from 'loglevel';
import { filter, firstValueFrom, map, Subject } from 'rxjs';
import { Service } from 'typedi';

import { WebSocketServer } from '../websocket/websocket-server.js';
import { ConversationMemberInfos } from './conversation-member-infos.js';
import { ConversationRequestMetadata } from './conversation-request-metadata.js';
import { JamiSignal } from './jami-signal.js';
import {
  AccountDetailsChanged,
  AccountMessageStatusChanged,
  ContactAdded,
  ContactRemoved,
  ConversationLoaded,
  ConversationMemberEvent,
  ConversationReady,
  ConversationRemoved,
  ConversationRequestReceived,
  IncomingAccountMessage,
  KnownDevicesChanged,
  MessageReceived,
  NameRegistrationEnded,
  RegisteredNameFound,
  RegistrationStateChanged,
  VolatileDetailsChanged,
} from './jami-signal-interfaces.js';
import { JamiSwig, StringMap, stringMapToRecord, stringVectToArray, vectMapToRecordArray } from './jami-swig.js';
import {
  ConversationMemberEventType,
  MessageState,
  NameRegistrationEndedState,
  RegistrationState,
} from './state-enums.js';

const require = createRequire(import.meta.url);

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
    handlers.RegistrationStateChanged = (accountId: string, state: RegistrationState, code: number, details: string) =>
      onRegistrationStateChanged.next({ accountId, state, code, details });

    const onNameRegistrationEnded = new Subject<NameRegistrationEnded>();
    handlers.NameRegistrationEnded = (accountId: string, state: NameRegistrationEndedState, username: string) =>
      onNameRegistrationEnded.next({ accountId, state, username });

    const onRegisteredNameFound = new Subject<RegisteredNameFound>();
    handlers.RegisteredNameFound = (
      accountId: string,
      state: RegisteredNameFoundState,
      address: string,
      username: string
    ) => onRegisteredNameFound.next({ accountId, state, address, username });

    const onKnownDevicesChanged = new Subject<KnownDevicesChanged>();
    handlers.KnownDevicesChanged = (accountId: string, devices: Devices) =>
      onKnownDevicesChanged.next({ accountId, devices });

    const onIncomingAccountMessage = new Subject<IncomingAccountMessage>();
    handlers.IncomingAccountMessage = (accountId: string, from: string, payload: Record<string, string>) =>
      onIncomingAccountMessage.next({ accountId, from, payload });

    const onAccountMessageStatusChanged = new Subject<AccountMessageStatusChanged>();
    handlers.AccountMessageStatusChanged = (accountId: string, messageId: string, peer: string, state: MessageState) =>
      onAccountMessageStatusChanged.next({ accountId, messageId, peer, state });

    const onContactAdded = new Subject<ContactAdded>();
    handlers.ContactAdded = (accountId: string, contactId: string, confirmed: boolean) =>
      onContactAdded.next({ accountId, contactId, confirmed });

    const onContactRemoved = new Subject<ContactRemoved>();
    handlers.ContactRemoved = (accountId: string, contactId: string, banned: boolean) =>
      onContactRemoved.next({ accountId, contactId, banned });

    const onConversationRequestReceived = new Subject<ConversationRequestReceived>();
    handlers.ConversationRequestReceived = (
      accountId: string,
      conversationId: string,
      metadata: ConversationRequestMetadata
    ) => onConversationRequestReceived.next({ accountId, conversationId, metadata });

    const onConversationReady = new Subject<ConversationReady>();
    handlers.ConversationReady = (accountId: string, conversationId: string) =>
      onConversationReady.next({ accountId, conversationId });

    const onConversationRemoved = new Subject<ConversationRemoved>();
    handlers.ConversationRemoved = (accountId: string, conversationId: string) =>
      onConversationRemoved.next({ accountId, conversationId });

    const onConversationLoaded = new Subject<ConversationLoaded>();
    handlers.ConversationLoaded = (id: number, accountId: string, conversationId: string, messages: Message[]) =>
      onConversationLoaded.next({ id, accountId, conversationId, messages });

    const onConversationMemberEvent = new Subject<ConversationMemberEvent>();
    handlers.ConversationMemberEvent = (
      accountId: string,
      conversationId: string,
      memberUri: string,
      event: ConversationMemberEventType
    ) => {
      onConversationMemberEvent.next({ accountId, conversationId, memberUri, event });
    };

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
      onConversationRequestReceived: onConversationRequestReceived.asObservable(),
      onConversationReady: onConversationReady.asObservable(),
      onConversationRemoved: onConversationRemoved.asObservable(),
      onConversationLoaded: onConversationLoaded.asObservable(),
      onConversationMemberEvent: onConversationMemberEvent.asObservable(),
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

  async addAccount(accountDetails: Partial<AccountDetails>): Promise<RegistrationStateChanged> {
    accountDetails['Account.type'] = 'RING';

    const accountDetailsStringMap: StringMap = new this.jamiSwig.StringMap();
    for (const [key, value] of Object.entries(accountDetails)) {
      accountDetailsStringMap.set(key, value.toString());
    }

    const accountId = this.jamiSwig.addAccount(accountDetailsStringMap);
    return firstValueFrom(
      this.events.onRegistrationStateChanged.pipe(
        filter((value) => value.accountId === accountId),
        filter(
          (value) => value.state === RegistrationState.Registered || value.state === RegistrationState.ErrorGeneric
        )
      )
    );
  }

  removeAccount(accountId: string): void {
    this.jamiSwig.removeAccount(accountId);
  }

  getAccountIds(): string[] {
    return stringVectToArray(this.jamiSwig.getAccountList());
  }

  sendAccountTextMessage(accountId: string, contactId: string, message: string): void {
    const messageStringMap: StringMap = new this.jamiSwig.StringMap();
    messageStringMap.set('application/json', message);
    this.jamiSwig.sendAccountTextMessage(accountId, contactId, messageStringMap);
  }

  async lookupUsername(username: string, accountId?: string): Promise<LookupResult> {
    const hasRingNs = this.jamiSwig.lookupName(accountId || '', '', username);
    if (!hasRingNs) {
      throw new Error('Jami does not have a nameserver');
    }
    return firstValueFrom(
      this.events.onRegisteredNameFound.pipe(
        filter((value) => value.username === username),
        map(({ accountId: _, ...response }) => response) // Remove accountId from response
      )
    );
  }

  async lookupAddress(address: string, accountId?: string): Promise<LookupResult> {
    const hasRingNs = this.jamiSwig.lookupAddress(accountId || '', '', address);
    if (!hasRingNs) {
      throw new Error('Jami does not have a nameserver');
    }
    return firstValueFrom(
      this.events.onRegisteredNameFound.pipe(
        filter((value) => value.address === address),
        map(({ accountId: _, ...response }) => response) // Remove accountId from response
      )
    );
  }

  async registerUsername(accountId: string, username: string, password: string): Promise<NameRegistrationEndedState> {
    const hasRingNs = this.jamiSwig.registerName(accountId, password, username);
    if (!hasRingNs) {
      throw new Error('Jami does not have a nameserver');
    }
    return firstValueFrom(
      this.events.onNameRegistrationEnded.pipe(
        filter((value) => value.accountId === accountId),
        map((value) => value.state)
      )
    );
  }

  getDevices(accountId: string): Devices {
    return stringMapToRecord(this.jamiSwig.getKnownRingDevices(accountId));
  }

  addContact(accountId: string, contactId: string): void {
    this.jamiSwig.addContact(accountId, contactId);
  }

  sendTrustRequest(accountId: string, contactId: string): void {
    this.jamiSwig.sendTrustRequest(accountId, contactId, new this.jamiSwig.Blob());
  }

  removeContact(accountId: string, contactId: string): void {
    this.jamiSwig.removeContact(accountId, contactId, false);
  }

  blockContact(accountId: string, contactId: string): void {
    this.jamiSwig.removeContact(accountId, contactId, true);
  }

  getContacts(accountId: string): ContactDetails[] {
    return vectMapToRecordArray(this.jamiSwig.getContacts(accountId)) as unknown as ContactDetails[];
  }

  getContactDetails(accountId: string, contactId: string): ContactDetails {
    return stringMapToRecord(this.jamiSwig.getContactDetails(accountId, contactId)) as unknown as ContactDetails;
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

  getConversationInfos(accountId: string, conversationId: string): ConversationInfos {
    return stringMapToRecord(
      this.jamiSwig.conversationInfos(accountId, conversationId)
    ) as unknown as ConversationInfos;
  }

  getConversationMembers(accountId: string, conversationId: string): ConversationMemberInfos[] {
    return vectMapToRecordArray(
      this.jamiSwig.getConversationMembers(accountId, conversationId)
    ) as unknown as ConversationMemberInfos[];
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

  sendConversationMessage(
    accountId: string,
    conversationId: string,
    message: string,
    replyTo?: string,
    flag?: number
  ): void {
    this.jamiSwig.sendMessage(accountId, conversationId, message, replyTo ?? '', flag ?? 0);
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

      if (username) {
        // Keep map of usernames to account IDs
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

    this.events.onIncomingAccountMessage.subscribe(<T extends WebSocketMessageType>(signal: IncomingAccountMessage) => {
      log.debug('Received IncomingAccountMessage:', JSON.stringify(signal));

      const message: Partial<WebSocketMessage<T>> = JSON.parse(signal.payload['application/json']);

      if (typeof message !== 'object' || message === null) {
        log.warn('Account message is not an object');
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

      this.webSocketServer.send(signal.accountId, message.type, message.data);
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

    this.events.onConversationRequestReceived.subscribe((signal) => {
      log.debug('Received ConversationRequestReceived:', JSON.stringify(signal));

      // TODO: Prompt user to accept conversation request on client
      // Currently, we auto-accept all incoming conversation requests. In future, we
      // need to ask the user if they accept the conversation request or not. Part of
      // it can be done by sending a WebSocket event.
      // See other implementations e.g. block contact / decline request / accept request.
      this.jamiSwig.acceptConversationRequest(signal.accountId, signal.conversationId);
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

    this.events.onConversationMemberEvent.subscribe((signal) => {
      log.debug('Received onConversationMemberEvent:', JSON.stringify(signal));
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
