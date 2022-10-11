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
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Account } from 'jami-web-common';

type JamiIdCardProps = {
  account: Account;
};

export default function JamiIdCard(props: JamiIdCardProps) {
  const account = props.account;
  const registeredName = account.getRegisteredName();
  return (
    <Card style={{ marginBottom: 16 }}>
      <CardContent>
        <Box>
          <Typography color="textSecondary">Jami ID</Typography>
          <Typography variant="h5" component="h2" gutterBottom noWrap>
            {account.getUri()}
          </Typography>
        </Box>
        {registeredName && (
          <Box>
            <Typography color="textSecondary">Jami username</Typography>
            <Typography variant="h5" component="h2" noWrap>
              {registeredName}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
