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
import { Menu, MenuProps, PopoverPosition, PopoverReference, styled } from '@mui/material';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';

import PopoverList, { PopoverListItemData } from './PopoverList';

export interface ContextMenuHandler {
  props: {
    open: boolean;
    onClose: () => void;
    anchorPosition: PopoverPosition | undefined;
    anchorReference: PopoverReference | undefined;
  };
  handleAnchorPosition: MouseEventHandler;
}

export const useContextMenuHandler = (): ContextMenuHandler => {
  const [anchorPosition, setAnchorPosition] = useState<PopoverPosition | undefined>(undefined);

  const handleAnchorPosition = useCallback<MouseEventHandler>(
    (event) => {
      event.preventDefault();
      setAnchorPosition((anchorPosition) =>
        anchorPosition === undefined ? { top: event.clientY, left: event.clientX } : undefined
      );
    },
    [setAnchorPosition]
  );

  const onClose = useCallback(() => setAnchorPosition(undefined), [setAnchorPosition]);

  return useMemo(
    () => ({
      props: {
        open: !!anchorPosition,
        onClose,
        anchorPosition,
        anchorReference: 'anchorPosition',
      },
      handleAnchorPosition,
    }),
    [anchorPosition, handleAnchorPosition, onClose]
  );
};

interface ContextMenuProps extends MenuProps {
  items: PopoverListItemData[];
}

const ContextMenu = styled(({ items, ...props }: ContextMenuProps) => (
  <Menu {...props}>
    <PopoverList items={items} onClose={props.onClose} />
  </Menu>
))(() => ({
  '& .MuiPaper-root': {
    borderRadius: '5px 20px 20px 20px',
    boxShadow: '3px 3px 7px #00000029',
  },
  '& .MuiMenu-list': {
    padding: '0px',
  },
}));

export default ContextMenu;
