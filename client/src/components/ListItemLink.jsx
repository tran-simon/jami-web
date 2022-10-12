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
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import { forwardRef, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

function ListItemLink(props) {
  const { icon, primary, secondary, to, account } = props;

  const renderLink = useMemo(
    () =>
      forwardRef((itemProps, ref) => {
        console.log('LIST ITEM LINK: ', account, itemProps);
        return <RouterLink to={to} ref={ref} {...itemProps} state={account} />;
      }),
    [account, to]
  );

  return (
    <ListItem button component={renderLink}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} secondary={secondary} />
    </ListItem>
  );
}

ListItemLink.propTypes = {
  icon: PropTypes.element,
  primary: PropTypes.string.isRequired,
  secondary: PropTypes.string,
  to: PropTypes.string.isRequired,
  account: PropTypes.object,
};

export default ListItemLink;
