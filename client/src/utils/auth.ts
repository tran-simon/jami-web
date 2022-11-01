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
import { HttpStatusCode } from 'jami-web-common';

import { PasswordStrength } from '../enums/password-strength';
import { apiUrl } from './constants';
import { InvalidPassword, UsernameNotFound } from './errors';

interface PasswordStrengthResult {
  id: number;
  value: string;
  contains: string[];
  length: number;
}

export interface PasswordCheckResult {
  strong: boolean;
  valueCode: StrengthValueCode;
}

export type StrengthValueCode = 'default' | 'too_weak' | 'weak' | 'medium' | 'strong';

const idToStrengthValueCode: StrengthValueCode[] = ['too_weak', 'weak', 'medium', 'strong'];

export async function isNameRegistered(name: string): Promise<boolean> {
  const url = new URL(`/ns/username/${name}`, apiUrl);
  const response = await fetch(url);

  switch (response.status) {
    case HttpStatusCode.Ok:
      return true;
    case HttpStatusCode.NotFound:
      return false;
    default:
      throw new Error(await response.text());
  }
}

export function checkPasswordStrength(password: string): PasswordCheckResult {
  const strengthResult: PasswordStrengthResult = passwordStrength(password);

  const checkResult: PasswordCheckResult = {
    strong: strengthResult.id === PasswordStrength.Strong.valueOf(),
    valueCode: idToStrengthValueCode[strengthResult.id] ?? 'default',
  };

  return checkResult;
}

export async function registerUser(username: string, password: string): Promise<void> {
  const url = new URL('/auth/new-account', apiUrl);
  const response: Response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.status !== HttpStatusCode.Created) {
    throw new Error(await response.text());
  }
}

export async function loginUser(username: string, password: string): Promise<string> {
  const url = new URL('/auth/login', apiUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  switch (response.status) {
    case HttpStatusCode.Ok:
      break;
    case HttpStatusCode.NotFound:
      throw new UsernameNotFound();
    case HttpStatusCode.Unauthorized:
      throw new InvalidPassword();
    default:
      throw new Error(await response.text());
  }

  const data: { accessToken: string } = await response.json();
  return data.accessToken;
}

export function getAccessToken(): string {
  const accessToken: string | null = localStorage.getItem('accessToken');
  return accessToken ?? '';
}

export function setAccessToken(accessToken: string): void {
  localStorage.setItem('accessToken', accessToken);
}
