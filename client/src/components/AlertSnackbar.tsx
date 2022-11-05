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
import { Alert, AlertColor, AlertProps, AlertTitle, Snackbar, SnackbarProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

type AlertSnackbarProps = AlertProps & {
  severity: AlertColor;
  open?: boolean;
  snackBarProps?: Partial<SnackbarProps>;
};

export function AlertSnackbar({ severity, open, snackBarProps, children, ...alertProps }: AlertSnackbarProps) {
  const { t } = useTranslation();

  return (
    <Snackbar
      open={open}
      {...snackBarProps}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
        ...snackBarProps?.anchorOrigin,
      }}
    >
      <Alert severity={severity} {...alertProps}>
        {/* For i18n-parser.
          t('severity_error')
          t('severity_success')
        */}
        <AlertTitle>{t(`severity_${severity}`)}</AlertTitle>
        {children}
      </Alert>
    </Snackbar>
  );
}
