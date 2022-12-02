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
import React, { forwardRef, useEffect, useRef, VideoHTMLAttributes } from 'react';

import { VideoElementWithSinkId } from '../utils/utils';

export type VideoStreamProps = Partial<VideoHTMLAttributes<VideoElementWithSinkId>> & {
  stream: MediaStream | undefined;
  audioOutDeviceId?: string;
};

const VideoStream = forwardRef<VideoElementWithSinkId, VideoStreamProps>(
  ({ stream, audioOutDeviceId, ...props }, ref) => {
    const videoRef = useRef<VideoElementWithSinkId | null>(null);

    useEffect(() => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(videoRef.current);
      } else {
        ref.current = videoRef.current;
      }
    }, [ref]);

    useEffect(() => {
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, [stream, videoRef]);

    useEffect(() => {
      if (!audioOutDeviceId) {
        return;
      }

      if (videoRef.current?.setSinkId) {
        // This only work on chrome and other browsers that support `setSinkId`
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId#browser_compatibility
        videoRef.current.setSinkId(audioOutDeviceId);
      }
    }, [audioOutDeviceId, videoRef]);

    return <video ref={videoRef} autoPlay {...props} />;
  }
);
export default VideoStream;
