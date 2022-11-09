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
import { Router } from 'express';
import { HttpStatusCode } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const contactsRouter = Router();

contactsRouter.use(authenticateToken);

contactsRouter.get('/', (_req, res) => {
  const contacts = jamid.getContacts(res.locals.accountId);
  res.send(contacts);
});

contactsRouter.get('/:contactId', (req, res) => {
  const contactDetails = jamid.getContactDetails(res.locals.accountId, req.params.contactId);
  res.send(contactDetails);
});

contactsRouter.put('/:contactId', (req, res) => {
  jamid.addContact(res.locals.accountId, req.params.contactId);
  res.sendStatus(HttpStatusCode.NoContent);
});

contactsRouter.delete('/:contactId', (req, res) => {
  jamid.removeContact(res.locals.accountId, req.params.contactId);
  res.sendStatus(HttpStatusCode.NoContent);
});

contactsRouter.post('/:contactId/block', (req, res) => {
  jamid.blockContact(res.locals.accountId, req.params.contactId);
  res.sendStatus(HttpStatusCode.NoContent);
});
