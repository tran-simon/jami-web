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

import { Contact } from './Contact.js';
import { Conversation } from './Conversation.js';

export class Account {
  private readonly id: string;
  private _details: AccountDetails;
  private _volatileDetails: VolatileDetails;
  private _contacts: Contact[];
  private readonly conversations: Record<string, Conversation>;
  private defaultModerators: Contact[];
  private devices: Record<string, string>;

  static readonly TYPE_JAMI: string = 'RING';
  static readonly TYPE_SIP: string = 'SIP';

  constructor(id: string, details: AccountDetails, volatileDetails: VolatileDetails) {
    this.id = id;
    this._details = details || {};
    this._volatileDetails = volatileDetails || {};
    this._contacts = [];
    this.conversations = {};
    this.defaultModerators = [];
    this.devices = {};
  }

  static from(object: any) {
    const account = new Account(object.id, object.details, object.volatileDetails);
    if (object.defaultModerators) account.defaultModerators = object.defaultModerators.map((m: any) => Contact.from(m));
    return account;
  }

  getId() {
    return this.id;
  }

  getType() {
    return this._details['Account.type'];
  }

  getUri() {
    return this._details['Account.username'];
  }

  getRegisteredName() {
    return this._volatileDetails['Account.registeredName'];
  }

  isRendezVous() {
    return this._details['Account.rendezVous'] === 'true';
  }

  isPublicIn() {
    return this._details['DHT.PublicInCalls'] === 'true';
  }

  setDetail(detail: keyof AccountDetails, value: string) {
    this._details[detail] = value;
  }

  updateDetails(details: Partial<AccountDetails>) {
    return Object.assign(this._details, details);
  }

  getDetails() {
    return this._details;
  }

  getDisplayName() {
    return this._details['Account.displayName'] || this.getDisplayUri();
  }

  getDisplayUri() {
    return this.getRegisteredName() || this.getUri();
  }

  getDisplayNameNoFallback() {
    return this._details['Account.displayName'] || this.getRegisteredName();
  }

  getConversationIds() {
    return Object.keys(this.conversations);
  }

  getConversations() {
    return this.conversations;
  }

  getConversation(conversationId: string) {
    return this.conversations[conversationId];
  }

  addConversation(conversation: Conversation) {
    const conversationId = conversation.getId();
    if (conversationId != null) {
      this.conversations[conversationId] = conversation;
    } else {
      throw new Error('Conversation ID cannot be undefined');
    }
  }

  removeConversation(conversationId: string) {
    delete this.conversations[conversationId];
  }

  getContacts() {
    return this._contacts;
  }

  set contacts(contacts: Contact[]) {
    this._contacts = contacts;
  }

  getDefaultModerators() {
    return this.defaultModerators;
  }

  set details(value: AccountDetails) {
    this._details = value;
  }

  set volatileDetails(value: VolatileDetails) {
    this._volatileDetails = value;
  }

  setDevices(devices: Record<string, string>) {
    this.devices = { ...devices };
  }

  getDevices() {
    return this.devices;
  }
}
