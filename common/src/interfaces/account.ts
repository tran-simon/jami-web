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
import { IContact } from './contact';

export interface IAccount {
  id: string;
  details: AccountDetails;
  volatileDetails: VolatileDetails;
  defaultModerators: IContact[];
  devices: Devices;
}

/**
 * Account details.
 *
 * See `jami-daemon/src/account_schema.h`
 */
export interface AccountDetails {
  // Common account parameters
  'Account.id': string;
  'Account.type': string;
  'Account.alias': string;
  'Account.displayName': string;
  'Account.mailbox': string;
  'Account.enable': string;
  'Account.autoAnswer': string;
  'Account.sendReadReceipt': string;
  'Account.rendezVous': string;
  'Account.activeCallLimit': string;
  'Account.registrationExpire': string;
  'Account.dtmfType': string;
  'Account.ringtonePath': string;
  'Account.ringtoneEnabled': string;
  'Account.videoEnabled': string;
  'Account.keepAliveEnabled': string;
  'Account.peerDiscovery': string;
  'Account.accountDiscovery': string;
  'Account.accountPublish': string;
  'Account.presenceEnabled': string;
  'Account.presencePublishSupported': string;
  'Account.presenceSubscribeSupported': string;
  'Account.presenceStatus': string;
  'Account.presenceNote': string;
  'Account.archivePassword': string;
  'Account.archiveHasPassword': string;
  'Account.archivePath': string;
  'Account.archivePIN': string;
  'Account.deviceID': string;
  'Account.deviceName': string;
  'Account.proxyEnabled': string;
  'Account.proxyServer': string;
  'Account.proxyPushToken': string;
  'Account.managerUri': string;
  'Account.managerUsername': string;
  'Account.bootstrapListUrl': string;
  'Account.dhtProxyListUrl': string;

  'Account.hostname': string;
  'Account.username': string;
  'Account.routeset': string;
  'Account.allowIPAutoRewrite': string;
  'Account.password': string;
  'Account.realm': string;
  'Account.useragent': string;
  'Account.hasCustomUserAgent': string;
  'Account.allowCertFromHistory': string;
  'Account.allowCertFromContact': string;
  'Account.allowCertFromTrusted': string;
  'Account.audioPortMin': string;
  'Account.audioPortMax': string;
  'Account.videoPortMin': string;
  'Account.videoPortMax': string;

  'Account.bindAddress': string;
  'Account.localInterface': string;
  'Account.publishedSameAsLocal': string;
  'Account.localPort': string;
  'Account.publishedPort': string;
  'Account.publishedAddress': string;
  'Account.upnpEnabled': string;
  'Account.defaultModerators': string;
  'Account.localModeratorsEnabled': string;
  'Account.allModeratorEnabled': string;

  // SIP specific parameters
  'STUN.server': string;
  'STUN.enable': string;
  'TURN.server': string;
  'TURN.enable': string;
  'TURN.username': string;
  'TURN.password': string;
  'TURN.realm': string;

  // SRTP specific parameters
  'SRTP.enable': string;
  'SRTP.keyExchange': string;
  'SRTP.rtpFallback': string;

  'TLS.listenerPort': string;
  'TLS.enable': string;
  'TLS.certificateListFile': string;
  'TLS.certificateFile': string;
  'TLS.privateKeyFile': string;
  'TLS.password': string;
  'TLS.method': string;
  'TLS.ciphers': string;
  'TLS.serverName': string;
  'TLS.verifyServer': string;
  'TLS.verifyClient': string;
  'TLS.requireClientCertificate': string;
  'TLS.negotiationTimeoutSec': string;

  // DHT specific parameters
  'DHT.port': string;
  'DHT.PublicInCalls': string;

  // Volatile parameters
  'Account.registrationStatus': string;
  'Account.registrationCode': string;
  'Account.registrationDescription': string;
  'Transport.statusCode': string;
  'Transport.statusDescription': string;
}

/**
 * Volatile account details.
 *
 * See `jami-daemon/src/jami/account_const.h`
 */
export interface VolatileDetails {
  'Account.active': string;
  'Account.deviceAnnounced': string;
  'Account.registeredName': string;
}

export type Devices = Record<string, string>;
