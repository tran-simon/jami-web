import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Account from '../../model/Account';

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
