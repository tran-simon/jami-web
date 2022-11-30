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
import axios from 'axios';
import { passwordStrength } from 'check-password-strength';
import { AccessToken, HttpStatusCode } from 'jami-web-common';

import { PasswordStrength } from '../enums/passwordStrength';
import { apiUrl } from './constants';
import { InvalidCredentials, InvalidPassword, UsernameNotFound } from './errors';

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
export type LoginMethod = 'Jami' | 'JAMS';

const idToStrengthValueCode: StrengthValueCode[] = ['too_weak', 'weak', 'medium', 'strong'];

export async function isNameRegistered(name: string): Promise<boolean> {
  try {
    await axios.get(`/ns/username/${name}`, { baseURL: apiUrl });
    return true;
  } catch (e: any) {
    if (e.response?.status !== HttpStatusCode.NotFound) {
      throw e;
    }
    return false;
  }
}

export function checkPasswordStrength(password: string): PasswordCheckResult {
  const strengthResult: PasswordStrengthResult = passwordStrength(password);

  return {
    strong: strengthResult.id === PasswordStrength.Strong.valueOf(),
    valueCode: idToStrengthValueCode[strengthResult.id] ?? 'default',
  };
}

export async function registerUser(username: string, password: string, isJams: boolean): Promise<void> {
  try {
    await axios.post('/auth/new-account', { username, password, isJams }, { baseURL: apiUrl });
  } catch (e: any) {
    if (e.response?.status === HttpStatusCode.Unauthorized) {
      throw new InvalidCredentials();
    } else {
      throw e;
    }
  }
}

export async function loginUser(username: string, password: string, isJams: boolean): Promise<string> {
  try {
    const { data } = await axios.post<AccessToken>('/auth/login', { username, password, isJams }, { baseURL: apiUrl });
    return data.accessToken;
  } catch (e: any) {
    switch (e.response?.status) {
      case HttpStatusCode.NotFound:
        throw new UsernameNotFound();
      case HttpStatusCode.Unauthorized:
        throw new InvalidPassword();
      default:
        throw e;
    }
  }
}

export function getAccessToken(): string | undefined {
  return localStorage.getItem('accessToken') ?? undefined;
}

export function setAccessToken(accessToken: string): void {
  localStorage.setItem('accessToken', accessToken);
}
