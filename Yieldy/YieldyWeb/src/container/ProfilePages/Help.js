import React from "react";
import {
  CardBody,
  CardText,
  CardTitle,
  CardLink
} from 'reactstrap';
import {Card} from 'antd';


import { ProfileBg } from 'components/Layout/';

const Help = props => {
  return (
      <ProfileBg >
        <Card>
          <CardBody>
            <CardTitle className="text-center">What is Yieldy?</CardTitle>
            <CardText>
              Yieldy is a cross-platform application to monitoring
              and managing group of computers administered (System) by the user,
              and systems are grouped as a cluster of devices in server. It is required
              to have a web browser or a mobile depends on user’s platform and also a connection to
              the web server is needed. This represents a cost savings by not requiring large resources.
              The access  is done through a PC (web browser), tablet or mobile phone (Android or iOS, all
              of the systems have their own version available).
          </CardText>
          </CardBody>
          <hr />
          <CardBody>
            <CardTitle className="text-center">How to use it?</CardTitle>
            <CardText>
              Internet then you are ready to go.  ^_^
          </CardText>
          </CardBody>
          <hr />
          <CardBody>
            <CardTitle className="text-center">Who am I?</CardTitle>
            <CardText>
              A person who wants to be nobody.
          </CardText>
          </CardBody>
          <hr />

          <CardBody>
            <CardTitle className="text-center">I hope that this situation is going to end soom.  ----19.04.2020</CardTitle>
          </CardBody>
          <hr />
          <CardBody>
            <CardLink tag="a" href="https://github.com/Onebu" target="_blank">
              Visit my github
              </CardLink>
            <CardLink tag="a" href="https://www.linkedin.com/in/xinliu-yb" target="_blank">
              Visit my linkedin
              </CardLink>
          </CardBody>
        </Card>
      </ProfileBg>
  );
}

export default Help;