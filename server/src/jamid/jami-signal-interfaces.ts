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
import { AccountDetails, Devices, Message, VolatileDetails } from 'jami-web-common';
import { RegisteredNameFoundState } from 'jami-web-common';

import { ConversationRequestMetadata } from './conversation-request-metadata.js';
import {
  ConversationMemberEventType,
  MessageState,
  NameRegistrationEndedState,
  RegistrationState,
} from './state-enums.js';

// These interfaces are used to hold all the parameters for signal handlers
// These parameters' names and types can be found in daemon/bin/nodejs/callback.h
// or in their relevant SWIG interface files (.i) in daemon/bin/nodejs

export interface AccountDetailsChanged {
  accountId: string;
  details: AccountDetails;
}

export interface VolatileDetailsChanged {
  accountId: string;
  details: VolatileDetails;
}

export interface RegistrationStateChanged {
  accountId: string;
  state: RegistrationState;
  code: number;
  details: string;
}

export interface NameRegistrationEnded {
  accountId: string;
  state: NameRegistrationEndedState;
  username: string;
}

export interface RegisteredNameFound {
  accountId: string;
  state: RegisteredNameFoundState;
  address: string;
  username: string;
}

export interface KnownDevicesChanged {
  accountId: string;
  devices: Devices;
}

export interface IncomingAccountMessage {
  accountId: string;
  from: string;
  payload: Record<string, string>;
}

export interface AccountMessageStatusChanged {
  accountId: string;
  messageId: string;
  peer: string;
  state: MessageState;
}

export interface IncomingTrustRequest {
  accountId: string;
  conversationId: string;
  from: string;
  payload: number[];
  received: number;
}

export interface ContactAdded {
  accountId: string;
  contactId: string;
  confirmed: boolean;
}

export interface ContactRemoved {
  accountId: string;
  contactId: string;
  banned: boolean;
}

export interface ConversationRequestReceived {
  accountId: string;
  conversationId: string;
  metadata: ConversationRequestMetadata;
}

export interface ConversationReady {
  accountId: string;
  conversationId: string;
}

export interface ConversationRemoved {
  accountId: string;
  conversationId: string;
}

export interface ConversationLoaded {
  id: number;
  accountId: string;
  conversationId: string;
  messages: Message[];
}

export interface ConversationMemberEvent {
  accountId: string;
  conversationId: string;
  memberUri: string;
  event: ConversationMemberEventType;
}

export interface MessageReceived {
  accountId: string;
  conversationId: string;
  message: Message;
}
