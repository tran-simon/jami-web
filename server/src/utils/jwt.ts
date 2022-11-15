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
import { jwtVerify, JWTVerifyResult, SignJWT } from 'jose';
import { Container } from 'typedi';

import { SigningKeys } from '../storage/signing-keys.js';

const jwtIssuer = 'https://jami.net/';
const jwtAudience = 'https://jami.net/';

const signingKeys = Container.get(SigningKeys);

export async function signJwt(accountId: string): Promise<string> {
  return new SignJWT({ accountId })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt()
    .setIssuer(jwtIssuer)
    .setAudience(jwtAudience)
    .setExpirationTime('2h')
    .sign(signingKeys.privateKey);
}

export async function verifyJwt(token: string): Promise<JWTVerifyResult> {
  return jwtVerify(token, signingKeys.publicKey, {
    issuer: jwtIssuer,
    audience: jwtAudience,
  });
}
