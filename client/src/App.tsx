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
import axios from 'axios';
import { useState } from 'react';
import { json, LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';

import WelcomeAnimation from './components/welcome';
import { getAccessToken } from './utils/auth';
import { apiUrl } from './utils/constants';

export async function checkSetupStatus(): Promise<boolean> {
  try {
    const { data } = await axios.get<{ isSetupComplete: boolean }>('/setup/check', { baseURL: apiUrl });
    return data.isSetupComplete;
  } catch (e) {
    throw new Error('Cannot connect to server', { cause: e });
  }
}

export async function appLoader({ request }: LoaderFunctionArgs) {
  const initialUrl = new URL(request.url);
  const isSetupComplete = await checkSetupStatus();

  if (!isSetupComplete && initialUrl.pathname !== '/setup/login') {
    return redirect('/setup/login');
  }
  return json({ isSetupComplete }, { status: 200 });
}

const App = () => {
  const [displayWelcome, setDisplayWelcome] = useState<boolean>(getAccessToken() === undefined);

  console.log('App render');

  if (displayWelcome) {
    return <WelcomeAnimation onComplete={() => setDisplayWelcome(false)} />;
  }

  return <Outlet />;
};

export default App;
