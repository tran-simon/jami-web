import React from 'react';
import { Box, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    fontSize: 14,
  }, pos: {
    fontSize: 14,

  }
});

export default function JamiIdCard(props) {
  const classes = useStyles()
  const account = props.account
  const registeredName = account.getRegisteredName()
  return <Card style={{marginBottom:16}}>
      <CardContent>
        <Box>
        <Typography className={classes.title} color="textSecondary">
          Jami ID
        </Typography>
          <Typography variant="h5" component="h2" gutterBottom noWrap>{account.getUri()}</Typography>
        </Box>
        {registeredName && <Box>
          <Typography className={classes.title} color="textSecondary" >
          Jami username
        </Typography>
            <Typography variant="h5" component="h2" noWrap>{registeredName}</Typography>
          </Box>
        }
      </CardContent>
    </Card>
}
