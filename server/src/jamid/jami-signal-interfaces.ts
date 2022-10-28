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
import { AccountDetails, VolatileDetails } from 'jami-web-common';

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
  state: string;
  code: number;
  details: string;
}

export interface NameRegistrationEnded {
  accountId: string;
  state: number;
  username: string;
}

export interface RegisteredNameFound {
  accountId: string;
  state: number;
  address: string;
  username: string;
}

export interface KnownDevicesChanged {
  accountId: string;
  devices: Record<string, string>;
}

export interface IncomingAccountMessage {
  accountId: string;
  from: string;
  message: Record<string, string>;
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
  messages: Record<string, string>[];
}

export interface MessageReceived {
  accountId: string;
  conversationId: string;
  message: Record<string, string>;
}
