import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
//import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import authManager from '../AuthManager'

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © 2016-'}{new Date().getFullYear()}{' Savoir-faire Linux Inc.'}
            <Link color="inherit" href="https://jami.net/">
                Jami.net
        </Link>{' '}
            {'.'}
        </Typography>
    );
}

/*const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));*/

/*function SignIn() {
    const classes = useStyles();


}*/

/*
    TODO:
    Use useState to handle username password and redirect states to render this page to
    comply with material-ui usage of useStyles
    Src: https://blog.logrocket.com/a-guide-to-usestate-in-react-ecb9952e406c/
*/

class SignInPage extends React.Component {

    constructor(props) {
        console.log("SignInPage " + props.open)
        super(props)
        this.state = {
            /*username: '',
            password: '',
            redirect: false,
            session: null,*/
            submitted: false,
            loading: false/*,
            error: false,
            open: false,
            errorMessage: ''*/
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.localLogin = this.localLogin.bind(this);
    }

    handleusername(text) {
        this.setState({ username: text.target.value })
    }

    handlePassword(text) {
        this.setState({ password: text.target.value })
    }

    localLogin() {
        this.setState({
            submitted: true,
            loading: true
        })
        authManager.authenticate()
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
        let obj = {}
        obj.username = this.state.username;
        obj.password = this.state.password;

        this.setState({
            submitted: true,
            loading: true
        })

        fetch('/api/login?username=' + obj.username + '&password=' + obj.password,
            {
                header: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                credentials: 'same-origin'
                //body: JSON.stringify({ obj })
            }
        ).then((res) => {
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
        })
    }

    render() {
        console.log("SignInPage render " + this.props.open)
        return (
            <Dialog open={this.props.open}>
                <DialogTitle>Se connecter</DialogTitle>
                <DialogContent>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className=""/*{classes.submit}*/
                        onClick={() => { this.localLogin() }}
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
                        onChange={(text) => { this.handleusername(text) }}
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
                        onChange={(text) => { this.handlePassword(text) }}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Se rapeller de moi"
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        type="submit"
                        size="medium"
                        onClick={this.handleSubmit}
                    >
                        Se connecter
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}


export default SignInPage;