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
import { Dispatch, ReactNode, SetStateAction } from 'react';

export type WithChildren = {
  children: ReactNode;
};

type AsyncDispatch<A> = (value: A) => Promise<void>;
export type SetState<T> = Dispatch<SetStateAction<T>>;
export type AsyncSetState<T> = AsyncDispatch<SetStateAction<T>>;

/**
 * HTMLVideoElement with the `sinkId` and `setSinkId` optional properties.
 *
 * These properties are defined only on supported browsers
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId#browser_compatibility
 */
export interface VideoElementWithSinkId extends HTMLVideoElement {
  sinkId?: string;
  setSinkId?: (deviceId: string) => void;
}

export type PartialNotOptional<T> = {
  [P in keyof T]: T[P] | undefined;
};

export const isRequired = <T>(obj: Partial<T>): obj is T => {
  return Object.values(obj).every((v) => v !== undefined);
};
