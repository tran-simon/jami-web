/*
  Company: Savoir-faire Linux
  Author: Larbi Gharib <larbi.gharib@savoirfairelinux.com>
  License: AGPL-3
*/
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import authManager from './AuthManager'
import './App.scss'

import SignInPage from "./pages/loginDialog.jsx"
import JamiMessenger from "./pages/JamiMessenger.jsx"
import AccountSettings from "./pages/accountSettings.jsx"
import AccountSelection from "./pages/accountSelection.jsx"
import ServerSetup from "./pages/serverSetup.jsx"
import AccountCreationDialog from "./pages/accountCreation.jsx"
import NotFoundPage from "./pages/404.jsx"
import JamiAccountDialog from './pages/jamiAccountCreation.jsx'
import WelcomeAnimation from './components/welcome'

const theme = createTheme({
  typography: {
    fontFamily: "Ubuntu",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-Th.ttf");
          font-weight: 100;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-L.ttf");
          font-weight: 300;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-LI.ttf");
          font-weight: 300;
          font-style: italic;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-R.ttf");
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-RI.ttf");
          font-weight: 400;
          font-style: italic;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-M.ttf");
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-MI.ttf");
          font-weight: 500;
          font-style: italic;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-B.ttf");
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-BI.ttf");
          font-weight: 700;
          font-style: italic;
        }
      `,
    },
  },
});

const Home = (props) => {
  console.log(`home ${props}`)

  return <Navigate to="/account" />
}

const App = (props) => {
    const [state, setState] = useState({
      loaded: false,
      auth: authManager.getState()
    })
    const [displayWelcome, setDisplayWelcome] = useState(true)

    useEffect(() => {
      authManager.init(auth => {
        setState({ loaded: false, auth })
      })
      return () => authManager.deinit()
    }, []);

    console.log("App render")
    if (displayWelcome) {
      return <WelcomeAnimation showSetup={!state.auth.setupComplete} onComplete={() => setDisplayWelcome(false)} />
    } else if (!state.auth.setupComplete) {
      return <Routes>
          <Route path="/setup" element={<ServerSetup />} />
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route index path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
    }

    return <ThemeProvider theme={theme}>
    <Routes>
      <Route path="/account">
        <Route index element={<AccountSelection />} />
        <Route path=":accountId">
          <Route index path="*" element={<JamiMessenger />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>
      </Route>
      <Route path="/newAccount" element={<AccountCreationDialog />}>
        <Route path="jami" element={<JamiAccountDialog />} />
      </Route>
      <Route path="/setup" element={<ServerSetup />} />
      <Route path="/" index element={<Home />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    {!state.auth.authenticated && <SignInPage key="signin" open={!state.auth.authenticated}/>}
    </ThemeProvider>
}

export default App
