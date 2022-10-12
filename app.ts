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
'use strict';

import dotenv from 'dotenv';
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { promises as fs } from 'fs';
import http from 'http';
import { Account } from 'jami-web-common';
import passport from 'passport';
import { IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';
import { Server, Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

import JamiDaemon from './JamiDaemon';
//import { createRequire } from 'module';
//const require = createRequire(import.meta.url);
//const redis = require('redis-url').connect()
//const RedisStore = require('connect-redis')(session)
/*const passportSocketIo = require('passport.socketio')*/
import indexRouter from './routes/index.js';
import JamiRestApi from './routes/jami.js';
// import { sentrySetUp } from './sentry.js'

const configPath = 'jamiServerConfig.json';

//const sessionStore = new RedisStore({ client: redis })
const sessionStore = new session.MemoryStore();

interface User {
  id: string;
  config: UserConfig;
  username: string;
  accountFilter?: (account: any) => boolean;
}

interface UserConfig {
  accountId?: string;
  accounts: string;
  password?: string;
  username?: string;
  type?: string;
}

interface AppConfig {
  users: Record<string, UserConfig>;
  authMethods: unknown[];
}

const loadConfig = async (filePath: string): Promise<AppConfig> => {
  const config = { users: {}, authMethods: [] };
  try {
    return Object.assign(config, JSON.parse((await fs.readFile(filePath)).toString()));
  } catch (e) {
    console.log(e);
    return config;
  }
};

const saveConfig = (filePath: string, config: AppConfig) => {
  return fs.writeFile(filePath, JSON.stringify(config));
};

/*
Share sessions between Passport.js and Socket.io
*/

function logSuccess() {
  console.log('passportSocketIo authorized user with Success 😁');
}

function logFail() {
  console.log('passportSocketIo failed to authorized user 👺');
}

/*

tempAccounts holds users accounts while tempting to authenticate them on Jams.
connectedUsers  holds users accounts after they got authenticated by Jams.

Users should be removed from connectedUsers when receiving a disconnect
web socket call

*/
const tempAccounts: Record<
  string,
  {
    newUser: Express.User;
    done: (error: any, user?: any, options?: IVerifyOptions) => void;
  }
> = {};
const connectedUsers: Record<string, UserConfig> = {};

const createServer = async (appConfig: AppConfig) => {
  const app = express();
  console.log(`Loading server for ${nodeEnv} with config:`);
  console.log(appConfig);

  const corsOptions = {
    origin: 'http://127.0.0.1:3000',
  };

  /*
        Configuation for Passeport Js
    */
  app.disable('x-powered-by');

  const secretKey = process.env.SECRET_KEY_BASE;

  if (!secretKey) {
    throw new Error('SECRET_KEY_BASE undefined');
  }

  const sessionMiddleware = session({
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //!development,
      maxAge: 2419200000,
    },
    secret: secretKey,
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(app.router)
  app.use(cors(corsOptions));

  const jami = new JamiDaemon((account: Account, conversation: any, message: any) => {
    console.log('JamiDaemon onMessage');

    if (conversation.listeners) {
      Object.values(conversation.listeners).forEach((listener: any) => {
        listener.socket.emit('newMessage', message);
      });
    }
  });
  const apiRouter = new JamiRestApi(jami).getRouter();

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
    return 'admin' in appConfig.users;
  };

  const accountFilter = (filter: string | string[]) => {
    if (typeof filter === 'string') {
      if (filter === '*') return undefined;
      else return (account: Account) => account.getId() === filter;
    } else if (Array.isArray(filter)) {
      return (account: Account) => filter.includes(account.getId());
    } else {
      throw new Error('Invalid account filter string');
    }
  };

  const user = (id: string, config: UserConfig) => {
    return {
      id,
      config,
      username: config.username || id,
      accountFilter: accountFilter(config.accounts),
    };
  };

  passport.serializeUser((user: any, done) => {
    user = user as User;
    connectedUsers[user.id] = user.config;
    console.log('=============================SerializeUser called ' + user.id);
    console.log(user);
    done(null, user.id);
  });

  const deserializeUser = (id: string, done: (err: any, user?: Express.User | false | null) => void) => {
    console.log('=============================DeserializeUser called on: ' + id);
    const userConfig = connectedUsers[id];
    console.log(userConfig);
    if (userConfig) {
      done(null, user(id, userConfig));
    } else done(404, null);
  };
  passport.deserializeUser(deserializeUser);

  const jamsStrategy = new LocalStrategy(async (username, password, done) => {
    const accountId = await jami.addAccount({
      managerUri: 'https://jams.savoirfairelinux.com',
      managerUsername: username,
      archivePassword: password,
    });
    const id = `jams_${username}`;
    const userConfig = { username, type: 'jams', accounts: accountId };
    const newUser = user(id, userConfig);
    console.log('AccountId: ' + accountId);
    tempAccounts[accountId] = { done, newUser };
  });
  jamsStrategy.name = 'jams';

  const localStrategy = new LocalStrategy((username, password, done) => {
    console.log('localStrategy: ' + username + ' ' + password);

    const id = username;
    const userConfig = appConfig.users[username];
    if (!userConfig) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (userConfig.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    userConfig.type = 'local';

    done(null, user(id, userConfig));
  });

  passport.use(jamsStrategy);
  passport.use(localStrategy);

  const secured = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      return next();
    }
    res.status(401).end();
  };
  const securedRedirect = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserConfig | undefined;
    if (user?.accountId) {
      return next();
    }
    (req.session as any).returnTo = req.originalUrl;
    res.redirect('/login');
  };

  app.use(express.json());
  app.post('/setup', (req, res) => {
    if (isSetupComplete()) {
      return res.status(404).end();
    }
    if (!req.body.password) {
      return res.status(400).end();
    }
    console.log(req.body);
    appConfig.users.admin = {
      accounts: '*',
      password: req.body.password,
    };
    res.status(200).end();
    saveConfig(configPath, appConfig);
  });
  app.post('/auth/jams', passport.authenticate('jams'), (req, res) => {
    res.json({ loggedin: true });
  });
  app.post('/auth/local', passport.authenticate('local'), (req, res) => {
    res.json({ loggedin: true, user: (req.user as User | undefined)?.id });
  });

  const getState = (req: Request) => {
    if (req.user) {
      const user = req.user as UserConfig;
      return { loggedin: true, username: user.username, type: user.type };
    } else if (isSetupComplete()) {
      return {};
    } else {
      return { setupComplete: false };
    }
  };

  // sentrySetUp(app);

  app.get('/auth', (req, res) => {
    const state = getState(req);
    if (req.user) {
      res.json(state);
    } else {
      res.status(401).json(state);
    }
  });

  app.use('/api', secured, apiRouter);

  app.use('/', indexRouter);

  // @ts-ignore TODO: Fix the typescript error
  const server = http.Server(app);

  const io = new Server(server, { cors: corsOptions });
  const wrap = (middleware: any) => (socket: Socket, next: (err?: ExtendedError) => void) =>
    middleware(socket.request, {}, next);
  io.use(wrap(sessionMiddleware));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));
  io.use((socket, next) => {
    if ((socket.request as any).user) {
      next();
    } else {
      next(new Error('unauthorized'));
    }
  });
  io.on('connect', (socket) => {
    console.log(`new connection ${socket.id}`);
    const session = (socket.request as any).session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    socket.on('conversation', (data) => {
      console.log('io conversation');
      console.log(data);
      if (session.conversation) {
        console.log(`disconnect from old conversation ${session.conversation.conversationId}`);
        const conversation = jami.getConversation(session.conversation.accountId, session.conversation.conversationId);
        if (conversation) {
          delete conversation.listeners[socket.id];
        }
      }
      session.conversation = { accountId: data.accountId, conversationId: data.conversationId };
      const conversation = jami.getConversation(data.accountId, data.conversationId);
      if (conversation) {
        if (!conversation.listeners) {
          conversation.listeners = {};
        }
        conversation.listeners[socket.id] = {
          socket,
          session,
        };
      }
      session.save();
    });
  });

  return server;
};

loadConfig(configPath)
  .then(createServer)
  .then((server) => {
    server.listen(3001);
  });
