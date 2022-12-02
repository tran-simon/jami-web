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
import { PaletteMode } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { buildDefaultTheme } from '../themes/Default';
import { WithChildren } from '../utils/utils';

interface ICustomThemeContext {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const CustomThemeContext = createContext<ICustomThemeContext>(undefined!);

export default ({ children }: WithChildren) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    const browserIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // TODO: Check if account saved a preference and use it
    setMode(browserIsDark ? 'dark' : 'light');
  }, []);

  const toggleMode = useCallback(() => setMode((mode) => (mode === 'light' ? 'dark' : 'light')), [setMode]);

  const theme = useMemo(() => buildDefaultTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode,
    }),
    [mode, toggleMode]
  );

  return (
    <CustomThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CustomThemeContext.Provider>
  );
};
