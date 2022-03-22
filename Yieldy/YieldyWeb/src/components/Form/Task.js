import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, ListGroupItem } from 'reactstrap';
import { Card, Switch } from 'antd';

import * as taskActions from '../../store/actions/task';
import { PageSpinner } from 'components/BasicElement';
import moment from 'moment';

const Task = props => {

    const [isLoading, setIsLoading] = useState(false);
    const taskInfo = useSelector(state => state.task.fetchedTaskById);
    const userInfo = useSelector(state => state.user.userProfile);
    const systemInfo = useSelector(state => state.system.systemInfo);
    const dispatch = useDispatch();



    useEffect(() => {
        setIsLoading(true);
        async function fetchTask() {
            await dispatch(taskActions.fetchTaskById(props.taskId));
        }

        if (props.taskId) {
            fetchTask().then(setIsLoading(false));
        }

    }, [dispatch, props.taskId])

    const handleChange = async (e, id) => {
        if (e) {
            dispatch(taskActions.assignTechnician(taskInfo._id, id, systemInfo._id))
        } else {
            dispatch(taskActions.revokeTechnician(taskInfo._id, id, systemInfo._id))
        }
    }

    const handleChangeStatus = async (e) => {
        if (e) {
            dispatch(taskActions.updateTaskById(taskInfo._id, "WIP", systemInfo._id))
        } else {
            dispatch(taskActions.updateTaskById(taskInfo._id, "done", systemInfo._id))
        }
    }

    if (isLoading || !!!taskInfo || !!!userInfo || !!!systemInfo) {
        return <PageSpinner />
    }
    return (
        <Row>
            <Col>
                <ListGroupItem className="d-flex">
                    <div className="mx-8 ml-4 mr-auto">Technicians</div>
                    {userInfo.role !== "technicians" &&
                        <div className="align-self-center text-red-500 mr-4 cursor-pointer" onClick={() => { }}>
                            Manage
                                    </div>}
                </ListGroupItem>
                {systemInfo.technicians.map(tech => {
                    return (
                        <ListGroupItem className="d-flex" key={tech._id}>
                            <div className="mx-8 ml-4 mr-auto">{!!tech.name ? tech.name : tech.username}</div>
                            <div className="align-self-center mr-4 cursor-pointer" onClick={() => { }}>
                                <Switch
                                    checkedChildren="Revoke"
                                    unCheckedChildren="Assign"
                                    checked={taskInfo.technicians.map(t => {
                                        return t._id
                                    }).includes(tech._id)}
                                    onChange={(event) => handleChange(event, tech._id)}
                                />
                            </div>
                        </ListGroupItem>
                    )
                })}
                < hr />
                <Card title="Content">{taskInfo.content}</Card>
                <ListGroupItem className="d-flex">
                    <div className="mx-8 ml-4 mr-auto">Created By</div>
                    <div className="align-self-center mr-4" onClick={() => { }}>
                        {!!!taskInfo.publisher && "Company Onwer"}
                        {!!taskInfo.publisher && !!taskInfo.publisher.name ?
                            taskInfo.publisher.name :
                            !!taskInfo.publisher && taskInfo.publisher.username}
                    </div>
                </ListGroupItem>
                <ListGroupItem className="d-flex">
                    <div className="mx-8 ml-4 mr-auto">Created At</div>
                    <div className="align-self-center  mr-4" onClick={() => { }}>
                        {moment(new Date(taskInfo.dataAdded)).format("YYYY-MM-DD HH:mm")}
                    </div>
                </ListGroupItem>
                <ListGroupItem className="d-flex">
                    <div className="mx-8 ml-4 mr-auto">Deadline</div>
                    <div className="align-self-center mr-4" onClick={() => { }}>
                        {moment(new Date(taskInfo.duedate)).format("YYYY-MM-DD HH:mm")}
                    </div>
                </ListGroupItem>
                <ListGroupItem className="d-flex">
                    <div className="mx-8 ml-4 mr-auto">Change status</div>
                    <div className="align-self-center mr-4 cursor-pointer" onClick={() => { }}>
                        <Switch
                            checkedChildren="WIP"
                            unCheckedChildren="DONE"
                            checked={taskInfo.status === "WIP"}
                            onChange={(event) => handleChangeStatus(event)}
                        />
                    </div>
                </ListGroupItem>
            </Col>
        </Row>
    )
}

export default Task;