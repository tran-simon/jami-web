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
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation();

  // TODO: The UI of this page needs to be improved
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      spacing={1}
      paddingX={8}
      sx={{
        flexGrow: 1,
        backgroundColor: 'black',
      }}
    >
      <Typography variant="h1" color="white">
        {t('permission_denied_title')}
      </Typography>
      <Typography variant="h2" color="white">
        {t('permission_denied_details')}
      </Typography>
    </Stack>
  );
};
