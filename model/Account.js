const Contact = require('./Contact')

class Account {
    constructor(id, details, volatileDetails) {
        this.id = id
        this.details = details
        this.volatileDetails = volatileDetails
        this.contactCache = {}
        this.contacts = {}
        this.conversations = {}
    }

    static from(object) {
        return new Account(object.id, object.details, object.volatileDetails)
    }

    update(data) {
        this.details = data.details
        this.volatileDetails = data.volatileDetails
    }

    getObject() {
        return {
            id: this.id,
            details: this.details,
            volatileDetails: this.volatileDetails
        }
    }

    getId() { return this.id }

    getType() { return this.details["Account.type"] }

    getUri() { return this.details["Account.username"] }

    getRegisteredName() { return this.volatileDetails["Account.registeredName"] }

    isRendezVous() { return this.details["Account.rendezVous"] === Account.BOOL_TRUE }

    isPublicIn() { return this.details["DHT.PublicInCalls"] === Account.BOOL_TRUE }

    getSummary() {
        return this.getObject()
    }

    getDisplayName() {
        return this.details["Account.displayName"] || this.getDisplayUri()
    }

    getDisplayUri() {
        return this.getRegisteredName() || this.getUri()
    }

    getConversationIds() {
        return Object.keys(this.conversations)
    }

    getConversation(conversationId) {
        return this.conversations[conversationId]
    }

    addConversation(conversation) {
        this.conversations[conversation.getId()] = conversation
    }

    removeConversation(conversationId) {
        delete this.conversations[conversationId]
    }

    getContactFromCache(uri) {
        let contact = this.contactCache[uri]
        if (!contact) {
            contact = new Contact(uri)
            this.contactCache[uri] = contact
        }
        return contact
    }

    getContacts() {
        return this.contacts
    }
}

Account.TYPE_JAMI = "RING"
Account.TYPE_SIP = "SIP"

Account.BOOL_TRUE = "true"
Account.BOOL_FALSE = "false"

module.exports = Account
