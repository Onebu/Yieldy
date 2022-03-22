import React, { useState, useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MdClearAll,
  MdExitToApp,
  MdHelp,
  MdNotificationsActive,
  MdNotificationsNone,
  MdPersonPin,
  MdSettingsApplications
} from 'react-icons/md';
import {
  Button,
  ListGroup,
  ListGroupItem,
  Nav,
  Navbar,
  NavItem,
  NavLink,
  Popover,
  PopoverBody,
} from 'reactstrap';

import bn from 'utils/bemnames';
import Avatar from 'components/Avatar/Avatar';
import { UserCard } from 'components/Card';
import { Notifications, SearchInput, PageSpinner } from 'components/BasicElement';
import withBadge from 'hocs/withBadge';
import * as userActions from '../../store/actions/user';

const bem = bn.create('header');

const MdNotificationsActiveWithBadge = withBadge({
  size: 'md',
  color: 'primary',
  style: {
    top: -10,
    right: -10,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  children: <small>!</small>,
})(MdNotificationsActive);

const Header = props => {

  const [isOpenNotificationPopover, setIsOpenNotificationPopover] = useState(false);
  const [isNotificationConfirmed, setIsNotificationConfirmed] = useState(false);
  const [isOpenUserCardPopover, setIsOpenUserCardPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("tkn");
  const profile = useSelector(state => state.user.userProfile);
  const dispatch = useDispatch();
  const history= useHistory();
  let cardContent = null;


  useEffect(() => {
    async function fetchProfile() {
      await dispatch(
        userActions.fetchUserProfile()
      );
    }
    if (!!token) {
        fetchProfile()
          .then(setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token])

  const toggleNotificationPopover = () => {

    setIsOpenNotificationPopover(!isOpenNotificationPopover);

    if (!isNotificationConfirmed) {
      setIsNotificationConfirmed(true);
    }
  };

  const toggleUserCardPopover = () => {
    setIsOpenUserCardPopover(!isOpenUserCardPopover);

  };

  const handleSidebarControlButton = event => {
    event.preventDefault();
    event.stopPropagation();

    document.querySelector('.cr-sidebar').classList.toggle('cr-sidebar--open');
  };

  if (isLoading) {
    cardContent = <PageSpinner />
  } else if (!!profile) {
    cardContent = <UserCard
      title={profile.username}
      subtitle={profile.email}
      text={profile.role}
      avatar={!!profile.profileImage?profile.profileImage.cloudImage:undefined}
      className="border-light"
    >
      <ListGroup flush>
        <ListGroupItem tag="button" action className="border-light" onClick={()=>history.push("/profile")}>
          <MdPersonPin /> Profile
      </ListGroupItem>
        <ListGroupItem tag="button" action className="border-light" onClick={()=>history.push("/settings")}>
          <MdSettingsApplications /> Settings
      </ListGroupItem>
        <ListGroupItem tag="button" action className="border-light" onClick={()=>history.push("/help")}>
          <MdHelp /> Help
      </ListGroupItem>
        <ListGroupItem tag="button" action className="btn-danger  border-light"  onClick={props.onLogout} >
          <MdExitToApp /> Signout
      </ListGroupItem>
      </ListGroup>
    </UserCard>
  }

  return (
    <Navbar light expand className={bem.b('bg-white')}>
      <Nav navbar className="mr-2">
        <Button outline onClick={handleSidebarControlButton}>
          <MdClearAll size={25} />
        </Button>
      </Nav>
      <Nav navbar>
        <SearchInput />
      </Nav>

      <Nav navbar className={bem.e('nav-right')}>
        <NavItem className="d-inline-flex">
          <NavLink id="Popover1" className="position-relative">
            {isNotificationConfirmed ? (
              <MdNotificationsNone
                size={25}
                className="text-secondary can-click"
                onClick={toggleNotificationPopover}
              />
            ) : (
                <MdNotificationsActiveWithBadge
                  size={25}
                  className="text-secondary can-click animated swing infinite"
                  onClick={toggleNotificationPopover}
                />
              )}
          </NavLink>
          <Popover
            placement="bottom"
            isOpen={isOpenNotificationPopover}
            toggle={toggleNotificationPopover}
            target="Popover1"
          >
            <PopoverBody>
              <Notifications />
            </PopoverBody>
          </Popover>
        </NavItem>

        <NavItem>
          <NavLink id="Popover2">
            <Avatar
              src={(!!profile&&!!profile.profileImage)?profile.profileImage.cloudImage:undefined}
              onClick={toggleUserCardPopover}
              className="can-click"
            />
          </NavLink>
          <Popover
            placement="bottom-end"
            isOpen={isOpenUserCardPopover}
            toggle={toggleUserCardPopover}
            target="Popover2"
            className="p-0 border-0"
            style={{ minWidth: 250 }}
          >
            <PopoverBody className="p-0 border-light">
              {cardContent}
            </PopoverBody>
          </Popover>
        </NavItem>
      </Nav>
    </Navbar>
  );
}

export default Header;
