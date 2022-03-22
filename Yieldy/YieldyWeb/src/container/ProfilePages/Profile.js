import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button
} from 'reactstrap';
import {
  MdModeEdit,
  MdLiveHelp,
  MdInfo
} from 'react-icons/md';
import moment from 'moment';

import { UserCard } from 'components/Card/';
import { ProfileBg } from 'components/Layout/';
import * as userActions from '../../store/actions/user';
import { PageSpinner } from "components/BasicElement";
import { UpdateUsername, EditImage } from 'components/Form/';
const Profile = props => {

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const profile = useSelector(state => state.user.userProfile);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    async function fetchProfile() {
      await dispatch(
        userActions.fetchUserProfile()
      );
    }
    fetchProfile()
      .then(setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const toggleUpdateUsername = () => {
    setIsUpdating(!isUpdating);
  }

  const tolleAllAndRefresh = async () => {
    setIsUpdating(false);
    setIsEditing(false);
  }

  const toggleEditImage = () => {
    setIsEditing(!isEditing);
  }

  if (isLoading || !!!profile) {
    return (<PageSpinner />)
  }

  return (
    < ProfileBg >
      <UserCard
        avatarSize={120}
        avatar={!!profile.profileImage ? profile.profileImage.cloudImage : undefined}
        className="border-light"
      >
        <div className="text-center">
          <Button outline color="warning" size="sm" onClick={toggleEditImage} >Edit Profile Image</Button>
        </div>
        <br />
        <Modal centered isOpen={isUpdating} toggle={toggleUpdateUsername} >
          <ModalHeader>Update Username</ModalHeader>
          <ModalBody>
            <UpdateUsername type={profile.role} onSuccess={() => { dispatch(tolleAllAndRefresh) }} />
          </ModalBody>
          <ModalFooter>
            <Button color="info" onClick={toggleUpdateUsername}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Modal centered isOpen={isEditing} toggle={toggleEditImage} >
          <ModalHeader>Edit Profile Image</ModalHeader>
          <ModalBody>
            <EditImage type={profile.role} onSuccess={() => { dispatch(tolleAllAndRefresh) }} />
          </ModalBody>
          <ModalFooter>
            <Button color="info" onClick={toggleEditImage}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <ListGroup>
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">Username:</div>
            <div className="mr-auto col-md-4 ">{!!profile.name && profile.name}
              {!!!profile.name ?
                profile.username
                :
                <small className="text-muted">({profile.username})</small>}</div>
            <div className="cursor-pointer align-self-center text-red-500 " onClick={toggleUpdateUsername}>Edit<span>&nbsp;&nbsp;</span><MdModeEdit /></div>
          </ListGroupItem>
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">Email:</div>
            <div className="mr-auto col-md-4">{profile.email}</div>
            <MdLiveHelp className="cursor-pointer align-self-center" />
          </ListGroupItem>
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">User type:</div>
            <div className="mr-auto col-md-4">{profile.role === "co" ? "Company Owner" : profile.role}</div>
            <MdLiveHelp className="cursor-pointer align-self-center" />
          </ListGroupItem>
          <hr />
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">Paid plan:</div>
            <div className="mr-auto col-md-4">Premium</div>
            <MdLiveHelp className="cursor-pointer align-self-center" />
          </ListGroupItem>
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">Membership cost:</div>
            <div className="mr-auto col-md-4">129$</div>
            <MdLiveHelp className="cursor-pointer align-self-center" />
          </ListGroupItem>
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">Next billing date:</div>
            <div className="mr-auto col-md-4">{moment(new Date()).format('YYYY-MM-DD')}</div>
            <MdLiveHelp className="cursor-pointer align-self-center" />
          </ListGroupItem>
          <hr />
          <ListGroupItem action className="border-light d-flex" onClick={() => { }}>
            <div className="mx-4 font-semibold col-md-4">Company:</div>
            <div className="mr-auto col-md-4">{profile.company[0].name}</div>
            <div className="cursor-pointer align-self-center text-red-500" onClick={() => { history.push("/company") }}>Check now<span>&nbsp;&nbsp;</span><MdInfo /></div>
          </ListGroupItem>
        </ListGroup>
      </UserCard>
    </ProfileBg >
  );
}

export default Profile;