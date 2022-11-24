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
import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import { Box, Card, CardContent, Container, Fab, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '../contexts/AuthProvider';
import { useRouteNavigate } from '../hooks/routingHooks';
import { setRefreshFromSlice } from '../redux/appSlice';
import { useAppDispatch } from '../redux/hooks';
import { conversationRouteDescriptor } from '../router';

type AddContactPageProps = {
  contactId: string;
};

export default function AddContactPage({ contactId }: AddContactPageProps) {
  const { t } = useTranslation();
  const { axiosInstance } = useAuthContext();
  const navigate = useRouteNavigate();

  const dispatch = useAppDispatch();

  const handleClick = async () => {
    const { data } = await axiosInstance.put(`/contacts/${contactId}`);
    dispatch(setRefreshFromSlice());

    if (data.conversationId) {
      navigate(conversationRouteDescriptor, {
        urlParams: {
          conversationId: data.conversationId,
        },
      });
    }
  };

  return (
    <Container className="messenger">
      <Card variant="outlined" style={{ borderRadius: 16, maxWidth: 560, margin: '16px auto' }}>
        <CardContent>
          <Typography variant="h6">Jami key ID</Typography>
          <Typography variant="body1">{contactId}</Typography>
          <Box style={{ textAlign: 'center', marginTop: 16 }}>
            <Fab variant="extended" color="primary" onClick={handleClick}>
              <GroupAddRounded />
              {t('conversation_add_contact')}
            </Fab>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
