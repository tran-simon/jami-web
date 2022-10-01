/* eslint-disable no-undef */
// TODO: This hides eslint errors for this file. This should be removed once this file is cleaned up.

import { PromiseExecutor } from '../../model/util';

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

interface AuthManagerState {
  initialized: boolean;
  authenticated: boolean;
  setupComplete: boolean;
  error: boolean;
}

interface AuthManagerTask extends PromiseExecutor<Response> {
  url: string;
  init?: RequestInit;
}

interface InitData {
  loggedin?: true;
  username?: string;
  type?: string;
  setupComplete?: boolean;
}

type OnAuthChanged = (auth: AuthManagerState) => void;

class AuthManager {
  private authenticating: boolean;
  private readonly _state: AuthManagerState;
  private tasks: AuthManagerTask[];
  private onAuthChanged: OnAuthChanged | undefined;

  constructor() {
    console.log('AuthManager()');
    this.authenticating = false;

    this._state = {
      initialized: false,
      authenticated: true,
      setupComplete: true,
      error: false,
    };

    this.tasks = [];
    this.onAuthChanged = undefined;

    // @ts-ignore
    if (initData) {
      console.log('Using static initData');
      // @ts-ignore
      this.setInitData(initData);
      return;
    }
  }

  isAuthenticated() {
    return this._state.authenticated;
  }

  getState() {
    return this._state;
  }

  setInitData(data: InitData) {
    this.authenticating = false;
    this._state.initialized = true;
    if (data.username) {
      Object.assign(this._state, {
        authenticated: true,
        setupComplete: true,
        error: false,
        user: { username: data.username, type: data.type },
      });
    } else {
      Object.assign(this._state, {
        authenticated: false,
        setupComplete: data.setupComplete ?? true,
        error: false,
      });
    }
    console.log('Init ended');
    /*if (this.onAuthChanged)
            this.onAuthChanged(this._state)*/
  }

  init(cb: OnAuthChanged) {
    this.onAuthChanged = cb;
    if (this._state.initialized || this.authenticating) return;
    /*if (initData) {
            console.log("Using static initData")
            this.setInitData(initData)
            return
        }*/
    this.authenticating = true;
    fetch('/auth')
      .then(async (response) => {
        this.authenticating = false;
        this._state.initialized = true;
        if (response.status === 200) {
          this.setInitData(await response.json());
        } else if (response.status === 401) {
          this.setInitData(await response.json());
        } else {
          this._state.error = true;
          if (this.onAuthChanged) this.onAuthChanged(this._state);
        }
      })
      .catch((e) => {
        this.authenticating = false;
        console.log(e);
      });
  }

  deinit() {
    console.log('Deinit');
    this.onAuthChanged = undefined;
  }

  async setup(password: string) {
    if (this.authenticating || this._state.setupComplete) return;
    console.log('Starting setup');
    this.authenticating = true;
    const response = await fetch(`/setup`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    console.log(response);
    if (response.ok) {
      console.log('Success, going home');
      //navigate('/')
    }

    this.authenticating = false;
    this._state.setupComplete = true;
    if (this.onAuthChanged) this.onAuthChanged(this._state);
    return response.ok;
  }

  authenticate(username: string, password: string) {
    if (this.authenticating) return;
    console.log('Starting authentication');
    this.authenticating = true;
    fetch(`/auth/local?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
      method: 'POST',
    })
      .then((response) => {
        console.log(response);
        this.authenticating = false;
        this._state.authenticated = response.ok && response.status === 200;
        if (this.onAuthChanged) this.onAuthChanged(this._state);
        while (true) {
          const task = this.tasks.shift();
          if (!task) {
            break;
          }
          if (this._state.authenticated) {
            fetch(task.url, task.init)
              .then((res) => task.resolve(res))
              .catch((e) => console.log('Error executing pending task: ' + e));
          } else {
            task.reject(new Error('Authentication failed'));
          }
        }
      })
      .catch((e) => {
        this.authenticating = false;
        console.log(e);
      });
  }

  disconnect() {
    console.log('Disconnect');
    this._state.authenticated = false;
    if (this.onAuthChanged) this.onAuthChanged(this._state);
  }

  fetch(url: string, init?: RequestInit): Promise<Response> {
    console.log(`fetch ${url}`);
    if (!this._state.authenticated) {
      if (!init || !init.method || init.method === 'GET') {
        return new Promise<Response>((resolve, reject) => this.tasks.push({ url, init, resolve, reject }));
      } else {
        return new Promise<Response>((resolve, reject) => reject('Not authenticated'));
      }
    }
    return fetch(url, init).then((response) => {
      if (response.status === 401) {
        this.disconnect();
        return this.fetch(url, init);
      }
      return response;
    });
  }
}

export default new AuthManager();
