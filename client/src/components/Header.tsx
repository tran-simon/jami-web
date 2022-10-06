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
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import authManager from '../AuthManager';

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const params = useParams();

  const goToAccountSelection = () => navigate(`/account`);
  const goToContacts = () => navigate(`/Contacts`);
  const goToAccountSettings = () => navigate(`/account/${params.accountId}/settings`);

  return (
    <Box>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        Menu
      </Button>
      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={goToAccountSelection}>Change account</MenuItem>
        <MenuItem onClick={goToContacts}>Contacts</MenuItem>
        {params.accountId && <MenuItem onClick={goToAccountSettings}>Account settings</MenuItem>}
        <MenuItem onClick={() => authManager.disconnect()}>Log out</MenuItem>
      </Menu>
    </Box>
  );
}
