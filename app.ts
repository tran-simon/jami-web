'use strict'

import dotenv from 'dotenv'
const env = dotenv.config()

import { promises as fs } from 'fs'
import http from 'http'
import express, {NextFunction, Response, Request} from 'express'
import session from 'express-session'
import cookieParser  from'cookie-parser'
import {Server, Socket} from 'socket.io'
import path from 'path'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
//import { createRequire } from 'module';
//const require = createRequire(import.meta.url);

//const redis = require('redis-url').connect()
//const RedisStore = require('connect-redis')(session)
/*const passportSocketIo = require('passport.socketio')*/

import indexRouter from './routes/index.js'

import cors from 'cors'

import JamiRestApi from './routes/jami.js'
import JamiDaemon from './JamiDaemon.js'
import Account from "./model/Account";
import {ExtendedError} from "socket.io/dist/namespace";
// import { sentrySetUp } from './sentry.js'

const configPath = 'jamiServerConfig.json'

//const sessionStore = new RedisStore({ client: redis })
const sessionStore = new session.MemoryStore()

interface UserConfig {
  accounts: string;
  password?: string;
  username?: string;
  type?: string
}

interface AppConfig {
  users: Record<string, UserConfig>
  authMethods: any[]
}

const loadConfig = async (filePath: string): Promise<AppConfig> => {
    const config = {users: {}, authMethods: []}
    try {
        return Object.assign(config, JSON.parse((await fs.readFile(filePath)).toString()))
    } catch(e) {
        console.log(e)
        return config
    }
}

const saveConfig = (filePath: string, config: AppConfig) => {
    return fs.writeFile(filePath, JSON.stringify(config))
}

/*
Share sessions between Passport.js and Socket.io
*/

function logSuccess() {
    console.log('passportSocketIo authorized user with Success 😁')
}

function logFail() {
    console.log('passportSocketIo failed to authorized user 👺')
}

/*

tempAccounts holds users accounts while tempting to authenticate them on Jams.
connectedUsers  holds users accounts after they got authenticated by Jams.

Users should be removed from connectedUsers when receiving a disconnect
web socket call

*/
const tempAccounts: Record<string, any> = {}
const connectedUsers: Record<string, any> = {}

const createServer = async (appConfig: AppConfig) => {
    const node_env = process.env.NODE_ENV || 'development'
    const app = express()
    console.log(`Loading server for ${node_env} with config:`)
    console.log(appConfig)

    var corsOptions = {
        origin: 'http://127.0.0.1:3000'
    }

    if (node_env === 'development') {
        const webpack = await import('webpack')
        const webpackDev = await import('webpack-dev-middleware')
        const webpackHot = await import ('webpack-hot-middleware')
        const {default: webpackConfig} = await import('jami-web-client/webpack.config.js')

        const compiler = webpack.default(webpackConfig)
        app.use(webpackDev.default(compiler, {
            publicPath: webpackConfig.output?.publicPath
        }))
        app.use(webpackHot.default(compiler))
    }

    /*
        Configuation for Passeport Js
    */
    app.disable('x-powered-by')

    const secret_key = process.env.SECRET_KEY_BASE;

    if (!secret_key) {
        throw new Error("SECRET_KEY_BASE undefined")
    }

    const sessionMiddleware = session({
        store: sessionStore,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,//!development,
            maxAge: 2419200000
        },
        secret: secret_key
    });

    app.use(sessionMiddleware)
    app.use(passport.initialize())
    app.use(passport.session())
    // app.use(app.router)
    app.use(cors(corsOptions))

    const jami = new JamiDaemon((account: Account, conversation: any, message: any) => {
        console.log('JamiDaemon onMessage')

        if (conversation.listeners) {
            Object.values(conversation.listeners).forEach((listener: any) => {
                listener.socket.emit('newMessage', message)
            })
        }
    })
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

    const accountFilter = (filter: string | any[]) => {
        if (typeof filter === 'string') {
            if (filter === '*')
                return undefined
            else
                return (account: Account) => account.getId() === filter
        } else if (Array.isArray(filter)) {
            return (account: Account) => filter.includes(account.getId())
        } else {
            throw new Error('Invalid account filter string')
        }
    }

    const user = (id: string, config: UserConfig) => {
        return {
            id,
            config,
            username: config.username || id,
            accountFilter: accountFilter(config.accounts)
        }
    }

    passport.serializeUser((user: any, done) => {
        connectedUsers[user.id] = user.config
        console.log('=============================SerializeUser called ' + user.id)
        console.log(user)
        done(null, user.id)
    })

    const deserializeUser = (id: string, done: (err: any, user?: Express.User | false | null) => void) => {
        console.log('=============================DeserializeUser called on: ' + id)
        const userConfig = connectedUsers[id]
        console.log(userConfig)
        if (userConfig) {
            done(null, user(id, userConfig))
        } else
            done(404, null)
    }
    passport.deserializeUser(deserializeUser)

    const jamsStrategy = new LocalStrategy(
        async (username, password, done) => {
            const accountId = await jami.addAccount({
                'managerUri': 'https://jams.savoirfairelinux.com',
                'managerUsername': username,
                'archivePassword': password
            })
            const id = `jams_${username}`
            const userConfig = { username, type: 'jams', accounts: accountId }
            const newUser = user(id, userConfig)
            console.log('AccountId: ' + accountId)
            tempAccounts[accountId] = { done, newUser }

        }
    )
    jamsStrategy.name = 'jams'

    const localStrategy = new LocalStrategy(
        (username, password, done) => {
            console.log('localStrategy: ' + username + ' ' + password)

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

    const secured = (req: Request, res: Response, next: NextFunction) => {
        if (req.user) {
            return next()
        }
        res.status(401).end()
    }
    const securedRedirect = (req: Request, res: Response, next: NextFunction) => {
        if (req.user && (req.user as any)?.accountId) {
            return next()
        }
        (req.session as any).returnTo = req.originalUrl
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
            'accounts': '*',
            password: req.body.password
        }
        res.status(200).end()
        saveConfig(configPath, appConfig)
    })
    app.post('/auth/jams', passport.authenticate('jams'), (req, res) => {
        res.json({ loggedin: true })
    })
    app.post('/auth/local', passport.authenticate('local'), (req, res) => {
        res.json({ loggedin: true, user: (req.user as any)?.id })
    })

    const getState = (req: Request) => {
        if (req.user) {
            const user = (req.user || {}) as UserConfig
            return { loggedin: true, username: user.username, type: user.type }
        } else if (isSetupComplete()) {
            return {}
        } else {
            return { setupComplete: false }
        }
    }

    // sentrySetUp(app);

    app.get('/auth', (req, res) => {
        const state = getState(req)
        if (req.user) {
            res.json(state)
        } else {
            res.status(401).json(state)
        }
    })

    app.use('/api', secured, apiRouter)

    app.use('/', indexRouter)

    /* GET React App */

    const cwd = process.cwd()
    app.use(express.static(path.join(cwd,  'client/dist')));

    app.use((req, res) => {
        res.render(path.join(cwd, 'client/dist/index.ejs'), {
            initdata: JSON.stringify(getState(req))
        })
    })


    // @ts-ignore TODO: Fix the typescript error
    const server = http.Server(app)

    const io = new Server(server, { cors: corsOptions })
    const wrap = (middleware: any) => (socket: Socket, next: (err?: ExtendedError) => void ) => middleware(socket.request, {}, next)
    io.use(wrap(sessionMiddleware))
    io.use(wrap(passport.initialize()))
    io.use(wrap(passport.session()))
    io.use((socket, next) => {
        if ((socket.request as any).user) {
            next()
        } else {
            next(new Error('unauthorized'))
        }
    })
    io.on('connect', (socket) => {
        console.log(`new connection ${socket.id}`)
        const session = (socket.request as any).session
        console.log(`saving sid ${socket.id} in session ${session.id}`)
        session.socketId = socket.id
        session.save()

        socket.on('conversation', (data) => {
            console.log('io conversation')
            console.log(data)
            if (session.conversation) {
                console.log(`disconnect from old conversation ${session.conversation.conversationId}`)
                const conversation = jami.getConversation(session.conversation.accountId, session.conversation.conversationId)
                delete conversation.listeners[socket.id]
            }
            session.conversation = { accountId: data.accountId, conversationId: data.conversationId }
            const conversation = jami.getConversation(data.accountId, data.conversationId)
            if (!conversation.listeners)
                conversation.listeners = {}
            conversation.listeners[socket.id] = {
                socket, session
            }
            session.save()
        })
    })

    return server
}

loadConfig(configPath)
    .then(createServer)
    .then(server => {
        server.listen(3000)
    })
