import Contact from './Contact.js';

class Conversation {
  constructor(id, accountId, members) {
    this.id = id;
    this.accountId = accountId;
    this.members = members || [];
    this.messages = [];
    this.infos = {};
  }

  static from(accountId, object) {
    const conversation = new Conversation(
      object.id,
      accountId,
      object.members.map((member) => {
        member.contact = Contact.from(member.contact);
        return member;
      })
    );
    conversation.messages = object.messages;
    return conversation;
  }
  static fromSingleContact(accountId, contact) {
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

  async getObject(params) {
    const members = params.memberFilter ? this.members.filter(params.memberFilter) : this.members;
    return {
      id: this.id,
      messages: this.messages,
      members: await Promise.all(
        members.map(async (member) => {
          const copiedMember = { role: member.role }; //Object.assign({}, member);
          copiedMember.contact = await member.contact.getObject();
          return copiedMember;
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

  addMessage(message) {
    if (this.messages.length === 0) this.messages.push(message);
    else if (message.id === this.messages[this.messages.length - 1].linearizedParent) {
      this.messages.push(message);
    } else if (message.linearizedParent === this.messages[0].id) {
      this.messages.unshift(message);
    } else {
      console.log("Can't insert message " + message.id);
    }
  }

  addLoadedMessages(messages) {
    messages.forEach((message) => this.addMessage(message));
  }

  getMessages() {
    return this.messages;
  }

  setInfos(infos) {
    this.infos = infos;
  }
}

export default Conversation;
