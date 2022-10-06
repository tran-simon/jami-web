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
import { ChangeEvent, FormEvent, useState } from 'react';

type NewContactFormProps = {
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
};

export default function NewContactForm(props: NewContactFormProps) {
  const [value, setValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (props.onChange) props.onChange(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value && props.onSubmit) props.onSubmit(value);
  };

  return (
    <form className="main-search" onSubmit={handleSubmit} noValidate autoComplete="off">
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
