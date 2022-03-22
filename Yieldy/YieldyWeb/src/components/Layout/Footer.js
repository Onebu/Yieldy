import React from 'react';

import { Navbar, Nav, NavItem } from 'reactstrap';

import {SourceLink} from 'components/BasicElement';

const Footer = () => {
  return (
    <Navbar>
      <Nav navbar>
        <NavItem>
          @YB <SourceLink>Github</SourceLink>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default Footer;
