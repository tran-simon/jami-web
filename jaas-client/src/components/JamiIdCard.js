import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

class JamiIdCard extends React.Component {
  render() {
    const account = this.props.account
    const registeredName = account.getRegisteredName()
    return (
        <Card style={{marginBottom:16}}>
          <CardContent>
            <Typography variant="h6">Jami key ID</Typography>
            <Typography variant="body1">{account.getUri()}</Typography>
            {registeredName && <div>
                <Typography variant="h6">Jami username</Typography>
                <Typography variant="body1">{registeredName}</Typography></div>
            }
          </CardContent>
        </Card>)
  }
}

export default JamiIdCard;