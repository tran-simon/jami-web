import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
//import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';


function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © 2016-'}{new Date().getFullYear()}{' Savoir-faire Linux Inc. GNU '}
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

    constructor() {
        super()
        this.state = {
            username: '',
            password: '',
            redirect: false,
            session: null,
            submitted: false,
            loading: false,
            error: false,
            open: false,
            errorMessage: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleusername(text) {
        this.setState({ username: text.target.value })
    }

    handlePassword(text) {
        this.setState({ password: text.target.value })
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
            if (res.status == '200') {
                this.setState({
                    redirect: true
                });
            } else if (res.status == '401') {
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
        if (this.state.redirect) {
            return <Redirect to="/jaas" />
        }

        return (
            <Container component="main" maxWidth="xs" >
                <CssBaseline />
                <div className=""/*{classes.paper}*/>
                    <Typography component="h1" variant="h5">
                        Se connecter
              </Typography>
                    <form className=""/*{classes.form}*/ onSubmit={this.handleSubmit} >
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className=""/*{classes.submit}*/
                        // onClick={() => { this.login() }}
                        >
                            Se connecter
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Mot de passe oublié ?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="#" variant="body2">
                                    {"Tu n'as pas de compte? Inscris-toi"}
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright />
                </Box>
                {this.state.submitted && this.state.loading && <CircularProgress
                    style={{ position: 'relative' }}
                    size={40}
                    top={10}
                    style={{ marginLeft: '50%' }}
                />}
                {
                    this.state.error && <Dialog aria-labelledby="simple-dialog-title" open={this.state.open} >
                        <DialogTitle id="simple-dialog-title">{this.state.errorMessage}</DialogTitle>
                    </Dialog>
                }
            </Container>
        );
    }
}


export default SignInPage;