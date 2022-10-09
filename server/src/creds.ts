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
import { readFile, writeFile } from 'node:fs/promises';

import { Service } from 'typedi';

@Service()
export class Creds {
  readonly file = 'creds.json';
  db: Record<string, string>;

  constructor() {
    this.db = {};
  }

  async build() {
    const buffer = await readFile(this.file).catch(() => Buffer.from('{}'));
    this.db = JSON.parse(buffer.toString());
    return this;
  }

  get(username: string) {
    return this.db[username];
  }

  set(username: string, password: string) {
    this.db[username] = password;
  }

  async save() {
    await writeFile(this.file, JSON.stringify(this.db) + '\n');
  }
}
