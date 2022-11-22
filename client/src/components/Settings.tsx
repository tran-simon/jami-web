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
import { Button, FormLabel, List, ListItem, ListSubheader, Stack, Switch, SwitchProps } from '@mui/material';
import { Box } from '@mui/system';
import { MouseEventHandler, ReactElement } from 'react';

import { CustomSelect, CustomSelectProps } from './CustomSelect';

interface Setting {
  label: string;
}

interface SettingBaseProps {
  label: string;
  children: ReactElement;
}

const SettingBase = ({ label, children }: SettingBaseProps) => {
  return (
    <ListItem sx={{ padding: 0, margin: 0 }}>
      <FormLabel sx={{ width: '100%' }}>
        <Stack direction="row">
          <Box flexGrow={1}>{label}</Box>
          {children}
        </Stack>
      </FormLabel>
    </ListItem>
  );
};

interface SettingButtonProps extends Setting {
  onClick: MouseEventHandler;
}

export const SettingButton = ({ onClick, ...settingBaseProps }: SettingButtonProps) => {
  return (
    <SettingBase {...settingBaseProps}>
      <Button variant="contained" size="small" onClick={onClick} />
    </SettingBase>
  );
};

interface SettingSelectProps extends Setting, CustomSelectProps {}

export const SettingSelect = ({ options, value, onChange, ...settingBaseProps }: SettingSelectProps) => {
  return (
    <SettingBase {...settingBaseProps}>
      <CustomSelect value={value} options={options} onChange={onChange} />
    </SettingBase>
  );
};

interface SettingSwitchProps extends Setting {
  checked: SwitchProps['checked'];
  onChange: SwitchProps['onChange'];
}

export const SettingSwitch = ({ checked, onChange, ...settingBaseProps }: SettingSwitchProps) => {
  return (
    <SettingBase {...settingBaseProps}>
      <Switch checked={checked} onChange={onChange} />
    </SettingBase>
  );
};

interface SettingGroupProps {
  label: string;
  children: ReactElement[];
}

export const SettingsGroup = ({ label, children }: SettingGroupProps) => {
  return <List subheader={<ListSubheader>{label}</ListSubheader>}>{children}</List>;
};
