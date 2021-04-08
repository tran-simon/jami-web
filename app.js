const env = require('dotenv/config')

const express = require('express')
const http = require('http')
const session = require('express-session')
//const cookieParser = require('cookie-parser')
//const io = require('socket.io')(server)
const path = require('path')
const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy

const redis = require('redis-url').connect()
const RedisStore = require('connect-redis')(session)
/*const passportSocketIo = require('passport.socketio')*/

const indexRouter = require('./routes/index')

//const cors = require('cors')

const parser = require('fast-xml-parser')

const JamiRestApi = require('./routes/jami')
const JamiDaemon = require('./JamiDaemon')

//const sessionStore = new RedisStore({ client: redis })
const sessionStore = new session.MemoryStore()

const app = express()

/*
    Configuation for Passeport Js
*/
//app.use(cookieParser(process.env.SECRET_KEY_BASE));
app.disable('x-powered-by');

app.use(session({
    //store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,//process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
        maxAge: 2419200000
    },
    secret: process.env.SECRET_KEY_BASE
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);
//app.use(cors())

/*
    Share sessions between Passport.js and Socket.io
*/

function logSuccess() {
    console.log("passportSocketIo authorized user with Success 😁");
}

function logFail() {
    console.log("passportSocketIo failed to authorized user 👺");
}

/*
io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: process.env.SECRET_KEY_BASE,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser,
    //success: logSuccess(),
    // fail: logFail(),
}));
*/

/*

    tempAccounts holds users accounts while tempting to authenticate them on Jams.
    connectedUsers  holds users accounts after they got authenticated by Jams.

    Users should be removed from connectedUsers when receiving a disconnect
    web socket call

*/
const tempAccounts = {};
const connectedUsers = {};

const jami = new JamiDaemon();
const apiRouter = new JamiRestApi(jami).getRouter()

passport.serializeUser((user, done) => {
    console.log(user)
    connectedUsers[user.accountId] = user;
    console.log("=============================SerializeUser called " + user.accountId)
    done(null, user.accountId);
});

const deserializeUser = (id, done) => {
    console.log("=============================DeserializeUser called on: " + id + " " + connectedUsers[id])
    done(null, connectedUsers[id]);
};
passport.deserializeUser(deserializeUser);

//var tempAccountId = '';

const jamsStrategy = new LocalStrategy(
    (username, password, done) => {

        const newUser = {};
        newUser.username = username;
        //newUser.socketid =

        const accountId = jami.addAccount({
            'managerUri': 'https://jams.savoirfairelinux.com',
            'managerUsername': username,
            'archivePassword': password
        });

        const newProps = jami.getAccount(accountId).details;
        console.log(newProps);
        //Object.entries(newProps).forEach(v => console.log(v[0], v[1]))
        //tempAccountId = accountId;
        newUser.accountId = accountId;
        console.log("AccountId: " + accountId);
        connectedUsers[accountId] = newUser;
        tempAccounts[accountId] = { done, newUser };

        //return done(null, newUser);

        /*User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });*/
    }
);
jamsStrategy.name = "jams";

const localStrategy = new LocalStrategy(
    (username, password, done) => {
        console.log("localStrategy: " + username + " " + password);

        const newUser = {};
        newUser.accountId = jami.getAccountList()[0].getId();
        console.log("Local AccountId: " + newUser.accountId);
        connectedUsers[newUser.accountId] = newUser;
        done(null, newUser);
    }
);

passport.use(jamsStrategy);
passport.use(localStrategy);

const secured = (req, res, next) => {
    console.log(`isSecured ${req.user}`);
    if (req.user && req.user.accountId) {
        return next();
    }
    res.status(401).end()
};
const securedRedirect = (req, res, next) => {
    if (req.user && req.user.accountId) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
};

app.post('/auth', passport.authenticate('jams'), (req, res) => {
    res.json({ loggedin: true })
});
app.post('/api/localLogin', passport.authenticate('local'), (req, res) => {
    res.json({ loggedin: true })
});

app.use('/api', secured, apiRouter);

app.use('/', indexRouter);

/* GET React App */

app.use(express.static(path.join(__dirname, 'client', 'dist')))

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const server = http.Server(app);
server.listen(3000);

/*
io.on('connection', (socket) => {
    console.log("Client just connected !")
    socket.on('SendMessage', (data) => {
        console.log("Message " + data.text + " sent to " + data.destinationId + " by " + socket.session.user.accountId);
        const msgMap = new jami.dring.StringMap();
        msgMap.set('text/plain', data.text);
        jami.dring.sendAccountTextMessage(socket.session.user.accountId, data.destinationId, msgMap);
    });
});

io.use((socket, next) => {
    cookieParser(socket.handshake, {}, (err) => {
        if (err) {
            console.log("error in parsing cookie");
            return next(err);
        }
        if (!socket.handshake.signedCookies) {
            console.log("no secureCookies|signedCookies found");
            return next(new Error("no secureCookies found"));
        }
        sessionStore.get(socket.handshake.signedCookies["connect.sid"], (err, session) => {
            socket.session = session;
            if (!err && !session) err = new Error('session not found');
            if (err) {
                console.log('failed connection to socket.io:', err);
            } else {
                console.log(session);
                console.log('successful connection to socket.io ' + session.passport.user);
                const userKey = session.passport.user;
                deserializeUser(userKey, (err, user) => {
                    console.log("deserializeUser: " + user)
                    if (err)
                        return next(err, true);
                    if (!user)
                        return next("User not found", false);

                    console.log("User associated socket id: " + socket.id)
                    user.socketId = socket.id;
                    socket.session.user = user;
                    console.log("User added to session --------> " + user.accountId);
                    //auth.success(data, accept);
                    next(err, true);
                });
            }
        });
    });
});
*/
