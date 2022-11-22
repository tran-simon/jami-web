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
import { SelectChangeEvent, Stack, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingSelect, SettingsGroup, SettingSwitch } from '../components/Settings';
import { CustomThemeContext } from '../contexts/CustomThemeProvider';
import { availableLanguages } from '../i18n';

export default function GeneralPreferences() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Typography variant="h2">{t('settings_title_general')}</Typography>
      <SettingsGroup label={t('settings_title_system')}>
        <SettingTheme />
        <SettingLanguage />
      </SettingsGroup>
    </Stack>
  );
}

const SettingTheme = () => {
  const { t } = useTranslation();

  const { mode, toggleMode } = useContext(CustomThemeContext);

  return <SettingSwitch label={t('setting_dark_theme')} onChange={toggleMode} checked={mode === 'dark'} />;
};

const settingLanguageOptions = availableLanguages.map(({ tag, fullName }) => ({ label: fullName, value: tag }));

const SettingLanguage = () => {
  const { t, i18n } = useTranslation();

  const [languageValue, setLanguageValue] = useState(i18n.language);

  useEffect(() => {
    i18n.changeLanguage(languageValue);
  }, [languageValue, i18n]);

  const onChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      setLanguageValue(event.target.value as string);
    },
    [setLanguageValue]
  );

  return (
    <SettingSelect
      label={t('setting_language')}
      value={languageValue}
      onChange={onChange}
      options={settingLanguageOptions}
    />
  );
};
