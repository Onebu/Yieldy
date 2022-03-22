import React, { useState, useEffect } from "react";
import {
  CardBody,
  ListGroup,
  ListGroupItem,
  CardHeader,
} from 'reactstrap';
import { Card} from 'antd';
import Switch from 'react-switch';
import { useDispatch, useSelector } from 'react-redux';

import * as configActions from '../../store/actions/config';
import { ProfileBg } from 'components/Layout/';
import { PageSpinner } from "components/BasicElement";

const Settings = props => {

  const [isLoading, setIsLoading] = useState(false);
  const config = useSelector(state => state.config.userConfig);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    async function fetchConfig() {
      await dispatch(
        configActions.fetchUserConfig()
      );
    }
    fetchConfig()
      .then(setIsLoading(false));
  }, [dispatch])

  const handleSend = () => {
    dispatch(configActions.updateConfig(config._id, !config.pushnotification));
  }

  if (isLoading || config == null) {
    return (
      <PageSpinner />
    )
  }

  return (
      <ProfileBg >
        <Card>
          <CardBody>
            <CardHeader>
              Notification:
          </CardHeader>
            <ListGroup>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">Push Notification:</div>
                <Switch onChange={handleSend} checked={config.pushnotification} />
              </ListGroupItem>
              <hr />
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div>dummy settings</div>
                <hr />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
              <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
                <div className="mx-4 font-semibold col-sm-4 mr-auto">something:</div>
                <Switch onChange={() => { }} checked={false} />
              </ListGroupItem>
            </ListGroup>

          </CardBody>
        </Card>
      </ProfileBg>
  );
}

export default Settings;