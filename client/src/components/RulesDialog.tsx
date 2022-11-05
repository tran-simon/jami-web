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
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RulesDialogProps {
  openDialog: boolean;
  title: string;
  closeDialog: () => void;
  children: React.ReactNode;
}

export default function RulesDialog(props: RulesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={props.openDialog} onClose={props.closeDialog}>
      <DialogTitle>
        {props.title}
        <br />
      </DialogTitle>
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        <Button onClick={props.closeDialog} autoFocus>
          {t('dialog_close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
