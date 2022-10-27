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
import { Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

export default styled(({ className, title, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} title={<span style={{ whiteSpace: 'pre-line' }}>{title}</span>}>
    <Stack>{props.children}</Stack>
  </Tooltip>
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.InfoTooltip.backgroundColor.main,
    color: theme.InfoTooltip.color.main,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(15),
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: '5px',
  },
}));
