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
import { Box } from '@mui/material';
import { useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { useNavigate } from 'react-router-dom';

import { useCallContext } from '../contexts/CallProvider';
import { useWebRtcContext } from '../contexts/WebRtcProvider';
import { VideoElementWithSinkId } from '../utils/utils';
import VideoStream, { VideoStreamProps } from './VideoStream';

type Size = 'small' | 'medium' | 'large';
export type VideoOverlayProps = VideoStreamProps & {
  onClick?: DraggableEventHandler;
  size?: Size;
};

const sizeToDimentions: Record<Size, string> = {
  small: '25%',
  medium: '50%',
  large: '75%',
};

const VideoOverlay = ({ onClick, size = 'medium', ...props }: VideoOverlayProps) => {
  const videoRef = useRef<VideoElementWithSinkId | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <Box position="relative" width="100%" height="100%">
      <Draggable
        onDrag={() => setDragging(true)}
        onStop={(...args) => {
          if (!dragging && onClick) {
            onClick(...args);
          }

          setDragging(false);
        }}
        bounds="parent"
        nodeRef={videoRef}
      >
        <VideoStream
          ref={videoRef}
          {...props}
          style={{
            position: 'absolute',
            right: 0,
            borderRadius: '12px',
            maxHeight: sizeToDimentions[size],
            maxWidth: sizeToDimentions[size],
            zIndex: 2,
            transition: 'max-width, max-height .2s ease-in-out',
            ...props.style,
          }}
        />
      </Draggable>
    </Box>
  );
};

export const RemoteVideoOverlay = ({ callConversationId }: { callConversationId: string }) => {
  const { remoteStreams } = useWebRtcContext();
  const {
    currentMediaDeviceIds: {
      audiooutput: { id: audioOutDeviceId },
    },
  } = useCallContext();
  const navigate = useNavigate();

  // TODO: For now, `remoteStream` is the first remote stream in the array.
  //       There should only be one in the array, but we should make sure this is right.
  const stream = remoteStreams?.at(0);

  return (
    <Box position="absolute" width="100%" height="100%" display="flex">
      <Box margin={2} flexGrow={1}>
        <VideoOverlay
          stream={stream}
          audioOutDeviceId={audioOutDeviceId}
          onClick={() => {
            navigate(`/conversation/${callConversationId}`);
          }}
          size={'small'}
        />
      </Box>
    </Box>
  );
};

export default VideoOverlay;
