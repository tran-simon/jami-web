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
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import authManager from './AuthManager';
import WelcomeAnimation from './components/welcome';
import NotFoundPage from './pages/404';
import AccountCreationDialog from './pages/AccountCreation';
import AccountSelection from './pages/AccountSelection';
import AccountSettings from './pages/AccountSettings';
import JamiAccountDialog from './pages/JamiAccountCreation';
import JamiMessenger from './pages/JamiMessenger';
import SignInPage from './pages/LoginDialog';
import ServerSetup from './pages/ServerSetup';
import defaultTheme from './themes/Default';
import { ThemeDemonstrator } from './themes/ThemeDemonstrator';

// import { useSelector, useDispatch } from 'react-redux'
// import { useAppSelector, useAppDispatch } from '../redux/hooks'

const Home = () => {
  return <Navigate to="/account" />;
};

const App = () => {
  // const count = useSelector(state => state.counter.value)
  // const dispatch = useDispatch();
  // const count = useAppSelector((state) => state.counter.value);
  // const dispatch = useAppDispatch();

  const [state, setState] = useState({
    loaded: false,
    auth: authManager.getState(),
  });
  const [displayWelcome, setDisplayWelcome] = useState(true);

  useEffect(() => {
    authManager.init((auth) => {
      setState({ loaded: false, auth });
    });
    return () => authManager.deinit();
  }, []);

  console.log('App render');

  if (displayWelcome) {
    return <WelcomeAnimation showSetup={!state.auth.setupComplete} onComplete={() => setDisplayWelcome(false)} />;
  } else if (!state.auth.setupComplete) {
    return (
      <Routes>
        <Route path="/setup" element={<ServerSetup />} />
        <Route path="/" element={<Navigate to="/setup" replace />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Routes>
        <Route path="/account">
          <Route index element={<AccountSelection />} />
          <Route path=":accountId">
            <Route index element={<JamiMessenger />} />
            <Route path="*" element={<JamiMessenger />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>
        <Route path="/newAccount" element={<AccountCreationDialog />}>
          <Route path="jami" element={<JamiAccountDialog />} />
        </Route>
        {/* <Route path="/Contacts" element={<ContactList />} /> */}
        <Route path="/Theme" element={<ThemeDemonstrator />} />
        <Route path="/setup" element={<ServerSetup />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!state.auth.authenticated && <SignInPage key="signin" open={!state.auth.authenticated} />}
    </ThemeProvider>
  );
};

export default App;
