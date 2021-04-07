class Contact {
    constructor(uri) {
        this.uri = uri
        this.displayName = undefined
        this.registeredName = undefined
    }

    static from(object) {
        return new Contact(object.uri)
    }

    getUri() { return this.uri }

    getRegisteredName() { this.registeredName }

    getDisplayName() {
        return this.displayName || this.getRegisteredName() || this.getUri()
    }

    getObject() {
        return {
            uri: this.uri
        }
    }
}

module.exports = Contact;
