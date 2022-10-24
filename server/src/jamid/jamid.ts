/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import { AccountDetails, VolatileDetails } from 'jami-web-common';
import log from 'loglevel';
import { filter, firstValueFrom, Subject } from 'rxjs';
import { Service } from 'typedi';

import { JamiSignal } from './jami-signal.js';
import {
  NameRegistrationEnded,
  RegisteredNameFound,
  RegistrationStateChanged,
  VolatileDetailsChanged,
} from './jami-signal-interfaces.js';
import { JamiSwig, StringMap, stringMapToRecord, stringVectToArray } from './jami-swig.js';
import { require } from './utils.js';

@Service()
export class Jamid {
  private readonly jamiSwig: JamiSwig;
  private readonly usernamesToAccountIds: Map<string, string>;
  private readonly events;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.jamiSwig = require('../../jamid.node') as JamiSwig;

    const handlers: Record<string, unknown> = {};
    const handler = (sig: string) => {
      return (...args: unknown[]) => log.warn('Unhandled', sig, args);
    };
    Object.keys(JamiSignal).forEach((sig) => (handlers[sig] = handler(sig)));

    const onVolatileDetailsChanged = new Subject<VolatileDetailsChanged>();
    handlers.VolatileDetailsChanged = (accountId: string, details: Record<string, string>) =>
      onVolatileDetailsChanged.next({ accountId, details: new Map(Object.entries(details)) });

    const onRegistrationStateChanged = new Subject<RegistrationStateChanged>();
    handlers.RegistrationStateChanged = (accountId: string, state: string, code: number, details: string) =>
      onRegistrationStateChanged.next({ accountId, state, code, details });

    const onNameRegistrationEnded = new Subject<NameRegistrationEnded>();
    handlers.NameRegistrationEnded = (accountId: string, state: number, username: string) =>
      onNameRegistrationEnded.next({ accountId, state, username });

    const onRegisteredNameFound = new Subject<RegisteredNameFound>();
    handlers.RegisteredNameFound = (accountId: string, state: number, address: string, username: string) =>
      onRegisteredNameFound.next({ accountId, state, address, username });

    this.events = {
      onVolatileDetailsChanged: onVolatileDetailsChanged.asObservable(),
      onRegistrationStateChanged: onRegistrationStateChanged.asObservable(),
      onNameRegistrationEnded: onNameRegistrationEnded.asObservable(),
      onRegisteredNameFound: onRegisteredNameFound.asObservable(),
    };

    this.events.onVolatileDetailsChanged.subscribe(({ accountId, details }) => {
      log.debug('[1] Received onVolatileDetailsChanged with', { accountId, details });
      // Keep map of usernames to account IDs as Jamid cannot do this by itself (AFAIK)
      const username = details.get('Account.registeredName');
      if (username) {
        this.usernamesToAccountIds.set(username, accountId);
      }
    });
    this.events.onRegistrationStateChanged.subscribe((ctx) =>
      log.debug('[1] Received onRegistrationStateChanged with', ctx)
    );
    this.events.onNameRegistrationEnded.subscribe((ctx) => log.debug('[1] Received onNameRegistrationEnded with', ctx));
    this.events.onRegisteredNameFound.subscribe((ctx) => log.debug('[1] Received onRegisteredNameFound with', ctx));

    this.usernamesToAccountIds = new Map<string, string>();

    // 1. You cannot change event handlers after init
    // 2. You cannot specify multiple handlers for the same event
    // 3. You cannot specify a default handler
    // So we rely on Subject() instead of Observable()
    // Also, handlers receive multiple argument instead of tuple or object!
    this.jamiSwig.init(handlers);
  }

  stop() {
    this.jamiSwig.fini();
  }

  getVolatileAccountDetails(accountId: string): VolatileDetails {
    return stringMapToRecord(this.jamiSwig.getVolatileAccountDetails(accountId)) as unknown as VolatileDetails;
  }

  getAccountDetails(accountId: string): AccountDetails {
    return stringMapToRecord(this.jamiSwig.getAccountDetails(accountId)) as unknown as AccountDetails;
  }

  setAccountDetails(accountId: string, accountDetails: AccountDetails) {
    const accountDetailsStringMap: StringMap = new (this.jamiSwig as any).StringMap();
    for (const [key, value] of Object.entries(accountDetails)) {
      accountDetailsStringMap.set(key, value);
    }
    this.jamiSwig.setAccountDetails(accountId, accountDetailsStringMap);
  }

  async addAccount(details: Map<string, string | number | boolean>) {
    // TODO: Add proper typing directly into JamiSwig
    const detailsStringMap: StringMap = new (this.jamiSwig as any).StringMap();

    detailsStringMap.set('Account.type', 'RING');
    for (const [key, value] of details.entries()) {
      detailsStringMap.set('Account.' + key, value.toString());
    }

    const accountId = this.jamiSwig.addAccount(detailsStringMap);
    return firstValueFrom(
      this.events.onRegistrationStateChanged.pipe(
        filter(({ accountId: addedAccountId }) => addedAccountId === accountId),
        // TODO: is it the only state?
        filter(({ state }) => state === 'REGISTERED')
      )
    );
  }

  removeAccount(accountId: string) {
    this.jamiSwig.removeAccount(accountId);
  }

  getAccountList(): string[] {
    return stringVectToArray(this.jamiSwig.getAccountList());
  }

  async lookupUsername(username: string) {
    const hasRingNs = this.jamiSwig.lookupName('', '', username);
    if (!hasRingNs) {
      log.error('Jami does not have NS');
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(this.events.onRegisteredNameFound.pipe(filter((r) => r.username === username)));
  }

  async registerUsername(accountId: string, username: string, password: string) {
    const hasRingNs = this.jamiSwig.registerName(accountId, password, username);
    if (!hasRingNs) {
      log.error('Jami does not have NS');
      throw new Error('Jami does not have NS');
    }
    return firstValueFrom(
      this.events.onNameRegistrationEnded.pipe(
        filter(({ accountId: registeredAccountId }) => registeredAccountId === accountId)
      )
    );
  }

  getDevices(accountId: string): Record<string, string> {
    return stringMapToRecord(this.jamiSwig.getKnownRingDevices(accountId));
  }

  getDefaultModerators(accountId: string): string[] {
    return stringVectToArray(this.jamiSwig.getDefaultModerators(accountId));
  }

  // TODO: Ideally, we would fetch the username directly from Jami instead of
  // keeping an internal map.
  getAccountIdFromUsername(username: string): string | undefined {
    return this.usernamesToAccountIds.get(username);
  }
}
