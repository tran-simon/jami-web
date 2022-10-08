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
import { Box, Card, Grid, Stack, Typography } from '@mui/material';

import {
  CallingChatButton,
  CallingEndButton,
  CallingExtensionButton,
  CallingFullscreenButton,
  CallingGroupButton,
  CallingMicButton,
  CallingRecordButton,
  CallingScreenShareButton,
  CallingVideoCameraButton,
  CallingVolumeButton,
} from '../components/Button';

export default function CallInterface() {
  return (
    <>
      <Box sx={{ backgroundColor: 'blue', width: '100%', height: '100%', position: 'absolute' }}>
        {/* Host video will be shown here */}
      </Box>
      <Stack
        position="absolute"
        direction="column"
        spacing={1}
        margin={2}
        sx={{ left: 0, right: 0, top: 0, bottom: 0 }}
      >
        {/* Top panel with guest information */}
        <Box>
          <CallInterfaceInformation />
        </Box>
        {/* Guest video, with empty space to be moved around and stickied to walls */}
        <Box height="100%">
          <Box
            sx={{
              aspectRatio: '16/9',
              position: 'absolute',
              right: 0,
              zIndex: 2,
              backgroundColor: 'white',
              borderRadius: '12px',
              minWidth: '25%',
              minHeight: '25%',
              maxWidth: '50%',
              maxHeight: '50%',
            }}
          />
        </Box>
        {/* Bottom panel with calling buttons */}
        <Grid container justifyContent="space-between">
          <Grid item xs />
          <Grid item>
            <CallInterfacePrimaryButtons />
          </Grid>
          <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CallInterfaceSecondaryButtons />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

const CallInterfaceInformation = () => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="white" component="p">
        Alain Thérieur
      </Typography>
      <Typography color="white" component="p">
        01:23
      </Typography>
    </Stack>
  );
};

const CallInterfacePrimaryButtons = () => {
  return (
    <Card sx={{ backgroundColor: 'black', textAlign: 'center' }}>
      <CallingMicButton />
      <CallingEndButton />
      <CallingVideoCameraButton />
    </Card>
  );
};

const CallInterfaceSecondaryButtons = () => {
  return (
    <Card style={{ backgroundColor: 'black' }}>
      <CallingVolumeButton />
      <CallingGroupButton />
      <CallingChatButton />
      <CallingScreenShareButton />
      <CallingRecordButton />
      <CallingExtensionButton />
      <CallingFullscreenButton />
    </Card>
  );
};
