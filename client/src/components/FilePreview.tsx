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
import { AttachFile } from '@mui/icons-material';
import { IconButton, IconButtonProps, Stack, Typography } from '@mui/material';
import * as mime from 'mime';
import { useRef } from 'react';

import { FileHandler } from '../utils/files';
import { useDataSizeUnits } from '../utils/units';
import { SaltireIcon } from './SvgIcon';

interface FilePreviewIconProps {
  fileHandler: FileHandler;
  size: string;
}

const FilePreviewIcon = ({ fileHandler, size }: FilePreviewIconProps) => {
  if (fileHandler.file.type.split('/')[0] === 'image') {
    return (
      <img
        src={fileHandler.url}
        alt={fileHandler.file.name}
        style={{ height: size, width: size, objectFit: 'cover' }}
      />
    );
  }

  const paddedSize = parseInt(size) * 0.8 + 'px';
  return <AttachFile sx={{ fontSize: paddedSize }} />;
};

interface FilePreviewInfosProps {
  fileHandler: FileHandler;
}

const FilePreviewInfos = ({ fileHandler }: FilePreviewInfosProps) => {
  const file = fileHandler.file;
  const fileSize = useDataSizeUnits(file.size);
  const fileType = mime.getExtension(file.type)?.toUpperCase() || '';
  return (
    <Stack overflow="hidden">
      <Typography variant="body1" fontWeight="bold" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {file.name}
      </Typography>
      <Typography variant="body1">{`${fileType} ${fileSize}`}</Typography>
    </Stack>
  );
};

const RemoveButton = (props: IconButtonProps) => {
  const removeButtonSize = '24px';
  const paddingPart = 0.25;
  return (
    <IconButton
      {...props}
      aria-label="remove file"
      disableRipple={true}
      sx={{
        position: 'absolute',
        height: removeButtonSize,
        width: removeButtonSize,
        right: -parseInt(removeButtonSize) * paddingPart + 'px',
        top: -parseInt(removeButtonSize) * paddingPart + 'px',
        fontSize: parseInt(removeButtonSize) * paddingPart * 2 + 'px',
        color: 'black',
        backgroundColor: 'white',
        borderRadius: '100%',
        boxShadow: '3px 3px 7px #00000029',
        '&:hover': {
          background: (theme) => theme.palette.primary.light,
        },
      }}
    >
      <SaltireIcon fontSize="inherit" />
    </IconButton>
  );
};

interface FilePreviewDeletableProps {
  fileHandler: FileHandler;
  remove: () => void;
  borderColor: string;
}

export const FilePreviewRemovable = ({ fileHandler, remove, borderColor }: FilePreviewDeletableProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const iconSize = '57px';

  return (
    <Stack
      direction="row"
      sx={{
        flex: '1 1 200px',
        minWidth: '100px',
        maxWidth: '300px',
        cursor: 'pointer',
      }}
      onClick={() => linkRef.current?.click()}
    >
      <a ref={linkRef} href={fileHandler.url} download hidden />
      <Stack
        sx={{
          position: 'relative',
          height: iconSize,
          width: iconSize,
          minWidth: iconSize,
          marginRight: '16px',
          borderRadius: '5px',
          borderWidth: '3px',
          borderColor: borderColor,
          borderStyle: 'solid',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <RemoveButton
          onClick={(e) => {
            // Prevent the parent's link to be triggered
            e.preventDefault();
            e.stopPropagation();
            remove();
          }}
        />
        <FilePreviewIcon fileHandler={fileHandler} size={iconSize} />
      </Stack>
      <FilePreviewInfos fileHandler={fileHandler} />
    </Stack>
  );
};
