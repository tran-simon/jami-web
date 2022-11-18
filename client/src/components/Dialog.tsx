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
import { Box, Button, List, ListItem, ListItemIcon, Stack, SvgIconProps, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ComponentType, ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DialogHandler {
  props: {
    open: boolean;
    onClose: () => void;
  };
  openDialog: () => void;
}

export const useDialogHandler = (): DialogHandler => {
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  return useMemo(
    () => ({
      props: { open, onClose },
      openDialog,
    }),
    [open, onClose, openDialog]
  );
};

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  icon?: ReactNode;
  title: string;
  content: ReactNode;
  actions: ReactNode;
}

export const BaseDialog = ({ open, onClose, icon, title, content, actions }: BaseDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing="16px">
          {icon && (
            <Box height="80px" width="80px">
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h2">{title}</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

type InfosDialogProps = Omit<BaseDialogProps, 'actions'>;

export const InfosDialog = (props: InfosDialogProps) => {
  const { t } = useTranslation();
  return (
    <BaseDialog
      {...props}
      actions={
        <Button onClick={props.onClose} autoFocus>
          {t('dialog_close')}
        </Button>
      }
    />
  );
};

interface ConfirmationDialogProps extends Omit<BaseDialogProps, 'actions'> {
  onConfirm: () => void;
  confirmButtonText: string;
}

export const ConfirmationDialog = ({ onConfirm, confirmButtonText, ...props }: ConfirmationDialogProps) => {
  const { t } = useTranslation();
  props.title = props.title || t('dialog_confirm_title_default');

  return (
    <BaseDialog
      {...props}
      actions={
        <>
          <Button onClick={onConfirm}>{confirmButtonText}</Button>
          <Button onClick={props.onClose}>{t('dialog_cancel')}</Button>
        </>
      }
    />
  );
};

interface DialogContentListItem {
  Icon?: ComponentType<SvgIconProps>;
  label?: string;
  value: ReactNode;
}

interface DialogContentListProps {
  title?: string;
  items: DialogContentListItem[];
}

export const DialogContentList = ({ title, items }: DialogContentListProps) => {
  return (
    <List subheader={<Typography variant="h3">{title}</Typography>}>
      {items.map(({ Icon, label, value }, index) => (
        <ListItem key={index}>
          {Icon && (
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
          )}
          <Stack direction="row" alignItems="center" spacing="24px">
            {label && (
              <Stack direction="row" width="100px" justifyContent="end">
                <Typography variant="body2" color="#a0a0a0">
                  {label}
                </Typography>
              </Stack>
            )}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {value}
              </Typography>
            </Box>
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};
