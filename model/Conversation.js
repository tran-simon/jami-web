class Conversation {
    constructor(id, members) {
        this.id = id
        this.members = members
        this.messages = []
    }

    static from(object) {
        return new Conversation(object.id, object.members)
    }

    getId() { return this.id }

    getDisplayName() {
        return this.details["Account.displayName"] || this.getDisplayUri()
    }

    getUri() { return this.details["Account.username"] }

    getRegisteredName() { return this.volatileDetails["Account.registeredName"] }

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
        return this.getRegisteredName() || this.getUri()
    }

    addMessage(message) {
        this.messages.push(message)
    }
}

module.exports = Conversation;
