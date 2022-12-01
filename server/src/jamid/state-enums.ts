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
export enum RegistrationState {
  Unregistered = 'UNREGISTERED',
  Trying = 'TRYING',
  Registered = 'REGISTERED',
  ErrorGeneric = 'ERROR_GENERIC',
  ErrorAuth = 'ERROR_AUTH',
  ErrorNetwork = 'ERROR_NETWORK',
  ErrorHost = 'ERROR_HOST',
  ErrorServiceUnavailable = 'ERROR_SERVICE_UNAVAILABLE',
  ErrorNeedMigration = 'ERROR_NEED_MIGRATION',
  Initializing = 'INITIALIZING',
}

export enum NameRegistrationEndedState {
  Success,
  InvalidCredentials,
  InvalidName,
  AlreadyTaken,
  Error,
}

export enum MessageState {
  Unknown,
  Sending,
  Sent,
  Displayed,
  Failure,
  Cancelled,
}

export enum ConversationMemberEventType {
  Add,
  Join,
  Remove,
  Ban,
  Unban,
}
