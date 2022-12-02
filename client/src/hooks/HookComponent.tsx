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
import { useEffect } from 'react';

export type ConditionalHookProps<T, A> = {
  useHook: (args: A) => T;
  args: A;
  callback?: (value: T) => void;
  unmountCallback?: (prevValue: T) => void;
};

/**
 * Component that, when mounted, calls `useHook` and passes its return value as an argument to the `callback` function.
 *
 * @example
 * // Conditionally call `useMyHook` with arguments `myArgs`
 * <>
 *   {myCondition && (
 *     <HookComponent
 *       useHook={useMyHook}
 *       args={myArgs}
 *       callback={(v) => console.log(v)}
 *     />
 *   )}
 * </>
 *
 */
const HookComponent = <T, A>({
  useHook,
  args,
  callback = () => {},
  unmountCallback = () => {},
}: ConditionalHookProps<T, A>) => {
  const value = useHook(args);

  useEffect(() => {
    callback(value);

    return () => {
      unmountCallback(value);
    };
  }, [value, callback, unmountCallback]);

  return null;
};

export default HookComponent;
