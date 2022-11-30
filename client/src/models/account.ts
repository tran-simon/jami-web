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
import { AccountDetails, Devices, IAccount, VolatileDetails } from 'jami-web-common';

import { Contact } from './contact';
import { Conversation } from './conversation';

export type AccountType = 'RING' | 'SIP';

export class Account implements IAccount {
  readonly id: string;
  details: AccountDetails;
  volatileDetails: VolatileDetails;
  defaultModerators: Contact[] = [];
  devices: Devices = {};
  contacts: Contact[] = [];

  private _conversations: Record<string, Conversation> = {};

  constructor(id: string, details: AccountDetails, volatileDetails: VolatileDetails) {
    this.id = id;
    this.details = details;
    this.volatileDetails = volatileDetails;
  }

  static fromInterface(accountInterface: IAccount) {
    const account = new Account(accountInterface.id, accountInterface.details, accountInterface.volatileDetails);
    account.defaultModerators = accountInterface.defaultModerators.map(Contact.fromInterface);
    return account;
  }

  getType(): AccountType {
    return this.details['Account.type'] as AccountType;
  }

  getUri() {
    return this.details['Account.username'];
  }

  getRegisteredName() {
    return this.volatileDetails['Account.registeredName'];
  }

  isRendezVous() {
    return this.details['Account.rendezVous'] === 'true';
  }

  isPublicIn() {
    return this.details['DHT.PublicInCalls'] === 'true';
  }

  updateDetails(details: Partial<AccountDetails>) {
    this.details = { ...this.details, ...details };
  }

  getDisplayUri() {
    return this.getRegisteredName() ?? this.getUri();
  }

  getDisplayName() {
    return this.details['Account.displayName'] ?? this.getDisplayUri();
  }

  getDisplayNameNoFallback() {
    return this.details['Account.displayName'] ?? this.getRegisteredName();
  }

  get conversations() {
    return this._conversations;
  }

  addConversation(conversation: Conversation) {
    if (conversation.id === undefined) {
      throw new Error('Conversation ID cannot be undefined');
    }
    this._conversations[conversation.id] = conversation;
  }

  removeConversation(conversationId: string) {
    delete this.conversations[conversationId];
  }
}
