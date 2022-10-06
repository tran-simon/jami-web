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
class Contact {
  private readonly uri: string;
  private readonly displayName: string | undefined;
  private registeredName: string | undefined;

  constructor(uri: string) {
    this.uri = uri;
    this.displayName = undefined;
    this.registeredName = undefined;
  }

  static from(object: any) {
    const contact = new Contact(object.uri);
    if (object.registeredName) contact.setRegisteredName(object.registeredName);
    return contact;
  }

  getUri() {
    return this.uri;
  }

  getRegisteredName() {
    return this.registeredName;
  }

  setRegisteredName(name: string | undefined) {
    this.registeredName = name;
  }

  isRegisteredNameResolved() {
    return this.registeredName !== undefined;
  }

  getDisplayName() {
    return this.getDisplayNameNoFallback() || this.getUri();
  }

  getDisplayNameNoFallback() {
    return this.displayName || this.getRegisteredName();
  }

  async getObject() {
    return {
      uri: this.uri,
      registeredName: await this.registeredName,
    };
  }
}

export default Contact;
