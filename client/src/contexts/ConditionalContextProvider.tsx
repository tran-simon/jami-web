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
import { Context, useEffect, useState } from 'react';

import { isRequired, PartialNotOptional, WithChildren } from '../utils/utils';

export type ConditionalContextProviderProps<T, B extends object> = WithChildren & {
  Context: Context<T>;
  initialValue: T;

  conditions: PartialNotOptional<B>;
  useContextValue: (conditions: B) => T;
};

const ConditionalContextProvider = <T, B extends object>({
  Context,
  initialValue,
  conditions,
  useContextValue,
  children,
}: ConditionalContextProviderProps<T, B>) => {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      {isRequired(conditions) && (
        <ConditionnalHookCaller setValue={setValue} conditions={conditions} useContextValue={useContextValue} />
      )}
      <Context.Provider value={value}>{children}</Context.Provider>
    </>
  );
};

type ConditionnalHookCallerProps<T, B> = {
  setValue: (value: T) => void;
  conditions: B;
  useContextValue: (conditions: B) => T;
};
const ConditionnalHookCaller = <T, B>({ setValue, conditions, useContextValue }: ConditionnalHookCallerProps<T, B>) => {
  const value = useContextValue(conditions);

  useEffect(() => {
    setValue(value);
  }, [setValue, value]);

  return null;
};

export default ConditionalContextProvider;
