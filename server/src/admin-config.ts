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

@Service()
export class AdminConfig {
  private readonly file = 'admin.json';
  private account: { admin: string };

  constructor() {
    let buffer: Buffer;

    try {
      buffer = readFileSync(this.file);
    } catch (e) {
      console.error(e);
      buffer = Buffer.from('{}');
    }

    this.account = JSON.parse(buffer.toString());
  }

  get() {
    return this.account.admin;
  }

  set(password: string) {
    this.account.admin = password;
  }

  async save() {
    await writeFile(this.file, JSON.stringify(this.account) + '\n');
  }
}
