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
import { passwordStrength } from 'check-password-strength';
import { HttpStatusCode, LookupResolveValue } from 'jami-web-common';

import { PasswordStrength } from '../enums/password-strength';

interface PasswordStrengthResult {
  id: number;
  value: string;
  contains: string[];
  length: number;
}

export interface PasswordCheckResult {
  strong: boolean;
  value: string;
}

// TODO: Find a way to do it differently or remove this check from account creation.
// It doesn't work if the server has secured this path, so I tweaked the server for test.
// The tweak is to remove secured of apiRouter middleware in the server (app.ts).
export async function isNameRegistered(name: string): Promise<boolean> {
  try {
    const response: Response = await fetch(`api/ns/name/${name}`);
    if (response.status === HttpStatusCode.Ok) {
      const data: LookupResolveValue = await response.json();
      return data.name === name;
    }
    return false;
  } catch (err) {
    return true;
  }
}

export function checkPasswordStrength(password: string): PasswordCheckResult {
  const strengthResult: PasswordStrengthResult = passwordStrength(password);

  const checkResult: PasswordCheckResult = {
    strong: strengthResult.id === PasswordStrength.Strong.valueOf(),
    value: strengthResult.value,
  };

  return checkResult;
}
