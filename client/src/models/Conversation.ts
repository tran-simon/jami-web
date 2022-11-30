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
import { Message } from 'jami-web-common';

import { Contact } from './Contact';

export interface ConversationMember {
  contact: Contact;
  role?: 'admin' | 'member' | 'invited' | 'banned' | 'left';
}

type ConversationInfos = Record<string, unknown>;

export class Conversation {
  private readonly id: string | undefined;
  private readonly accountId: string;
  private readonly members: ConversationMember[];
  private messages: Message[];
  private _infos: ConversationInfos;

  constructor(id: string | undefined, accountId: string, members?: ConversationMember[]) {
    this.id = id;
    this.accountId = accountId;
    this.members = members || [];

    this.messages = [];
    this._infos = {};
  }

  static from(accountId: string, object: any) {
    const conversation = new Conversation(
      object.id,
      accountId,
      object.members.map((member: any) => {
        member.contact = Contact.from(member.contact);
        return member;
      })
    );
    conversation.messages = object.messages;
    conversation.infos = object.infos;
    return conversation;
  }
  static fromSingleContact(accountId: string, contact: Contact) {
    return new Conversation(undefined, accountId, [{ contact }]);
  }

  getId() {
    return this.id;
  }

  getAccountId() {
    return this.accountId;
  }

  getDisplayName() {
    if (this.members.length !== 0) {
      return this.members[0].contact.getDisplayName();
    }
    return this.getDisplayUri();
  }

  getDisplayNameNoFallback() {
    if (this.members.length !== 0) {
      return this.members[0].contact.getDisplayNameNoFallback();
    }
  }

  getDisplayUri() {
    return this.getId() || this.getFirstMember().contact.getUri();
  }

  getFirstMember() {
    return this.members[0];
  }

  getMembers() {
    return this.members;
  }

  addMessage(message: Message) {
    if (this.messages.length === 0) this.messages.push(message);
    else if (message.id === this.messages[this.messages.length - 1].linearizedParent) {
      this.messages.push(message);
    } else if (message.linearizedParent === this.messages[0].id) {
      this.messages.unshift(message);
    } else {
      console.log("Can't insert message " + message.id);
    }
  }

  addLoadedMessages(messages: Message[]) {
    messages.forEach((message) => this.addMessage(message));
  }

  getMessages() {
    return this.messages;
  }

  get infos() {
    return this._infos;
  }

  set infos(infos: ConversationInfos) {
    this._infos = infos;
  }
}
