/*
 *  Copyright (c) 2017-2021 Savoir-faire Linux Inc.
 *
 *  Author: Adrien Béraud <adrien.beraud@savoirfairelinux.com>
 *  Author: Asad Salman <me@asad.co>
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
"use strict"

import Account from './model/Account.js'
import Conversation from './model/Conversation.js'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

class JamiDaemon {
    constructor(onMessage) {
        this.accounts = []
        this.dring = require("./dring.node")
        this.dring.init({
            "AccountsChanged": () => {
                console.log("AccountsChanged")
                const newAccounts = []
                JamiDaemon.vectToJs(this.dring.getAccountList()).forEach(accountId => {
                    for (const account in this.accounts) {
                        if (account.id === accountId) {
                            newAccounts.push(account)
                            return
                        }
                    }
                    newAccounts.push(new Account(accountId,
                        JamiDaemon.mapToJs(this.dring.getAccountDetails(accountId)),
                        JamiDaemon.mapToJs(this.dring.getVolatileAccountDetails(accountId))
                    ))
                })
                this.accounts = newAccounts
            },
            "AccountDetailsChanged": (accountId, details) => {
                console.log(`AccountDetailsChanged ${accountId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                account.details = details
            },
            "VolatileDetailsChanged": (accountId, details) => {
                console.log(`VolatileDetailsChanged ${accountId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                account.volatileDetails = details
            },
            "IncomingAccountMessage": (accountId, from, message) => {
                console.log(`Received message: ${accountId} ${from} ${message["text/plain"]}`)
/*
                if (parser.validate(message["text/plain"]) === true) {
                    console.log(message["text/plain"])
                } else {

                    user = connectedUsers[accountId]
                    console.log(user.socketId)
                    io.to(user.socketId).emit('receivedMessage', message["text/plain"])
                    //io.emit('receivedMessage', message["text/plain"])
                }*/
            },
            "RegistrationStateChanged": (accountId, state, /*int*/ code, detail) => {
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                account.registrationState = state
                console.log("RegistrationStateChanged: " + accountId + " " + state + " " + code + " " + detail)
                if (state === "REGISTERED") {
                    /*if (tempAccounts[accountId]) {

                        const ctx = tempAccounts[accountId]
                        ctx.newUser.accountId = accountId
                        ctx.newUser.jamiId = jami.dring.getAccountDetails(accountId).get("Account.username")
                        //connectedUsers[accountId] = ctx.newUser
                        ctx.done(null, ctx.newUser)
                        delete tempAccounts[accountId]
                    }*/
                } else if (state === "ERROR_AUTH") {
                    //done(null, false)
                    //remove account
                }
            },
            "RegisteredNameFound": (accountId, state, address, name) => {
                console.log(`RegisteredNameFound: ${accountId} ${state} ${address} ${name}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                if (state == 0) {
                    const contact = account.getContactFromCache(address)
                    if (!contact.isRegisteredNameResolved())
                        contact.setRegisteredName(name)
                }
                let index = account.lookups.length - 1
                while (index >= 0) {
                    const lookup = account.lookups[index]
                    if ((lookup.address && lookup.address === address) || (lookup.name && lookup.name === name)) {
                        lookup.resolve({address, name, state})
                        account.lookups.splice(index, 1)
                    }
                    index -= 1
                }
            },
            "ConversationReady": (accountId, conversationId) => {
                console.log(`conversationReady: ${accountId} ${conversationId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                let conversation = account.getConversation(conversationId)
                if (!conversation) {
                    const members = JamiDaemon.vectMapToJs(this.dring.getConversationMembers(accountId, conversationId))
                    members.forEach(member => member.contact = account.getContactFromCache(member.uri))
                    conversation = new Conversation(conversationId, accountId, members)
                    account.addConversation(conversation)
                }
            },
            "ConversationRemoved": (accountId, conversationId) => {
                console.log(`conversationRemoved: ${accountId} ${conversationId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                account.removeConversation(conversationId)
            },
            "ConversationLoaded": (id, accountId, conversationId, messages) => {
                console.log(`conversationLoaded: ${accountId} ${conversationId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                const conversation = account.getConversation(conversationId)
                if (conversation) {
                    conversation.addLoadedMessages(messages)
                    const request = conversation.requests[id]
                    if (request) {
                        request.resolve(messages)
                    }
                }
            },
            "MessageReceived": (accountId, conversationId, message) => {
                console.log(`messageReceived: ${accountId} ${conversationId}`)
                console.log(message)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
                const conversation = account.getConversation(conversationId)
                if (conversation) {
                    conversation.addMessage(message)
                    if (onMessage)
                        onMessage(account, conversation, message)
                }
            },
            "ConversationRequestReceived": (accountId, conversationId, request) => {
                console.log(`conversationRequestReceived: ${accountId} ${conversationId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
            },
            "ConversationMemberEvent": (accountId, conversationId, member, event) => {
                console.log(`conversationMemberEvent: ${accountId} ${conversationId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
            },
            "OnConversationError": (accountId, conversationId, code, what) => {
                console.log(`onConversationError: ${accountId} ${conversationId}`)
                const account = this.getAccount(accountId)
                if (!account) {
                    console.log(`Unknown account ${accountId}`)
                    return
                }
            }
        })

        JamiDaemon.vectToJs(this.dring.getAccountList()).forEach(accountId => {
            const account = new Account(accountId,
                JamiDaemon.mapToJs(this.dring.getAccountDetails(accountId)),
                JamiDaemon.mapToJs(this.dring.getVolatileAccountDetails(accountId))
            )
            JamiDaemon.vectToJs(this.dring.getConversations(accountId)).forEach(conversationId => {
                const members = JamiDaemon.vectMapToJs(this.dring.getConversationMembers(accountId, conversationId))
                members.forEach(member => {
                    member.contact = account.getContactFromCache(member.uri)
                    if (!member.contact.isRegisteredNameResolved()) {
                        if (!member.uri) return
                        console.log(`lookupAddress ${accountId} ${member.uri}`)
                        member.contact.setRegisteredName(new Promise((resolve, reject) =>
                            account.lookups.push({address: member.uri, resolve, reject})
                        ).then(result => {
                            if (result.state == 0)
                                return result.name
                            else if (result.state == 1)
                                return undefined
                            else
                                return null
                        }))
                        this.dring.lookupAddress(accountId, "", member.uri)
                    }
                })
                const conversation = new Conversation(conversationId, accountId, members)
                account.addConversation(conversation)
            })
            this.accounts.push(account)
        })
    }

    addAccount(account) {
        const params = accountDetailsToNative(account)
        params.set("Account.type", "RING")
        return this.dring.addAccount(params)
    }
    getAccount(accountId) {
        for (let i = 0; i < this.accounts.length; i++) {
            const account = this.accounts[i]
            if (account.getId() === accountId)
                return account
        }
        return undefined
    }
    getAccountList() {
        return this.accounts
    }
    getConversation(accountId, conversationId) {
        const account = this.getAccount(accountId)
        if (account)
            return account.getConversation(conversationId)
        return null
    }
    /*getAccountDetails(accountId) {
        return this.mapToJs(this.dring.getAccountDetails(accountId))
    }*/
    setAccountDetails(accountId, details) {
        this.dring.setAccountDetails(accountId, mapToNative(details))
    }
    getAudioOutputDeviceList() {
        return JamiDaemon.vectToJs(this.dring.getAudioOutputDeviceList())
    }
    getVolume(deviceName) {
        return this.dring.getVolume(deviceName)
    }
    setVolume(deviceName, volume) {
        return this.dring.setVolume(deviceName, volume)
    }

    lookupName(accountId, name) {
        const p = new Promise((resolve, reject) => {
            const account = this.getAccount(accountId)
            if (!account) {
                reject(new Error("Can't find account"))
            } else {
                account.lookups.push({name, resolve, reject})
            }
        })
        this.dring.lookupName(accountId, "", name)
        return p
    }

    lookupAddress(accountId, address) {
        console.log(`lookupAddress ${accountId} ${address}`)
        const p = new Promise((resolve, reject) => {
            const account = this.getAccount(accountId)
            if (!account) {
                reject(new Error("Can't find account"))
            } else {
                account.lookups.push({address, resolve, reject})
            }
        })
        this.dring.lookupAddress(accountId, "", address)
        return p
    }

    stop() {
        this.dring.fini()
    }

    addContact(accountId, contactId) {
        this.dring.addContact(accountId, contactId)
        const details = JamiDaemon.mapToJs(this.dring.getContactDetails(accountId, contactId))
        if (details.conversationId) {
            const account = this.getAccount(accountId)
            if (account) {
                let conversation = account.getConversation(details.conversationId)
                if (!conversation) {
                    const members = JamiDaemon.vectMapToJs(this.dring.getConversationMembers(accountId, details.conversationId))
                    members.forEach(member => member.contact = account.getContactFromCache(member.uri))
                    conversation = new Conversation(details.conversationId, accountId, members)
                    account.addConversation(conversation)
                }
            }
        }
        return details
    }

    getDefaultModerators(accountId) {
        const account = this.getAccount(accountId)
        if (!account) {
            console.log(`Unknown account ${accountId}`)
            return {}
        }
        return JamiDaemon.vectToJs(this.dring.getDefaultModerators(accountId))
            .map(contactId => account.getContactFromCache(contactId))
    }

    addDefaultModerator(accountId, uri) {
        this.dring.setDefaultModerator(accountId, uri, true)
    }

    removeDefaultModerator(accountId, uri) {
        this.dring.setDefaultModerator(accountId, uri, false)
    }

    sendMessage(accountId, conversationId, message) {
        this.dring.sendMessage(accountId, conversationId, message, "")
    }

    loadMessages(accountId, conversationId, fromMessage) {
        const account = this.getAccount(accountId)
        if (!account)
            throw new Error('Unknown account')
        const conversation = account.getConversation(conversationId)
        if (!conversation)
            throw new Error(`Unknown conversation ${conversationId}`)

        return new Promise((resolve, reject) => {
            if (!conversation.requests)
                conversation.requests = {}
            const requestId = this.dring.loadConversationMessages(accountId, conversationId, fromMessage || "", 32)
            conversation.requests[requestId] = {resolve, reject}
        })
    }

    boolToStr(bool) {
        return bool ? "true" : "false"
    }

    accountDetailsToNative(account) {
        const params = new this.dring.StringMap()
        if (account.managerUri)
            params.set("Account.managerUri", account.managerUri)
        if (account.managerUsername)
            params.set("Account.managerUsername", account.managerUsername)
        if (account.archivePassword) {
            params.set("Account.archivePassword", account.archivePassword)
        } else {
            console.log("archivePassword required")
            return
        }
        if (account.alias)
            params.set("Account.alias", account.alias)
        if (account.displayName)
            params.set("Account.displayName", account.displayName)
        if (account.enable)
            params.set("Account.enable", this.boolToStr(account.enable))
        if (account.autoAnswer)
            params.set("Account.autoAnswer", this.boolToStr(account.autoAnswer))
        if (account.ringtonePath)
            params.set("Account.ringtonePath", account.ringtonePath)
        if (account.ringtoneEnabled)
            params.set("Account.ringtoneEnabled", this.boolToStr(account.ringtoneEnabled))
        if (account.videoEnabled)
            params.set("Account.videoEnabled", this.boolToStr(account.videoEnabled))
        if (account.useragent) {
            params.set("Account.useragent", account.useragent)
            params.set("Account.hasCustomUserAgent", "TRUE")
        } else {
            params.set("Account.hasCustomUserAgent", "FALSE")
        }
        if (account.audioPortMin)
            params.set("Account.audioPortMin", account.audioPortMin)
        if (account.audioPortMax)
            params.set("Account.audioPortMax", account.audioPortMax)
        if (account.videoPortMin)
            params.set("Account.videoPortMin", account.videoPortMin)
        if (account.videoPortMax)
            params.set("Account.videoPortMax", account.videoPortMax)
        if (account.localInterface)
            params.set("Account.localInterface", account.localInterface)
        if (account.publishedSameAsLocal)
            params.set("Account.publishedSameAsLocal", this.boolToStr(account.publishedSameAsLocal))
        if (account.localPort)
            params.set("Account.localPort", account.localPort)
        if (account.publishedPort)
            params.set("Account.publishedPort", account.publishedPort)
        if (account.publishedAddress)
            params.set("Account.publishedAddress", account.publishedAddress)
        if (account.upnpEnabled)
            params.set("Account.upnpEnabled", this.boolToStr(account.upnpEnabled))
        return params
    }
    static vectToJs(vect) {
        const len = vect.size()
        const outputArr = new Array(len)
        for (let i = 0; i < len; i++)
            outputArr[i] = vect.get(i)
        return outputArr
    }
    static mapToJs(m) {
        const outputObj = {}
        JamiDaemon.vectToJs(m.keys())
            .forEach(k => outputObj[k] = m.get(k))
        return outputObj
    }
    static vectMapToJs(vectMap) {
        const len = vectMap.size()
        const outputArr = new Array(len)
        for (let i = 0; i < len; i++)
            outputArr[i] = JamiDaemon.mapToJs(vectMap.get(i))
        return outputArr
    }

    mapToNative(map){
        const ret = new this.dring.StringMap()
        map.forEach((value, key) => ret.set(key, value))
        return ret
    }
}

export default JamiDaemon
