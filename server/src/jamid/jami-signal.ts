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
 * Signals emitted by the Jami daemon.
 *
 * The definition of signals can be found in `daemon/bin/nodejs/callback.h`.
 */
export enum JamiSignal {
  // libjami::ConfigurationSignal
  AccountsChanged = 'AccountsChanged',
  AccountDetailsChanged = 'AccountDetailsChanged',
  RegistrationStateChanged = 'RegistrationStateChanged',
  IncomingTrustRequest = 'IncomingTrustRequest',
  ContactAdded = 'ContactAdded',
  ContactRemoved = 'ContactRemoved',
  ExportOnRingEnded = 'ExportOnRingEnded',
  NameRegistrationEnded = 'NameRegistrationEnded',
  RegisteredNameFound = 'RegisteredNameFound',
  VolatileDetailsChanged = 'VolatileDetailsChanged',
  KnownDevicesChanged = 'KnownDevicesChanged',
  IncomingAccountMessage = 'IncomingAccountMessage',
  AccountMessageStatusChanged = 'AccountMessageStatusChanged',

  // libjami::CallSignal
  StateChange = 'StateChange',
  IncomingMessage = 'IncomingMessage',
  IncomingCall = 'IncomingCall',
  IncomingCallWithMedia = 'IncomingCallWithMedia',
  MediaChangeRequested = 'MediaChangeRequested',

  // libjami::ConversationSignal
  ConversationLoaded = 'ConversationLoaded',
  MessagesFound = 'MessagesFound',
  MessageReceived = 'MessageReceived',
  ConversationProfileUpdated = 'ConversationProfileUpdated',
  ConversationRequestReceived = 'ConversationRequestReceived',
  ConversationRequestDeclined = 'ConversationRequestDeclined',
  ConversationReady = 'ConversationReady',
  ConversationRemoved = 'ConversationRemoved',
  ConversationMemberEvent = 'ConversationMemberEvent',
  OnConversationError = 'OnConversationError',
  OnConferenceInfosUpdated = 'OnConferenceInfosUpdated',
}
