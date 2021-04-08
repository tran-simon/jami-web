/*
 *  Copyright (c) 2017-2021 Savoir-faire Linux Inc.
 *
 *  Author: Adrien Béraud <adrien.beraud@savoirfairelinux.com>
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

//import cookie from 'cookie';

class AuthManager {
    constructor() {
        console.log("AuthManager()")
        this.authenticated = true//'connect.sid' in cookie.parse(document.cookie)
        this.authenticating = false
        this.tasks = []
        this.onAuthChanged = undefined
    }
    setOnAuthChanged(onAuthChanged) {
        this.onAuthChanged = onAuthChanged
    }

    isAuthenticated() {
        return this.authenticated
    }

    authenticate() {
        if (this.authenticating)
            return
        console.log("Starting authentication")
        this.authenticating = true
        fetch('/api/localLogin?username=local&password=local', { method:"POST" })
            .then(response => {
                console.log(response)
                this.authenticating = false
                this.authenticated = response.ok && response.status === 200
                if (this.onAuthChanged)
                    this.onAuthChanged(this.authenticated)
                while (this.tasks.length !== 0) {
                    const task = this.tasks.shift()
                    if (this.authenticated)
                        fetch(task.url, task.init).then(res => task.resolve(res))
                    else
                        task.reject(new Error("Authentication failed"))
                }
            })
    }

    disconnect() {
        console.log("Disconnect")
        this.authenticated = false
        if (this.onAuthChanged)
            this.onAuthChanged(this.authenticated)
    }

    fetch(url, init) {
        console.log(`get ${url}`)
        if (!this.authenticated) {
            return new Promise((resolve, reject) => this.tasks.push({url, init, resolve, reject}))
        }
        return fetch(url, init)
            .then(response => {
                console.log(`Got status ${response.status}`)
                if (response.status === 401) {
                    this.disconnect()
                    return this.fetch(url, init)
                }
                return response
            })
    }
}

export default new AuthManager()