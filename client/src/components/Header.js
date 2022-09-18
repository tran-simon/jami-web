import { useState } from 'react'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import { useNavigate, useParams } from "react-router-dom"
import authManager from '../AuthManager'

export default function Header() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const params = useParams()

  const goToAccountSelection = () => navigate(`/account`)
  const goToContacts = () => navigate(`/Contacts`)
  const goToAccountSettings = () => navigate(`/account/${params.accountId}/settings`)

  return (
    <Box>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        Menu
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={goToAccountSelection}>Change account</MenuItem>
        <MenuItem onClick={goToContacts}>Contacts</MenuItem>
        {params.accountId && <MenuItem onClick={goToAccountSettings}>Account settings</MenuItem>}
        <MenuItem onClick={() => authManager.disconnect()}>Log out</MenuItem>
      </Menu>
      </Box>
  )
}