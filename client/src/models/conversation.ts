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
import { ConversationInfos, IConversation, IConversationMember, Message } from 'jami-web-common';

import { Contact } from './contact';

export interface ConversationMember extends IConversationMember {
  contact: Contact;
}

export class Conversation implements IConversation {
  readonly id: string;
  members: ConversationMember[];
  messages: Message[] = [];
  infos: ConversationInfos = {};

  constructor(id: string, members?: ConversationMember[]) {
    this.id = id;
    this.members = members ?? [];
  }

  static fromInterface(conversationInterface: IConversation) {
    const conversation = new Conversation(
      conversationInterface.id,
      conversationInterface.members.map((member) => {
        const contact = Contact.fromInterface(member.contact);
        return { contact } as ConversationMember;
      })
    );

    conversation.messages = conversationInterface.messages;
    conversation.infos = conversationInterface.infos;

    return conversation;
  }

  static fromSingleContact(contact: Contact) {
    return new Conversation('', [{ contact } as ConversationMember]);
  }

  getDisplayUri() {
    return this.id ?? this.getFirstMember().contact.uri;
  }

  getDisplayName() {
    if (this.members.length !== 0) {
      return this.getFirstMember().contact.registeredName;
    }
    return this.getDisplayUri();
  }

  getDisplayNameNoFallback() {
    if (this.members.length !== 0) {
      return this.getFirstMember().contact.registeredName;
    }
  }

  getFirstMember() {
    return this.members[0];
  }

  addMessage(message: Message) {
    if (this.messages.length === 0) {
      this.messages.push(message);
    } else if (message.id === this.messages[this.messages.length - 1].linearizedParent) {
      this.messages.push(message);
    } else if (message.linearizedParent === this.messages[0].id) {
      this.messages.unshift(message);
    } else {
      console.log('Could not insert message', message.id);
    }
  }

  addMessages(messages: Message[]) {
    for (const message of messages) {
      this.addMessage(message);
    }
  }
}
