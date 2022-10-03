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
