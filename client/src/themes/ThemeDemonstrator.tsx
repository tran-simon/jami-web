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
import { Button, Stack, Switch, ThemeProvider, Typography } from '@mui/material';

import {
  BackButton,
  CancelPictureButton,
  CloseButton,
  EditPictureButton,
  InfoButton,
  TakePictureButton,
  TipButton,
  UploadPictureButton,
} from '../components/Button';
import { NickNameInput, PasswordInput, RegularInput, UsernameInput } from '../components/Input';
import defaultTheme from './Default';

export const ThemeDemonstrator = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Stack spacing="5px">
        <Stack>
          <Typography variant="h1">Exemple de titre H1</Typography>
          <Typography variant="h2">Exemple de titre H2</Typography>
          <Typography variant="h3">Exemple de titre H3</Typography>
          <Typography variant="h4">Exemple de titre H4</Typography>
          <Typography variant="h5">Exemple de titre H5</Typography>
          <Typography variant="body1">Texte courant principal</Typography>
          <Typography variant="body2">Texte courant secondaire</Typography>
          <Typography variant="caption">Légendes et annotations</Typography>
        </Stack>
        <Stack spacing="5px" padding="5px" width="300px">
          <Button variant="contained">Bouton primaire</Button>
          <Button variant="outlined">Bouton secondaire</Button>
          <Button variant="text">Bouton tertiaire</Button>
          <Button variant="contained" size="small">
            Bouton liste préférences
          </Button>
        </Stack>
        <Stack direction="row" spacing="5px">
          <CancelPictureButton />
          <EditPictureButton />
          <UploadPictureButton />
          <TakePictureButton />
        </Stack>
        <Stack direction="row" spacing="5px">
          <InfoButton tooltipTitle={''} />
          <TipButton />
        </Stack>
        <Stack direction="row" spacing="5px">
          <BackButton />
          <CloseButton />
        </Stack>
        <Stack>
          <Switch />
        </Stack>
        <Stack padding="5px" width="300px">
          <UsernameInput onChange={() => {}} tooltipTitle={'Test'} />
          <UsernameInput onChange={() => {}} tooltipTitle={'Test'} error defaultValue="Cyrille" />
          <PasswordInput onChange={() => {}} tooltipTitle={'Test'} />
          <PasswordInput onChange={() => {}} tooltipTitle={'Test'} error defaultValue="SavoirFaireLinux" />
          <NickNameInput />
          <RegularInput />
        </Stack>
      </Stack>
    </ThemeProvider>
  );
};
