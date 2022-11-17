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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  // TODO: Remove the dummy name
  const defaultName = 'Alex Thérieur';
  return (
    <>
      <Typography variant="h1" color="white">
        {defaultName}
      </Typography>
      <Typography variant="h3" color="white">
        {caller === 'calling' ? t('calling') : t('connecting')}
      </Typography>

      <Stack alignItems="center" spacing={1} width="100%">
        <CallingEndButton size="large" />
        <Typography variant="body2" color="white">
          {t('end_call')}
        </Typography>
      </Stack>
    </>
  );
};

export const CallPendingReceiverInterface = ({ medium }: CallPendingProps) => {
  const { t } = useTranslation();
  // TODO: Remove the dummy name
  const defaultName = 'Alain Thérieur';
  return (
    <>
      <Typography variant="h1" color="white">
        {t('incoming_call', {
          context: medium,
          member0: defaultName,
        })}
      </Typography>
      <Box width="50%">
        <ReceiverButtons />
      </Box>
    </>
  );
};

const ReceiverButtons = () => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={2}>
      {RECEIVER_BUTTONS.map(({ ButtonComponent, translationKey }, i) => (
        <Grid item xs={4} key={i}>
          <Stack alignItems="center" spacing={1}>
            <ButtonComponent color="inherit" size="large" />
            <Typography variant="body2" color="white" sx={{ opacity: 0.75 }}>
              {t(translationKey)}
            </Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};
