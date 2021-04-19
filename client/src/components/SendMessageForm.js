import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, InputBase, Paper, Popper } from '@material-ui/core'
import { Send, EmojiEmotionsRounded } from '@material-ui/icons'
import EmojiPicker from 'emoji-picker-react'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 16,
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default function SendMessageForm(props) {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [currentMessage, setCurrentMessage] = React.useState("")

  const handleOpenEmojiPicker = e => {
    setAnchorEl(anchorEl ? null : e.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleSubmit = e => {
    e.preventDefault()
  }
  const handleInputChange = (event) => {
    setCurrentMessage(event.target.value);
  };
  const onEmojiClick = (e, emojiObject) => {
    console.log(emojiObject.emoji)
    setCurrentMessage(currentMessage + emojiObject.emoji)
    handleClose()
  }
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div className="send-message-form">
      <Paper component="form"
        onSubmit={handleSubmit}
        className="send-message-card"
        className={classes.root}>
        <IconButton aria-describedby={id} variant="contained" color="primary" onClick={handleOpenEmojiPicker}>
          <EmojiEmotionsRounded />
        </IconButton>
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
        >
          <EmojiPicker.default
            onEmojiClick={onEmojiClick}
            disableAutoFocus={true}
            disableSkinTonePicker={true}
            native
          />
        </Popper>

        <InputBase
          className={classes.input}
          placeholder="Write something nice"
          height="35"
          value={currentMessage}
          onChange={handleInputChange}
        />
        <IconButton type="submit" className={classes.iconButton} aria-label="search">
          <Send />
        </IconButton>
      </Paper>
    </div>
  )
}
