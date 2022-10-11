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
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account } from 'jami-web-common';

// Define a type for the slice state
interface appState {
  accountId: string;
  accountObject: Account | null;
  refresh: boolean;
}

// Define the initial state using that type
const initialState: appState = {
  accountId: '',
  accountObject: null,
  refresh: true,
};

export const appSlice = createSlice({
  name: 'app',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setAccountId: (state, action: PayloadAction<string>) => {
      state.accountId = action.payload;
    },
    setAccountObject: (state, action: PayloadAction<Account>) => {
      state.accountObject = action.payload;
    },
    setRefreshFromSlice: (state) => {
      state.refresh = !state.refresh;
    },
  },
});

export const { setAccountId, setAccountObject, setRefreshFromSlice } = appSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.app.value;

export default appSlice.reducer;
