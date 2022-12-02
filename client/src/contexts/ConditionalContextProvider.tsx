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
import { Context, useCallback, useState } from 'react';

import HookComponent from '../hooks/HookComponent';
import { isRequired, PartialNotOptional, WithChildren } from '../utils/utils';

export type ConditionalContextProviderProps<T, B extends object> = WithChildren & {
  Context: Context<T>;
  initialValue: T;

  /**
   * Object containing the values used to get the provider value with `useProviderValue`
   * If one or more field is undefined, the hook will not be called and `initialValue` will be used for the provider
   * value.
   *
   * Should be wrapped un `useMemo` to avoid unnecessary hook calls.
   */
  dependencies: PartialNotOptional<B>;
  useProviderValue: (dependencies: B) => T;
};

/**
 * A context provider with `initialValue` as its value if not all props of the dependencies object are defined.
 * If all props are defined, the provider value is the result of `useProviderValue`
 */
const ConditionalContextProvider = <T, B extends object>({
  Context,
  initialValue,
  dependencies,
  useProviderValue,
  children,
}: ConditionalContextProviderProps<T, B>) => {
  const [value, setValue] = useState(initialValue);
  const unmountCallback = useCallback(() => setValue(initialValue), [initialValue]);

  return (
    <>
      {isRequired(dependencies) && (
        <HookComponent
          callback={setValue}
          unmountCallback={unmountCallback}
          useHook={useProviderValue}
          args={dependencies}
        />
      )}
      <Context.Provider value={value}>{children}</Context.Provider>
    </>
  );
};

export default ConditionalContextProvider;
