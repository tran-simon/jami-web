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
import { Box, Grid, Paper, useMediaQuery } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import JamiWelcomeLogo from '../components/JamiWelcomeLogo';
import { getAccessToken } from '../utils/auth';
import JamiLogin from './JamiLogin';
import JamiRegistration from './JamiRegistration';

const borderRadius = 30;

export default function Home() {
  const theme: Theme = useTheme();
  const [isRegistrationDisplayed, setIsRegistrationDisplayed] = useState<boolean>(false);

  const child = !isRegistrationDisplayed ? (
    <JamiLogin register={() => setIsRegistrationDisplayed(true)} />
  ) : (
    <JamiRegistration login={() => setIsRegistrationDisplayed(false)} />
  );

  const isDesktopOrLaptop: boolean = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile: boolean = useMediaQuery(theme.breakpoints.only('xs'));

  const accessToken = getAccessToken();

  if (accessToken) {
    return <Navigate to="/settings" replace />;
  }
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: `${isDesktopOrLaptop ? theme.palette.primary.dark : 'white'}`,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: '100%',
          backgroundColor: 'white',
          margin: `${isDesktopOrLaptop ? theme.typography.pxToRem(100) : 0}`,
          borderRadius: `${isDesktopOrLaptop ? theme.typography.pxToRem(borderRadius) : 0}`,
        }}
      >
        <Grid container spacing={0} sx={{ height: '100%' }}>
          {!isMobile && (
            <Grid
              item
              xs={6}
              id="logo"
              sx={{
                height: '100%',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: `${
                  isDesktopOrLaptop
                    ? `${theme.typography.pxToRem(borderRadius)} 0 0 ${theme.typography.pxToRem(borderRadius)}`
                    : 0
                }`, // To follow paper border-radius
              }}
            >
              <JamiWelcomeLogo logoWidth="90%" sx={{ height: '100%' }} />
            </Grid>
          )}
          <Grid item xs={isMobile ? 12 : 6} sx={{ height: '100%' }}>
            {isMobile && (
              <JamiWelcomeLogo
                logoWidth={theme.typography.pxToRem(100)}
                logoHeight={theme.typography.pxToRem(100)}
                sx={{ mt: theme.typography.pxToRem(30), mb: theme.typography.pxToRem(20) }}
              />
            )}
            <Box className="home-child" sx={{ height: `${isMobile ? 'auto' : '100%'}` }}>
              {child}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
