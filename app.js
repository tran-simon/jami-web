require('dotenv/config');

const express = require('express')
const app = express();
const server = require('http').Server(app);
const session = require('express-session')
const io = require('socket.io')(server);
const path = require('path');

//const redis = require('redis')
const redis = require('redis-url').connect();
const RedisStore = require('connect-redis')(session)
/*var passportSocketIo = require('passport.socketio');*/
//const cookieParser = require('cookie-parser');
const cookieParser = require('cookie-parser')(process.env.SECRET_KEY_BASE); // <- your secret here

var indexRouter = require('./routes/index');
//const cors = require('cors')

var parser = require('fast-xml-parser');

const RingDaemon = require('./RingDaemon.js');
const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

const sessionStore = new RedisStore({ client: redis });


/*
    Configuation for Passeport Js
*/

// app.use(express.static('public'));
// app.use(cookieParser());
// app.use(bodyParser());
app.use(session({
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
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

const callbackMap = {
    "IncomingAccountMessage": (accountId, from, message) => {
        console.log("Received message: " + accountId + " " + from + " " + message["text/plain"]);

        if (parser.validate(message["text/plain"]) === true) {
            console.log(message["text/plain"]);
        } else {

            user = connectedUsers[accountId];
            console.log(user.socketId)
            io.to(user.socketId).emit('receivedMessage', message["text/plain"]);
            //io.emit('receivedMessage', message["text/plain"]);
        }
    },
    "RegistrationStateChanged": (accountId, state, /*int*/ code, detail) => {
        console.log("RegistrationStateChanged: " + accountId + " " + state + " " + code + " " + detail);
        if (state === "REGISTERED") {
            if (tempAccounts[accountId]) {

                const ctx = tempAccounts[accountId];
                ctx.newUser.accountId = accountId;
                ctx.newUser.jamiId = jami.dring.getAccountDetails(accountId).get("Account.username");
                //connectedUsers[accountId] = ctx.newUser;
                ctx.done(null, ctx.newUser);
                delete tempAccounts[accountId];
            }
        } else if (state === "ERROR_AUTH") {
            done(null, false);
            //remove account
        }
    }
}
const jami = new RingDaemon(callbackMap);

passport.serializeUser(function (user, done) {
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

passport.use(new LocalStrategy(
    (username, password, done) => {
        const newUser = {};
        newUser.username = username;
        //newUser.socketid = 

        const template = jami.dring.getAccountTemplate("RING");

        /*
            For test purpose we are not checking if a user can SSO using Jams,
            instead we juste create a new user an get he's or her's newly created accountId
        */
        template.set("Account.managerUri", "https://jams.savoirfairelinux.com");
        template.set("Account.managerUsername", username);
        template.set("Account.archivePassword", password);

        const accountId = jami.dring.addAccount(template);

        const newProps = jami.getAccountDetails(accountId);
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
));

app.post('/api/login', passport.authenticate('local'), function (req, res) {
    res.json({ loggedin: true });
});
app.use('/', indexRouter);

/* GET React App */

app.use(express.static(path.join(__dirname, 'public')))

app.use(function (req, res, next) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(3000);

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
                    /*data[auth.userProperty] = user;
                    data[auth.userProperty].logged_in = true;*/
                    //auth.success(data, accept);
                    next(err, true);
                });
            }
        });
    });
});
