import React from 'react';
import PropTypes from 'utils/propTypes';

import { Media } from 'reactstrap';

import Avatar from 'components/Avatar/Avatar';

const Notifications = ({ notificationsData }) => {
  if (notificationsData && notificationsData.length) {
    return (
      notificationsData.map(({ id, avatar, message, date }) => (
        <Media key={id} className="pb-2">
          <Media left className="align-self-center pr-3">
            <Avatar tag={Media} object src={avatar} alt="Avatar" />
          </Media>
          <Media body middle className="align-self-center">
            {message}
          </Media>
          <Media right className="align-self-center">
            <small className="text-muted">{date}</small>
          </Media>
        </Media>
      ))
    );
  }
  return (
    <Media className="pb-2">
      <Media left className="align-self-center pr-3">
        <Avatar tag={Media} object  alt="Avatar" />
      </Media>
      <Media body middle className="align-self-center">
        Available at Mobile Ver. ^_^
      </Media>
      <Media right className="align-self-center">
        <small className="text-muted">Just Now</small>
      </Media>
    </Media>
  )
};

Notifications.propTypes = {
  notificationsData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.ID,
      avatar: PropTypes.string,
      message: PropTypes.node,
      date: PropTypes.date,
    })
  ),
};

Notifications.defaultProps = {
  notificationsData: [],
};

export default Notifications;
