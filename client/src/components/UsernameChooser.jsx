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
import { InputAdornment, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import usePromise from 'react-fetch-hook/usePromise';

import { apiUrl } from '../utils/constants.js';

const isInputValid = (input) => input && input.length > 2;

export default function UsernameChooser({ setName, ...props }) {
  const [query, setQuery] = useState('');

  const { isLoading, data, error } = usePromise(
    () =>
      isInputValid(query)
        ? fetch(new URL(`/ns/username/${query}`, apiUrl)).then((res) => {
            if (res.status === 200) return res.json();
            else throw res.status;
          })
        : new Promise((res, rej) => rej(400)),
    [query]
  );

  useEffect(() => {
    if (!isLoading) {
      if (error === 404) setName(query);
      else setName('');
    }
  }, [setName, query, isLoading, data, error]);

  const handleChange = (event) => setQuery(event.target.value);

  return (
    <TextField
      className="main-search-input"
      type="search"
      placeholder="Register a unique name"
      error={!error}
      label={
        isLoading
          ? 'Searching...'
          : error && error !== 400
          ? 'This name is available'
          : data && data.address
          ? 'This name is not available'
          : ''
      }
      value={query}
      disabled={props.disabled}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRounded />
          </InputAdornment>
        ),
      }}
    />
  );
}
