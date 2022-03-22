import React, { useState, useEffect } from 'react';
import {
    Card,
    ListGroup,
    ListGroupItem,
    CardHeader
} from 'reactstrap';
import { Button, message } from 'antd';

import * as userActions from '../../store/actions/user';
import { useDispatch, useSelector } from 'react-redux';
import { PageSpinner } from 'components/BasicElement';
import Avatar from 'components/Avatar/Avatar';

const UserModal = props => {

    const [isLoading, setIsLoading] = useState(false);
    const fetchedUser = useSelector(state => state.user.fetchedUser);
    const userInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();

    useEffect(() => {
        setIsLoading(true);
        async function fetchUser(id, role) {
            await dispatch(userActions.fetchUserById(id, role))
        }
        fetchUser(props.userId, props.type).then(setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleResend = async () => {
        setIsLoading(true);
        await dispatch(userActions.resend(fetchedUser.username))
            .then(setIsLoading(false))
            .then(message.info("Resend Email succed"));
    }

    const handleDelete = async () => {
        setIsLoading(true);
        await dispatch(userActions.deleteUser(fetchedUser._id))
            .then(props.onSuccess());
    }

    if (isLoading || !!!fetchedUser || !!!userInfo) {
        return (
            <PageSpinner />
        )
    }

    return (
        <Card>
            <Card>
                <CardHeader className="d-flex justify-content-center align-items-center flex-column " >
                    <Avatar className="mb-2 h-16" />
                </CardHeader>
                <ListGroup flush>
                    {!!fetchedUser.name && <ListGroupItem>Fullname:{' '} {fetchedUser.name}</ListGroupItem>}
                    <ListGroupItem>Username:{' '}{fetchedUser.username}</ListGroupItem>
                    <ListGroupItem>Email:{' '} {fetchedUser.email}</ListGroupItem>
                    <ListGroupItem>Role:{' '} {fetchedUser.role === "co" ? "Company Owner" : fetchedUser.role}</ListGroupItem>
                    {!!!fetchedUser.confirmed &&
                        <ListGroupItem className="d-flex" style={{ backgroundColor: "#ccc" }}>
                            <span className='mr-auto'>This account hasn't verified</span>
                            {userInfo.role === "co" &&
                                <Button
                                    type="primary"
                                    onClick={handleResend}
                                >Resend Email</Button>}
                        </ListGroupItem>
                    }
                    {userInfo.role === "co" && fetchedUser.role!=="co" &&
                        <Button
                            className="right-0"
                            type="danger"
                            onClick={handleDelete}
                        >Delete User</Button>
                    }
                </ListGroup>
            </Card>
        </Card >
    )
}

export default UserModal;