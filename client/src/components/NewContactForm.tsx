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
import { SearchRounded } from '@mui/icons-material';
import { InputAdornment, InputBase } from '@mui/material';
import { ChangeEvent, useContext, useState } from 'react';

import { MessengerContext } from '../contexts/MessengerProvider';

export default function NewContactForm() {
  const { setSearchQuery } = useContext(MessengerContext);
  const [value, setValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setSearchQuery(event.target.value);
  };

  return (
    <form className="main-search" noValidate autoComplete="off">
      <InputBase
        className="main-search-input"
        type="search"
        placeholder="Ajouter un contact"
        value={value}
        onChange={handleChange}
        startAdornment={
          <InputAdornment position="start">
            <SearchRounded />
          </InputAdornment>
        }
      />
    </form>
  );
}
