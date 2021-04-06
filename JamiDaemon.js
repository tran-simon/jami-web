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
const Account = require('./model/Account')

"use strict";
class JamiDaemon {
    constructor() {
        this.accounts = []
        this.dring = require("./dring.node")
        this.dring.init({
            "AccountsChanged": () => {
                console.log("AccountsChanged")
                const newAccounts = []
                this.stringVectToArr(this.dring.getAccountList()).forEach(accountId => {
                    for (const account in this.accounts) {
                        if (account.id === accountId) {
                            newAccounts.push(account)
                            return
                        }
                    }
                    newAccounts.push(new Account(accountId,
                        this.mapToJs(this.dring.getAccountDetails(accountId))
                        //this.mapToJs(this.dring.getVolatileDetails(accountId)),
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
                    console.log(message["text/plain"]);
                } else {

                    user = connectedUsers[accountId];
                    console.log(user.socketId)
                    io.to(user.socketId).emit('receivedMessage', message["text/plain"]);
                    //io.emit('receivedMessage', message["text/plain"]);
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
                console.log("RegistrationStateChanged: " + accountId + " " + state + " " + address + " " + name)
            }
        })
        this.stringVectToArr(this.dring.getAccountList()).forEach(accountId => {
            this.accounts.push(new Account(accountId,
                this.mapToJs(this.dring.getAccountDetails(accountId)),
                this.mapToJs(this.dring.getVolatileAccountDetails(accountId))
            ))
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
    /*getAccountDetails(accountId) {
        return this.mapToJs(this.dring.getAccountDetails(accountId));
    }*/
    setAccountDetails(accountId, details) {
        this.dring.setAccountDetails(accountId, mapToNative(details));
    }
    getAudioOutputDeviceList() {
        return this.stringVectToArr(this.dring.getAudioOutputDeviceList());
    }
    getVolume(deviceName) {
        return this.dring.getVolume(deviceName);
    }
    setVolume(deviceName, volume) {
        return this.dring.setVolume(deviceName, volume);
    }

    stop() {
        this.dring.fini();
    }

// private

    boolToStr(bool) {
        return bool ? "TRUE" : "FALSE";
    }

    accountDetailsToNative(account) {
        const params = new this.dring.StringMap();
        if (account.managerUri)
            params.set("Account.managerUri", account.managerUri);
        if (account.managerUsername)
            params.set("Account.managerUsername", account.managerUsername);
        if (account.archivePassword) {
            params.set("Account.archivePassword", account.archivePassword);
        } else {
            console.log("archivePassword required");
            return;
        }
        if (account.alias)
            params.set("Account.alias", account.alias);
        if (account.displayName)
            params.set("Account.displayName", account.displayName);
        if (account.enable)
            params.set("Account.enable", this.boolToStr(account.enable));
        if (account.autoAnswer)
            params.set("Account.autoAnswer", this.boolToStr(account.autoAnswer));
        if (account.ringtonePath)
            params.set("Account.ringtonePath", account.ringtonePath);
        if (account.ringtoneEnabled)
            params.set("Account.ringtoneEnabled", this.boolToStr(account.ringtoneEnabled));
        if (account.videoEnabled)
            params.set("Account.videoEnabled", this.boolToStr(account.videoEnabled));
        if (account.useragent) {
            params.set("Account.useragent", account.useragent);
            params.set("Account.hasCustomUserAgent", "TRUE");
        } else {
            params.set("Account.hasCustomUserAgent", "FALSE");
        }
        if (account.audioPortMin)
            params.set("Account.audioPortMin", account.audioPortMin);
        if (account.audioPortMax)
            params.set("Account.audioPortMax", account.audioPortMax);
        if (account.videoPortMin)
            params.set("Account.videoPortMin", account.videoPortMin);
        if (account.videoPortMax)
            params.set("Account.videoPortMax", account.videoPortMax);
        if (account.localInterface)
            params.set("Account.localInterface", account.localInterface);
        if (account.publishedSameAsLocal)
            params.set("Account.publishedSameAsLocal", this.boolToStr(account.publishedSameAsLocal));
        if (account.localPort)
            params.set("Account.localPort", account.localPort);
        if (account.publishedPort)
            params.set("Account.publishedPort", account.publishedPort);
        if (account.publishedAddress)
            params.set("Account.publishedAddress", account.publishedAddress);
        if (account.upnpEnabled)
            params.set("Account.upnpEnabled", this.boolToStr(account.upnpEnabled));
        return params;
    }
    stringVectToArr(stringvect) {
        const outputArr = [];
        for (let i = 0; i < stringvect.size(); i++)
            outputArr.push(stringvect.get(i));
        return outputArr;
    }
    mapToJs(m) {
        const outputObj = {};
        this.stringVectToArr(m.keys())
            .forEach(k => outputObj[k] = m.get(k));
        return outputObj;
    }
    mapToNative(map){
        const ret = new this.dring.StringMap();
        map.forEach((value, key) => ret.set(key, value));
        return ret;
    }

}

module.exports = JamiDaemon;
