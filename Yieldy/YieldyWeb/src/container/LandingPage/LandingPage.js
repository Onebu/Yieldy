import React, { useState } from 'react';
import Typist from 'react-typist';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Row } from 'reactstrap';
import { Modal, ModalBody, Container, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { SourceLink } from '../../components/BasicElement';
import AuthFormCo, { STATE_LOGIN } from 'components/Form/AuthFormCo';
import {AuthFormUser} from 'components/Form/';

const LandingPage = props => {

  //Render specs
  const renderContent = {
    devIntro: 'Yieldy',
    devDesc:
      "Let's connect!",
    backgroundIndex: 0,
    appClass: 'gradient',
    bgStyle: {
      background:
        'linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB)',
      backgroundSize: '400% 400%'
    }
  }

  const [isShowCo, setIsShowCo] = useState(false);
  const [isShowUser, setIsShowUser] = useState(false);
  const [authState, setAuthState] = useState(STATE_LOGIN);


  //Modal toggle handlers
  const toggleCo = () => {
    setIsShowCo(!isShowCo);
  };

  const toggleUser = () => {
    setIsShowUser(!isShowUser);
  };

  //Handle company owners auth form state that allows to switch between signup and login with a single modal
  const handleAuthState = authState => {
    setAuthState(authState);
  };

  return (
    <Container fluid className={renderContent.appClass} style={renderContent.bgStyle}>
      <main className="App-main">
        {props.isAuthed ? (<Redirect to='/dashboard' />) : (null)}
        <h1 className="intro">{renderContent.devIntro}</h1>
        <div className="tagline" style={{ marginBottom: "3em" }}>
          <Typist>{renderContent.devDesc}</Typist>
        </div>
        <Row style={{ marginBottom: "3em" }}>
          <SourceLink className="navbar-brand d-flex" link="">
            <FaGithub size={30} color={"white"} />
          </SourceLink>
          <SourceLink className="navbar-brand d-flex" link="linkedin">
            <FaLinkedin size={30} color={"white"} />
          </SourceLink>
        </Row>
        <Button color="link" outline onClick={toggleCo}>
          <u>Company Onwer? </u>
        </Button>
        <Button color="link" outline onClick={toggleUser}>
          <u>Normal User? </u>
        </Button>
        <Modal
          isOpen={isShowCo}
          toggle={toggleCo}
          size="sm"
          fade={true}
          centered>
          <ModalBody>
            <AuthFormCo
              authState={authState}
              onChangeAuthState={handleAuthState}
            />
          </ModalBody>
        </Modal>
        <Modal
          isOpen={isShowUser}
          toggle={toggleUser}
          size="sm"
          fade={true}
          centered>
          <ModalBody>
            <AuthFormUser
              authState={authState}
            />
          </ModalBody>
        </Modal>
      </main>
    </Container>
  );
}

const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    isAuthed: state.auth.token !== null,
  };
};


export default connect(mapStateToProps)(LandingPage);