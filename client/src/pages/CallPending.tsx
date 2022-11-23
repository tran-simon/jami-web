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

import { Box, CircularProgress, Grid, IconButtonProps, Stack, Typography } from '@mui/material';
import { ComponentType, ReactNode, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CallingAnswerAudioButton,
  CallingAnswerVideoButton,
  CallingCancelButton,
  CallingRefuseButton,
} from '../components/CallButtons';
import { ConversationContext } from '../contexts/ConversationProvider';

export type CallPendingProps = {
  pending: PendingStatus;
  caller?: CallerStatus;
  medium?: CommunicationMedium;
};

type PendingStatus = 'caller' | 'receiver';
type CallerStatus = 'calling' | 'connecting';
type CommunicationMedium = 'audio' | 'video';

export const CallPending = (props: CallPendingProps) => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      spacing={4}
      flexGrow={1}
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
            alt="contact profile picture"
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

const CallPendingDetails = ({
  title,
  buttons,
}: {
  title: ReactNode;
  buttons: {
    ButtonComponent: ComponentType<IconButtonProps>;
    title: ReactNode;
  }[];
}) => {
  return (
    <>
      <Typography variant="h1" color="white">
        {title}
      </Typography>
      <Box width="50%">
        <Grid container justifyContent="center">
          {buttons.map(({ ButtonComponent, title: buttonTitle }, i) => (
            <Grid item key={i} xs={4}>
              <Stack direction="column" alignItems="center" spacing={1} sx={{}}>
                <ButtonComponent color="inherit" size="large" />
                <Typography variant="body2" color="white" sx={{ opacity: 0.75 }}>
                  {buttonTitle}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export const CallPendingCallerInterface = ({ caller }: CallPendingProps) => {
  const { t } = useTranslation();
  const { conversation } = useContext(ConversationContext);
  const memberName = useMemo(() => conversation.getFirstMember().contact.getRegisteredName(), [conversation]);

  return (
    <CallPendingDetails
      title={
        caller === 'calling'
          ? t('calling', {
              member0: memberName,
            })
          : t('connecting')
      }
      buttons={[
        {
          ButtonComponent: CallingCancelButton,
          title: t('end_call'),
        },
      ]}
    />
  );
};

export const CallPendingReceiverInterface = ({ medium, caller }: CallPendingProps) => {
  const { t } = useTranslation();
  const { conversation } = useContext(ConversationContext);
  const memberName = useMemo(() => conversation.getFirstMember().contact.getRegisteredName(), [conversation]);

  return (
    <CallPendingDetails
      title={
        caller === 'connecting'
          ? t('connecting')
          : t('incoming_call', {
              context: medium,
              member0: memberName,
            })
      }
      buttons={[
        {
          ButtonComponent: CallingRefuseButton,
          title: t('refuse_call'),
        },
        {
          ButtonComponent: CallingAnswerAudioButton,
          title: t('accept_call_audio'),
        },
        {
          ButtonComponent: CallingAnswerVideoButton,
          title: t('accept_call_video'),
        },
      ]}
    />
  );
};
