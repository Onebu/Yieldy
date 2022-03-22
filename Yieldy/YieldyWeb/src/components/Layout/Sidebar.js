import logo200Image from 'assets/img/logo/logo_200.png';
import sidebarBgImage from 'assets/img/sidebar/sidebar-1.jpg';
import { SourceLink } from 'components/BasicElement';
import React from 'react';
import {
  MdDashboard,
  MdPersonPin,
  MdSettingsApplications,
  MdHelp,
  MdBusiness,
  MdDevices,
  MdComputer,
} from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import {
  Nav,
  Navbar,
  NavItem,
  NavLink as BSNavLink,
} from 'reactstrap';
import bn from 'utils/bemnames';

const sidebarBackground = {
  backgroundImage: `url("${sidebarBgImage}")`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};



const navItems = [
  { to: '/dashboard', name: 'dashboard', exact: true, Icon: MdDashboard },
];

const exploreItems = [
  { to: '/company', name: 'company', exact: false, Icon: MdBusiness },
  { to: '/system', name: 'system', exact: false, Icon: MdDevices },
  { to: '/device', name: 'device', exact: false, Icon: MdComputer }
]

const profileItems = [
  { to: '/profile', name: 'profile', exact: false, Icon: MdPersonPin },
  { to: '/settings', name: 'settings', exact: false, Icon: MdSettingsApplications },
  { to: '/help', name: 'help', exact: false, Icon: MdHelp }
];

const bem = bn.create('sidebar');

const Sidebar = props => {

  return (
    <aside className={bem.b()} data-image={sidebarBgImage}>
      <div className={bem.e('background')} style={sidebarBackground} />
      <div className={bem.e('content')}>
        <Navbar >
          <SourceLink className="navbar-brand d-flex" onClick={() => window.location.reload()} link="self">
            <img
              src={logo200Image}
              width="40"
              height="30"
              className="pr-2"
              alt=""
            />
            <span className="text-white">
              Yieldy
              </span>
          </SourceLink>
        </Navbar>
        <Nav vertical>
          {navItems.map(({ to, name, exact, Icon }, index) => (
            <NavItem key={index} className={bem.e('nav-item')}>
              <BSNavLink
                id={`navItem-${name}-${index}`}
                className="text-uppercase"
                tag={NavLink}
                to={to}
                activeClassName="active"
                exact={exact}
              >
                <Icon className={bem.e('nav-item-icon')} />
                <span className="">{name}</span>
              </BSNavLink>
            </NavItem>
          ))}

          {exploreItems.map(({ to, name, exact, Icon }, index) => (
            <NavItem key={index} className={bem.e('nav-item')}>
              <BSNavLink
                id={`navItem-${name}-${index}`}
                className="text-uppercase"
                tag={NavLink}
                to={to}
                activeClassName="active"
                exact={exact}
              >
                <Icon className={bem.e('nav-item-icon')} />
                <span className="">{name}</span>
              </BSNavLink>
            </NavItem>
          ))}

    
          <NavItem> <hr style={{ color: "#ccc", border: "0.5px solid #ccc" }} /></NavItem>
          {profileItems.map(({ to, name, exact, Icon }, index) => (
            <NavItem key={index} className={bem.e('nav-item')}>
              <BSNavLink
                id={`navItem-${name}-${index}`}
                className="text-uppercase"
                tag={NavLink}
                to={to}
                activeClassName="active"
                exact={exact}
              >
                <Icon className={bem.e('nav-item-icon')} />
                <span className="">{name}</span>
              </BSNavLink>
            </NavItem>
          ))}
        </Nav>
      </div>
    </aside>
  );
}

export default Sidebar;
