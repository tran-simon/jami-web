import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, InputBase, Paper } from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send';

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
    const classes = useStyles();

    const handleSubmit = e => {
        e.preventDefault()
    }

    return (
        <div className="send-message-form">
        <Paper component="form"
            onSubmit={handleSubmit}
            className="send-message-card"
            className={classes.root}>
            <InputBase
                className={classes.input}
                placeholder="Write something nice"
                height="35"
            />
            <IconButton type="submit" className={classes.iconButton} aria-label="search">
                <SendIcon />
            </IconButton>
        </Paper>
        </div>
    )
}
