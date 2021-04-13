const Contact = require('./Contact')

class Conversation {
    constructor(id, accountId, members) {
        this.id = id
        this.accountId = accountId
        this.members = members || []
        this.messages = []
    }

    static from(accountId, object) {
        return new Conversation(object.id, accountId, object.members.map(member => {
            member.contact = Contact.from(member.contact)
            return member
        }))
    }
    static fromSingleContact(accountId, contact) {
        return new Conversation(undefined, accountId, [{contact}])
    }

    getId() { return this.id }

    getAccountId() { return this.accountId }

    getDisplayName() {
        if (this.members.length !== 0) {
            return this.members[0].contact.getDisplayName()
        }
        return this.getDisplayUri()
    }

    getObject(params) {
        const members = params.memberFilter ? this.members.filter(params.memberFilter) : this.members
        return {
            id: this.id,
            members: members.map(member => {
                const copiedMember = { role: member.role }//Object.assign({}, member);
                copiedMember.contact = member.contact.getObject()
                return copiedMember
            })
        }
    }

    getSummary() {
        return this.getObject()
    }

    getDisplayUri() {
        return this.getId() || this.getFirstMember().contact.getUri()
    }

    getFirstMember() {
        return this.members[0]
    }

    getMembers() {
        return this.members
    }

    addMessage(message) {
        this.messages.push(message)
    }
}

module.exports = Conversation;
