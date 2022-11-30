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
import {
  ContactDetails,
  HttpStatusCode,
  IConversation,
  IConversationMember,
  NewConversationRequestBody,
  NewMessageRequestBody,
} from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

async function createConversationResponseObject(
  accountId: string,
  accountUri: string,
  conversationId: string
): Promise<IConversation | undefined> {
  const infos = jamid.getConversationInfos(accountId, conversationId);
  if (Object.keys(infos).length === 0) {
    return undefined;
  }

  const members = jamid.getConversationMembers(accountId, conversationId);

  const namedMembers: IConversationMember[] = [];
  for (const member of members) {
    // Exclude current user from returned conversation members
    if (member.uri === accountUri) {
      continue;
    }

    // Add usernames for conversation members
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
    members: namedMembers,
    messages: messages,
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

conversationRouter.post(
  '/',
  (req: Request<ParamsDictionary, ContactDetails | string, Partial<NewConversationRequestBody>>, res) => {
    const { members } = req.body;
    if (members === undefined || members.length !== 1) {
      res.status(HttpStatusCode.BadRequest).send('Missing members or more than one member in body');
      return;
    }

    const accountId = res.locals.accountId;

    const contactId = members[0];
    jamid.addContact(accountId, contactId);
    // We need to manually send a conversation request
    jamid.sendTrustRequest(accountId, contactId);

    const contactDetails = jamid.getContactDetails(accountId, contactId);
    if (Object.keys(contactDetails).length === 0) {
      res.status(HttpStatusCode.NotFound).send('No such member found');
      return;
    }

    res.send(contactDetails);
  }
);

// TODO: Check if we actually need this endpoint to return messages.
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

    const conversation = await createConversationResponseObject(accountId, accountUri, conversationId);
    if (conversation === undefined) {
      res.status(HttpStatusCode.NotFound).send('No such conversation found');
      return;
    }

    res.send(conversation);
  })
);

conversationRouter.get(
  '/:conversationId/messages',
  asyncHandler(async (req, res) => {
    const accountId = res.locals.accountId;
    const conversationId = req.params.conversationId;

    const infos = jamid.getConversationInfos(accountId, conversationId);
    if (Object.keys(infos).length === 0) {
      res.status(HttpStatusCode.NotFound).send('No such conversation found');
      return;
    }

    const messages = await jamid.getConversationMessages(accountId, conversationId);
    res.send(messages);
  })
);

conversationRouter.post(
  '/:conversationId/messages',
  (req: Request<ParamsDictionary, string, Partial<NewMessageRequestBody>>, res) => {
    const { message } = req.body;
    if (message === undefined) {
      res.status(HttpStatusCode.BadRequest).send('Missing message in body');
      return;
    }

    const accountId = res.locals.accountId;
    const conversationId = req.params.conversationId;

    const infos = jamid.getConversationInfos(accountId, conversationId);
    if (Object.keys(infos).length === 0) {
      res.status(HttpStatusCode.NotFound).send('No such conversation found');
      return;
    }

    jamid.sendConversationMessage(accountId, conversationId, message);
    res.sendStatus(HttpStatusCode.NoContent);
  }
);
