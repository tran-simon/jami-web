import { Socket } from 'socket.io';

import Contact from './Contact';
import { PromiseExecutor, Session } from './util';

export interface ConversationMember {
  contact: Contact;
  role?: 'admin' | 'member' | 'invited' | 'banned' | 'left';
}

type ConversationInfos = Record<string, unknown>;

export type Message = Record<string, string>;
type ConversationRequest = PromiseExecutor<Message[]>;

type ConversationListeners = Record<
  string,
  {
    socket: Socket;
    session: Session;
  }
>;

class Conversation {
  private readonly id: string | undefined;
  private readonly accountId: string;
  private readonly members: ConversationMember[];
  private messages: Message[];
  private _infos: ConversationInfos;
  private _requests: Record<string, ConversationRequest>;
  private _listeners: ConversationListeners;

  constructor(id: string | undefined, accountId: string, members?: ConversationMember[]) {
    this.id = id;
    this.accountId = accountId;
    this.members = members || [];

    this.messages = [];
    this._infos = {};
    this._requests = {};
    this._listeners = {};
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

  async getObject(params?: {
    memberFilter: (value: ConversationMember, index: number, array: ConversationMember[]) => boolean;
  }) {
    const members = params?.memberFilter ? this.members.filter(params.memberFilter) : this.members;
    return {
      id: this.id,
      messages: this.messages,
      members: await Promise.all(
        members.map(async (member) => {
          //Object.assign({}, member);
          return {
            role: member.role,
            contact: await member.contact.getObject(),
          };
        })
      ),
    };
  }

  getSummary() {
    return this.getObject();
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

  set infos(infos: ConversationInfos) {
    this._infos = infos;
  }

  get requests(): Record<string, ConversationRequest> {
    return this._requests;
  }

  set requests(value: Record<string, ConversationRequest>) {
    this._requests = value;
  }

  get listeners(): ConversationListeners {
    return this._listeners;
  }

  set listeners(listeners: ConversationListeners) {
    this._listeners = listeners;
  }
}

export default Conversation;
