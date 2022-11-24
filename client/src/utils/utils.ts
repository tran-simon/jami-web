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

export type SetState<T> = Dispatch<SetStateAction<T>>;

/**
 * Makes the prop of a type optional if the prop is of type undefined
 *
 * https://stackoverflow.com/a/67630189/6592293
 */
export type UndefinedToOptional<T> = {
  [K in keyof T]-?: (x: undefined extends T[K] ? { [P in K]?: T[K] } : { [P in K]: T[K] }) => void;
}[keyof T] extends (x: infer I) => void
  ? I extends infer U
    ? { [K in keyof U]: U[K] }
    : never
  : never;
