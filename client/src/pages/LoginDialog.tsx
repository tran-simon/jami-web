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
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ChangeEvent, Component, MouseEvent } from 'react';

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

type SignInPageProps = {
  open: boolean;
};
type SignInPageState = {
  username?: string;
  password?: string;
  submitted?: boolean;
  loading?: boolean;
  redirect?: boolean;
  error?: boolean;
  open?: boolean;
  errorMessage?: string;
};

class SignInPage extends Component<SignInPageProps, SignInPageState> {
  constructor(props: SignInPageProps) {
    console.log('SignInPage ' + props.open);
    super(props);
    this.state = {
      submitted: false,
      loading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.localLogin = this.localLogin.bind(this);
  }

  handleusername(text: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.setState({ username: text.target.value });
  }

  handlePassword(text: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

  handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const obj = {
      username: this.state.username,
      password: this.state.password,
    };

    this.setState({
      submitted: true,
      loading: true,
    });

    fetch('/api/login?username=' + obj.username + '&password=' + obj.password, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      credentials: 'same-origin',
      //body: JSON.stringify({ obj })
    })
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            redirect: true,
          });
        } else if (res.status === 401) {
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
