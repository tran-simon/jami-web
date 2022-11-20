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
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { Service } from 'typedi';

interface AccountsFormat {
  local: Record<string, string>;
  jams: Record<string, string>;
}

@Service()
export class Accounts {
  private readonly filename = 'accounts.json';
  private accounts: AccountsFormat;

  constructor() {
    let buffer: Buffer;

    try {
      buffer = readFileSync(this.filename);
    } catch (e) {
      buffer = Buffer.from('{"local":{}},"jams":{}}}');
    }

    this.accounts = JSON.parse(buffer.toString());
  }

  get(username: string, isJams = false): string | undefined {
    return this.accounts[isJams ? 'jams' : 'local'][username];
  }

  set(username: string, password: string, isJams = false): void {
    this.accounts[isJams ? 'jams' : 'local'][username] = password;
  }

  async save(): Promise<void> {
    await writeFile(this.filename, JSON.stringify(this.accounts, null, 2) + '\n');
  }
}
