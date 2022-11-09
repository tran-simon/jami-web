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

import { Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { Trans } from 'react-i18next';

import {
  CallingAnswerAudioButton,
  CallingAnswerVideoButton,
  CallingEndButton,
  CallingRefuseButton,
} from '../components/CallButtons';

export type CallPendingProps = {
  pending: PendingStatus;
  caller?: CallerStatus;
  medium?: CommunicationMedium;
};

type PendingStatus = 'caller' | 'receiver';
type CallerStatus = 'calling' | 'connecting';
type CommunicationMedium = 'audio' | 'video';

const RECEIVER_BUTTONS = [
  {
    ButtonComponent: CallingRefuseButton,
    translationKey: 'refuse_call',
  },
  {
    ButtonComponent: CallingAnswerAudioButton,
    translationKey: 'accept_call_audio',
  },
  {
    ButtonComponent: CallingAnswerVideoButton,
    translationKey: 'accept_call_video',
  },
];

export const CallPending = (props: CallPendingProps) => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      spacing={4}
      sx={{
        backgroundColor: 'black',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '30%',
        }}
      >
        <Box
          sx={{
            aspectRatio: '1',
            height: '100%',
            position: 'absolute',
          }}
        >
          <CircularProgress
            disableShrink
            thickness={1}
            size="100%"
            sx={{
              position: 'absolute',
              color: 'white',
              zIndex: 1,
            }}
          />
          <img
            // TODO: Insert incoming caller icon here
            style={{
              position: 'absolute',
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              borderRadius: '50%',
              aspectRatio: '1',
            }}
          />
        </Box>
      </Box>
      {props.pending === 'caller' ? (
        <CallPendingCallerInterface {...props} />
      ) : (
        <CallPendingReceiverInterface {...props} />
      )}
    </Stack>
  );
};

export const CallPendingCallerInterface = ({ caller }: CallPendingProps) => {
  // TODO: Remove the dummy name
  const defaultName = 'Alex Thérieur';
  return (
    <Stack textAlign="center" spacing={2}>
      <Typography variant="h1" color="white">
        {defaultName}
      </Typography>
      <Typography variant="h3" color="white">
        {caller === 'calling' ? <Trans i18nKey="calling" /> : <Trans i18nKey="connecting" />}
      </Typography>
      <CallerButtons />
    </Stack>
  );
};

export const CallPendingReceiverInterface = ({ medium }: CallPendingProps) => {
  // TODO: Remove the dummy name
  const defaultName = 'Alain Thérieur';
  return (
    <Stack textAlign="center" spacing={2}>
      <Typography variant="h1" color="white">
        <Trans i18nKey="incoming_call" context={medium} values={{ member0: defaultName }} />
      </Typography>
      <ReceiverButtons />
    </Stack>
  );
};

const CallerButtons = () => {
  return (
    <Stack textAlign="center" spacing={1}>
      <CallingEndButton size="large" />
      <Typography variant="body2" color="white">
        <Trans i18nKey="end_call" />
      </Typography>
    </Stack>
  );
};

const ReceiverButtons = () => {
  return (
    <Grid container direction="row" padding={2}>
      {RECEIVER_BUTTONS.map(({ ButtonComponent, translationKey }, i) => (
        <Grid item xs={4} key={i}>
          <Stack spacing={1}>
            <ButtonComponent color="inherit" size="large" />
            <Typography variant="body2" color="white" textAlign="center" sx={{ opacity: 0.75 }}>
              <Trans i18nKey={'' + translationKey} />
            </Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};
