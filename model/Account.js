class Account {
    constructor(id, details, volatileDetails) {
        this.id = id
        this.details = details
        this.volatileDetails = volatileDetails
    }

    static from(object) {
        return new Account(object.id, object.details, object.volatileDetails)
    }

    update(data) {
        this.details = data.details
        this.volatileDetails = data.volatileDetails
    }

    getId() { return this.id }

    getType() { return this.details["Account.type"] }

    getUri() { return this.details["Account.username"] }

    getRegisteredName() { return this.volatileDetails["Account.registeredName"] }

    isRendezVous() { return this.details["Account.rendezVous"] === Account.BOOL_TRUE }
    isPublicIn() { return this.details["DHT.PublicInCalls"] === Account.BOOL_TRUE }

    getObject() {
        return {
            id: this.id,
            details: this.details,
            volatileDetails: this.volatileDetails
        }
    }

    getSummary() {
        return this.getObject()
    }

    getDisplayName() {
        return this.details["Account.displayName"] || this.getDisplayUri()
    }

    getDisplayUri() {
        return this.getRegisteredName() || this.getUri()
    }
}

Account.TYPE_JAMI = "RING"
Account.TYPE_SIP = "SIP"

Account.BOOL_TRUE = "true"
Account.BOOL_FALSE = "false"

module.exports = Account;
