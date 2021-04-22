import Contact from './Contact.js'

class Account {
    constructor(id, details, volatileDetails) {
        this.id = id
        this.details = details
        this.volatileDetails = volatileDetails
        this.contactCache = {}
        this.contacts = {}
        this.conversations = {}
        this.lookups = []
    }

    static from(object) {
        const account = new Account(object.id, object.details, object.volatileDetails)
        if (object.defaultModerators)
            account.defaultModerators = object.defaultModerators.map(m => Contact.from(m))
        return account
    }

    update(data) {
        this.details = data.details
        this.volatileDetails = data.volatileDetails
    }

    getObject() {
        return {
            id: this.id,
            details: this.details,
            defaultModerators: this.defaultModerators ? this.defaultModerators.map(c => c.getObject()) : undefined,
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

    getDisplayNameNoFallback() {
        return this.details["Account.displayName"] || this.getRegisteredName()
    }

    getConversationIds() {
        return Object.keys(this.conversations)
    }
    getConversations() {
        return this.conversations
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

    getDefaultModerators() {
        return this.defaultModerators
    }
}

Account.TYPE_JAMI = "RING"
Account.TYPE_SIP = "SIP"

Account.BOOL_TRUE = "true"
Account.BOOL_FALSE = "false"

export default Account
