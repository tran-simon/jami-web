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
import { Request, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ParamsDictionary } from 'express-serve-static-core';
import { HttpStatusCode } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

interface ConversationMembers {
  members: string[];
}

interface ConversationMessage {
  message: string;
}

const jamid = Container.get(Jamid);

// TODO: Create interface for return type in common/ when Records and interfaces are refactored
async function createConversationResponseObject(accountId: string, accountUri: string, conversationId: string) {
  const infos = jamid.getConversationInfos(accountId, conversationId);
  const members = jamid.getConversationMembers(accountId, conversationId);

  const namedMembers = [];
  for (const member of members) {
    // Exclude current user from returned conversation members
    if (member.uri === accountUri) {
      continue;
    }

    // Add usernames for conversation members
    // TODO: Add caching in jamid to avoid too many address -> username lookups?
    const { username } = await jamid.lookupAddress(member.uri, accountId);
    namedMembers.push({
      role: member.role,
      contact: {
        uri: member.uri,
        registeredName: username,
      },
    });
  }

  // TODO: Check if messages actually need to be added to response
  // (does the client really need it for all endpoints, or just the /conversations/conversationId/messages endpoint?)
  const messages = await jamid.getConversationMessages(accountId, conversationId);

  return {
    id: conversationId,
    messages: messages,
    members: namedMembers,
    infos: infos,
  };
}

export const conversationRouter = Router();

conversationRouter.use(authenticateToken);

conversationRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const accountId = res.locals.accountId;

    // Retrieve the URI of the current account (Account.username actually stores the URI rather than the username)
    const accountUri = jamid.getAccountDetails(accountId)['Account.username'];

    const conversationIds = jamid.getConversationIds(accountId);

    const conversations = [];
    for (const conversationId of conversationIds) {
      const conversation = await createConversationResponseObject(accountId, accountUri, conversationId);
      conversations.push(conversation);
    }

    res.send(conversations);
  })
);

conversationRouter.post('/', (req: Request<ParamsDictionary, Record<string, string>, ConversationMembers>, res) => {
  const accountId = res.locals.accountId;

  const { members } = req.body;
  if (members === undefined || members.length !== 1) {
    res.sendStatus(HttpStatusCode.BadRequest);
    return;
  }

  const contactId = members[0];
  jamid.addContact(accountId, contactId);

  const contactDetails = jamid.getContactDetails(accountId, contactId);
  res.send(contactDetails);
});

// TODO: Check if we actually need this endpoint to return messages.
// Verify by checking what is truly needed in the client when migrating, to clean up the API.
// At the moment, /conversations does a lot of work returning all the conversations with the same
// level of detail as this, and /conversations/messages returns just the messages. Check whether or not
// this is what we want, and if so, if we can be more economical with client requests.
conversationRouter.get(
  '/:conversationId',
  asyncHandler(async (req, res) => {
    const accountId = res.locals.accountId;
    const conversationId = req.params.conversationId;

    // Retrieve the URI of the current account (Account.username actually stores the URI rather than the username)
    const accountUri = jamid.getAccountDetails(accountId)['Account.username'];

    const conversationIds = jamid.getConversationIds(accountId);
    if (!conversationIds.includes(conversationId)) {
      res.sendStatus(HttpStatusCode.NotFound);
      return;
    }

    const conversation = await createConversationResponseObject(accountId, accountUri, conversationId);
    res.send(conversation);
  })
);

conversationRouter.get(
  '/:conversationId/messages',
  asyncHandler(async (req, res) => {
    const accountId = res.locals.accountId;
    const conversationId = req.params.conversationId;

    const conversationIds = jamid.getConversationIds(accountId);
    if (!conversationIds.includes(conversationId)) {
      res.sendStatus(HttpStatusCode.NotFound);
      return;
    }

    const messages = await jamid.getConversationMessages(accountId, conversationId);
    res.send(messages);
  })
);

conversationRouter.post(
  '/:conversationId/messages',
  (req: Request<ParamsDictionary, any, ConversationMessage>, res) => {
    const { message } = req.body;
    if (message === undefined) {
      res.sendStatus(HttpStatusCode.BadRequest);
      return;
    }

    jamid.sendConversationMessage(res.locals.accountId, req.params.conversationId, message);
    res.end();
  }
);
