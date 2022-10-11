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

/**
 * Account parameters
 *
 * See `jami-daemon/src/account_schema.h`
 */
export interface AccountDetails {
  // Common account parameters
  'Account.type': string;
  'Account.alias': string;
  'Account.displayName': string;
  'Account.mailbox': string;
  'Account.enable': string;
  'Account.autoAnswer': string;
  'Account.sendReadReceipt': string;
  'Account.rendezVous': string;
  'Account.registrationExpire': string;
  'Account.dtmfType': string;
  'Account.ringtonePath': string;
  'Account.ringtoneEnabled': string;
  'Account.videoEnabled': string;
  'Account.keepAliveEnabled': string;
  'Account.presenceEnabled': string;
  'Account.presencePublishSupported': string;
  'Account.presenceSubscribeSupported': string;
  'Account.presenceStatus': string;
  'Account.presenceNote': string;

  'Account.hostname': string;
  'Account.username': string;
  'Account.routeset': string;
  'Account.allowIPAutoRewrite': string;
  'Account.password': string;
  'Account.realm': string;
  'Account.useragent': string;
  'Account.hasCustomUserAgent': string;
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
 * Volatile properties
 *
 * See `jami-daemon/src/jami/account_const.h`
 */
export interface VolatileDetails {
  'Account.active': string;
  'Account.deviceAnnounced': string;
  'Account.registeredName': string;
}

/**
 * See `ConfProperties` in `jami-daemon/src/jami/account_const.h
 */
export interface AccountConfig {
  id?: string;
  type?: string;
  alias?: string;
  displayName?: string;
  enable?: boolean;
  mailbox?: string;
  dtmfType?: string;
  autoAnswer?: boolean;
  sendReadReceipt?: string;
  rendezVous?: boolean;
  activeCallLimit?: string;
  hostname?: string;
  username?: string;
  bindAddress?: string;
  routeset?: string;
  password?: string;
  realm?: string;
  localInterface?: string;
  publishedSameAsLocal?: boolean;
  localPort?: string;
  publishedPort?: string;
  publishedAddress?: string;
  useragent?: string;
  upnpEnabled?: boolean;
  hasCustomUserAgent?: string;
  allowCertFromHistory?: string;
  allowCertFromContact?: string;
  allowCertFromTrusted?: string;
  archivePassword?: string;
  archiveHasPassword?: string;
  archivePath?: string;
  archivePIN?: string;
  deviceID?: string;
  deviceName?: string;
  proxyEnabled?: boolean;
  proxyServer?: string;
  proxyPushToken?: string;
  keepAliveEnabled?: boolean;
  peerDiscovery?: string;
  accountDiscovery?: string;
  accountPublish?: string;
  managerUri?: string;
  managerUsername?: string;
  bootstrapListUrl?: string;
  dhtProxyListUrl?: string;
  defaultModerators?: string;
  localModeratorsEnabled?: boolean;
  allModeratorsEnabled?: boolean;
  allowIPAutoRewrite?: string;

  // Audio
  audioPortMax?: string;
  audioPortMin?: string;

  // Video
  videoEnabled?: boolean;
  videoPortMax?: boolean;
  videoPortMin?: string;

  // Ringtone
  ringtonePath?: string;
  ringtoneEnabled?: boolean;
}
