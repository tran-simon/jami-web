import { Component } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import authManager from '../AuthManager';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © 2016-'}
      {new Date().getFullYear()}
      {' Savoir-faire Linux Inc.'}
      <Link color="inherit" href="https://jami.net/">
        Jami.net
      </Link>{' '}
      {'.'}
    </Typography>
  );
}

class SignInPage extends Component {
  constructor(props) {
    console.log('SignInPage ' + props.open);
    super(props);
    this.state = {
      submitted: false,
      loading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.localLogin = this.localLogin.bind(this);
  }

  handleusername(text) {
    this.setState({ username: text.target.value });
  }

  handlePassword(text) {
    this.setState({ password: text.target.value });
  }

  localLogin() {
    this.setState({
      submitted: true,
      loading: true,
    });
    authManager.authenticate('admin', 'admin');
    /*fetch('/api/localLogin?username=none&password=none', {
            header: { "Content-Type": "application/json" },
            method: "POST",
            credentials: 'same-origin'
            //body: JSON.stringify({ obj })
        })
            .then((res) => {
                if (res.status === '200') {
                    this.setState({
                        redirect: true
                    });
                } else if (res.status === '401') {
                    this.setState({
                        loading: false,
                        error: true,
                        open: true,
                        errorMessage: "Wrong credentials! Your are not allowed to connect"
                    })
                }
                //this.setState({ session: res });
            }).catch((e) => {
                this.setState({
                    loading: false,
                    error: true,
                    open: true,
                    errorMessage: e.toString()
                })
            })*/
  }

  handleSubmit(event) {
    event.preventDefault();
    let obj = {};
    obj.username = this.state.username;
    obj.password = this.state.password;

    this.setState({
      submitted: true,
      loading: true,
    });

    fetch('/api/login?username=' + obj.username + '&password=' + obj.password, {
      header: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      credentials: 'same-origin',
      //body: JSON.stringify({ obj })
    })
      .then((res) => {
        if (res.status === '200') {
          this.setState({
            redirect: true,
          });
        } else if (res.status === '401') {
          this.setState({
            loading: false,
            error: true,
            open: true,
            errorMessage: 'Wrong credentials! Your are not allowed to connect',
          });
        }
        //this.setState({ session: res });
      })
      .catch((e) => {
        this.setState({
          loading: false,
          error: true,
          open: true,
          errorMessage: e.toString(),
        });
      });
  }

  render() {
    console.log('SignInPage render ' + this.props.open);
    return (
      <Dialog open={this.props.open}>
        <DialogTitle>Se connecter</DialogTitle>
        <DialogContent>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="" /*{classes.submit}*/
            onClick={() => {
              this.localLogin();
            }}
          >
            Compte local
          </Button>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="LDAP Savoir-faire Linux"
            name="username"
            autoComplete="email"
            autoFocus
            onChange={(text) => {
              this.handleusername(text);
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(text) => {
              this.handlePassword(text);
            }}
          />
          <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Se rapeller de moi" />
        </DialogContent>

        <DialogActions>
          <Button type="submit" size="medium" onClick={this.handleSubmit}>
            Se connecter
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default SignInPage;
