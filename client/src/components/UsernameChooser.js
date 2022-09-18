import { useEffect, useState } from 'react'
import usePromise from "react-fetch-hook/usePromise"
import { InputAdornment, TextField } from '@mui/material'
import { SearchRounded } from '@mui/icons-material'
import authManager from '../AuthManager'

const isInputValid = input => input && input.length > 2

export default function UsernameChooser(props) {
  const [query, setQuery] = useState('')

  const { isLoading, data, error } = usePromise(() => isInputValid(query) ? authManager.fetch(`/api/ns/name/${query}`)
    .then(res => {
      if (res.status === 200)
        return res.json()
      else throw res.status
    }) : new Promise((res, rej) => rej(400)),
    [query])

  useEffect(() => {
    if (!isLoading) {
      if (error === 404)
        props.setName(query)
      else
        props.setName('')
    }
  }, [query, isLoading, data, error])

  const handleChange = event => setQuery(event.target.value)

  return (
      <TextField
        className="main-search-input"
        type="search"
        placeholder="Register a unique name"
        error={!error}
        label={isLoading ? 'Searching...' : (error && error !== 400 ? 'This name is available' : (data && data.address ? 'This name is not available' : ''))}
        value={query}
        disabled={props.disabled}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchRounded /></InputAdornment>
          )
        }}
      />
  )
}
