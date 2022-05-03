import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink } from 'react-router-dom';

function ListItemLink(props) {
  const { icon, primary, secondary, to } = props

  const renderLink = useMemo(
    () => forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to])

  return (
    <ListItem button component={renderLink}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} secondary={secondary} />
    </ListItem>
  )
}

ListItemLink.propTypes = {
  icon: PropTypes.element,
  primary: PropTypes.string.isRequired,
  secondary: PropTypes.string,
  to: PropTypes.string.isRequired,
}

export default ListItemLink