'use strict'

import dotenv from 'dotenv'
dotenv.config()

import { promises as fs } from 'fs'
import http from 'http'
import express from 'express'
import session from 'express-session'
//const cookieParser = require('cookie-parser')
//const io = require('socket.io')(server)
import path from 'path'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
//import { createRequire } from 'module';
//const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const redis = require('redis-url').connect()
//const RedisStore = require('connect-redis')(session)
/*const passportSocketIo = require('passport.socketio')*/

import indexRouter from './routes/index.js'

//const cors = require('cors')

import JamiRestApi from './routes/jami.js'
import JamiDaemon from './JamiDaemon.js'

const configPath = 'jamiServerConfig.json'

//const sessionStore = new RedisStore({ client: redis })
const sessionStore = new session.MemoryStore()

const loadConfig = async (filePath) => {
    const config = {users: {}, authMethods: []}
    try {
        return Object.assign(config, JSON.parse(await fs.readFile(filePath)))
    } catch(e) {
        console.log(e)
        return config
    }
}

const saveConfig = (filePath, config) => {
    return fs.writeFile(filePath, JSON.stringify(config))
}

/*
Share sessions between Passport.js and Socket.io
*/

function logSuccess() {
    console.log("passportSocketIo authorized user with Success 😁")
}

function logFail() {
    console.log("passportSocketIo failed to authorized user 👺")
}

/*

tempAccounts holds users accounts while tempting to authenticate them on Jams.
connectedUsers  holds users accounts after they got authenticated by Jams.

Users should be removed from connectedUsers when receiving a disconnect
web socket call

*/
const tempAccounts = {}
const connectedUsers = {}

const createServer = async (appConfig) => {
    const app = express()
    console.log(`Loading server for ${app.get('env')} with config:`)
    console.log(appConfig)
    const development = app.get('env') === 'development'

    if (development) {
        const [ webpack, webpackDev, webpackHot, webpackConfig ] = await Promise.all([
            import('webpack'),
            import('webpack-dev-middleware'),
            import('webpack-hot-middleware'),
            import('./client/webpack.config.js')
        ])
        const compiler = webpack.default(webpackConfig.default)
        app.use(webpackDev.default(compiler, {
            publicPath: webpackConfig.default.output.publicPath
        }))
        app.use(webpackHot.default(compiler))
    }

    /*
        Configuation for Passeport Js
    */
    app.disable('x-powered-by')

    app.use(session({
        store: sessionStore,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,//!development,
            maxAge: 2419200000
        },
        secret: process.env.SECRET_KEY_BASE
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    // app.use(app.router)
    //app.use(cors())

    const jami = new JamiDaemon()
    const apiRouter = new JamiRestApi(jami).getRouter()

    /*
    io.use(passportSocketIo.authorize({
        key: 'connect.sid',
        secret: process.env.SECRET_KEY_BASE,
        store: sessionStore,
        passport: passport,
        cookieParser: cookieParser,
        //success: logSuccess(),
        // fail: logFail(),
    }))
    */

    const isSetupComplete = () => {
        return 'admin' in appConfig.users
    }

    const accountFilter = filter => {
        if (typeof filter === 'string') {
            if (filter === '*')
                return undefined
            else
                return account => account.getId() === filter
        } else if (Array.isArray(filter)) {
            return account => filter.includes(account.getId())
        } else {
            throw new Error('Invalid account filter string')
        }
    }

    const user = (id, config) => {
        return {
            id,
            config,
            username: config.username || id,
            accountFilter: accountFilter(config.accounts)
        }
    }

    passport.serializeUser((user, done) => {
        connectedUsers[user.id] = user.config
        console.log("=============================SerializeUser called " + user.id)
        console.log(user)
        done(null, user.id)
    })

    const deserializeUser = (id, done) => {
        console.log("=============================DeserializeUser called on: " + id)
        const userConfig = connectedUsers[id]
        console.log(userConfig)
        if (userConfig) {
            done(null, user(id, userConfig))
        } else
            done(404, null)
    }
    passport.deserializeUser(deserializeUser)

    const jamsStrategy = new LocalStrategy(
        (username, password, done) => {
            const accountId = jami.addAccount({
                'managerUri': 'https://jams.savoirfairelinux.com',
                'managerUsername': username,
                'archivePassword': password
            })
            const id = `jams_${username}`
            const userConfig = { username, type: 'jams', accounts: accountId }
            const newUser = user(id, userConfig)
            console.log("AccountId: " + accountId)
            tempAccounts[accountId] = { done, newUser }

        }
    )
    jamsStrategy.name = "jams"

    const localStrategy = new LocalStrategy(
        (username, password, done) => {
            console.log("localStrategy: " + username + " " + password)

            const id = username
            const userConfig = appConfig.users[username]
            if (!userConfig) {
                return done(null, false, { message: 'Incorrect username.' })
            }
            if (userConfig.password !== password) {
                return done(null, false, { message: 'Incorrect password.' })
            }
            userConfig.type = 'local'

            done(null, user(id, userConfig))
        }
    )

    passport.use(jamsStrategy)
    passport.use(localStrategy)

    const secured = (req, res, next) => {
        if (req.user) {
            return next()
        }
        res.status(401).end()
    }
    const securedRedirect = (req, res, next) => {
        if (req.user && req.user.accountId) {
            return next()
        }
        req.session.returnTo = req.originalUrl
        res.redirect('/login')
    }

    app.use(express.json())
    app.post('/setup', (req, res) => {
        if (isSetupComplete()) {
            return res.status(404).end()
        }
        if (!req.body.password) {
            return res.status(400).end()
        }
        console.log(req.body)
        appConfig.users.admin = {
            "accounts": "*",
            password: req.body.password
        }
        res.status(200).end()
        saveConfig(configPath, appConfig)
    })
    app.post('/auth/jams', passport.authenticate('jams'), (req, res) => {
        res.json({ loggedin: true })
    })
    app.post('/auth/local', passport.authenticate('local'), (req, res) => {
        res.json({ loggedin: true, user: req.user.id })
    })
    app.get('/auth', (req, res) => {
        if (req.user) {
            res.json({ loggedin: true, username: req.user.username, type: req.user.type })
        } else if (isSetupComplete()) {
            res.status(401).json({})
        } else {
            res.status(401).json({ setupComplete: false })
        }
    })

    app.use('/api', secured, apiRouter)

    app.use('/', indexRouter)

    /* GET React App */

    app.use(express.static(path.join(__dirname, 'client', 'dist')))

    app.use((req, res, next) => {
        res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
    })

    return http.Server(app)
}

loadConfig(configPath)
    .then(createServer)
    .then(server => {
        server.listen(3000)
    })

/*
io.on('connection', (socket) => {
    console.log("Client just connected !")
    socket.on('SendMessage', (data) => {
        console.log("Message " + data.text + " sent to " + data.destinationId + " by " + socket.session.user.accountId)
        const msgMap = new jami.dring.StringMap()
        msgMap.set('text/plain', data.text)
        jami.dring.sendAccountTextMessage(socket.session.user.accountId, data.destinationId, msgMap)
    })
})

io.use((socket, next) => {
    cookieParser(socket.handshake, {}, (err) => {
        if (err) {
            console.log("error in parsing cookie")
            return next(err)
        }
        if (!socket.handshake.signedCookies) {
            console.log("no secureCookies|signedCookies found")
            return next(new Error("no secureCookies found"))
        }
        sessionStore.get(socket.handshake.signedCookies["connect.sid"], (err, session) => {
            socket.session = session
            if (!err && !session) err = new Error('session not found')
            if (err) {
                console.log('failed connection to socket.io:', err)
            } else {
                console.log(session)
                console.log('successful connection to socket.io ' + session.passport.user)
                const userKey = session.passport.user
                deserializeUser(userKey, (err, user) => {
                    console.log("deserializeUser: " + user)
                    if (err)
                        return next(err, true)
                    if (!user)
                        return next("User not found", false)

                    console.log("User associated socket id: " + socket.id)
                    user.socketId = socket.id
                    socket.session.user = user
                    console.log("User added to session --------> " + user.accountId)
                    //auth.success(data, accept)
                    next(err, true)
                })
            }
        })
    })
})
*/
