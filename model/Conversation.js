class Conversation {
    constructor(id, members) {
        this.id = id
        this.members = members || []
        this.messages = []
    }

    static from(object) {
        return new Conversation(object.id, object.members)
    }

    getId() { return this.id }

    getDisplayName() {
        if (this.members.length !== 0) {
            return this.members[0].getDisplayName()
        }
        return this.getDisplayUri()
    }

    getObject() {
        return {
            id: this.id,
            members: this.members
        }
    }

    getSummary() {
        return this.getObject()
    }

    getDisplayUri() {
        return this.getId()
    }

    addMessage(message) {
        this.messages.push(message)
    }
}

module.exports = Conversation;
