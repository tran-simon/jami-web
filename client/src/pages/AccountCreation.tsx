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
import { DialerSipRounded, GroupOutlined, RoomRounded } from '@mui/icons-material';
import { Avatar, Card, CardContent, Container, Divider, List, Typography } from '@mui/material';

import ListItemLink from '../components/ListItemLink';

export default function AccountCreationDialog() {
  return (
    <Container>
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Create new account
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Welcome to the Jami web node setup.
            <br />
            Let&apos;s start by creating a new administrator account to control access to the server configuration.
          </Typography>
        </CardContent>

        <List>
          <ListItemLink
            to="/newAccount/rendezVous"
            icon={
              <Avatar>
                <RoomRounded />
              </Avatar>
            }
            primary="Rendez-vous point"
            secondary="A Rendez-vous account provides a unique space suitable to easily organize meetings"
          />
          <Divider />
          <ListItemLink
            to="/newAccount/jami"
            icon={
              <Avatar>
                <GroupOutlined />
              </Avatar>
            }
            primary="Jami account"
            secondary="A pesonal communication account to join a Rendez-vous point or directly contact other Jami users"
          />
          <Divider />
          <ListItemLink
            to="/newAccount/sip"
            icon={
              <Avatar>
                <DialerSipRounded />
              </Avatar>
            }
            primary="SIP Account"
            secondary="Connect with standard SIP communication providers or classic telephony services"
          />
        </List>
      </Card>
    </Container>
  );
}
