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

/* TODO remove this file.
This is a temporary socker server only used for testing the webrtc
connection between two local client. We are using this server while
we develop the real communication server with the deamon */

import cors from 'cors';
import express from 'express';
import http from 'http';
import os from 'os';
import { Server } from 'socket.io';

let app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
  },
});

const PORT = process.env.PORT || 8080;

const ip = Object.values(os.networkInterfaces())
  .flat()
  .find((i) => i.family === 'IPv4' && !i.internal).address;

io.on('connection', (socket) => {
  console.log('Connection to socket from ' + socket.id);

  socket.on('offer', (sdp) => {
    console.log('offer: ' + socket.id);
    socket.broadcast.emit('getOffer', sdp);
  });

  socket.on('answer', (sdp) => {
    console.log('answer: ' + socket.id);
    socket.broadcast.emit('getAnswer', sdp);
  });

  socket.on('candidate', (candidate) => {
    console.log('candidate: ' + socket.id);
    socket.broadcast.emit('getCandidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} exit`);
  });
});

server.listen(PORT, () => {
  console.log(`server running on ${ip}:${PORT}`);
});
