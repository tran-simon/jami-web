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
export interface Message {
  id: string;
  author: string;
  timestamp: string;
  type:
    | 'application/call-history+json'
    | 'application/data-transfer+json'
    | 'application/update-profile'
    | 'initial'
    | 'member'
    | 'merge'
    | 'text/plain'
    | 'vote';
  linearizedParent: string;
  parents: string;
  body?: string;
  duration?: string;
  to?: string;
  invited?: string;
}
