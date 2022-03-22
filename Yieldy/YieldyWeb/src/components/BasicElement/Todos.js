import React, { useState } from 'react';
import PropTypes from 'utils/propTypes';
import { Empty } from 'antd';
import { ListGroupItem, ListGroup, Row, Label, ModalBody, ModalFooter, ModalHeader, Modal, ButtonGroup, Badge } from 'reactstrap';
import { Button, Popover,Card } from 'antd';

import NoDataImage from '../../assets/img/no-result.svg';
import { useSelector, useDispatch } from 'react-redux';
import PageSpinner from 'components/BasicElement/PageSpinner';
import { CreateTask, Task } from 'components/Form/';
import moment from 'moment';

export const propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes._id,
      content: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

const Todos = ({ todos, ...restProps }) => {

  const userInfo = useSelector(state => state.user.userProfile);
  const system = useSelector(state => state.system.systemInfo);
  const [isCreate, setIsCreate] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [viewAll, setViewAll] = useState(null);
  const dispatch = useDispatch();
  const [status, setStatus] = useState("WIP");

  const toggleCreateTask = () => {
    setIsCreate(!isCreate);
  }

  const toggleShowTask = (id) => {
    setTaskId(id);
    setShowTaskDetail(!showTaskDetail);
  }


  const toggleAllAndRefresh = () => {
    setIsCreate(false);
    setShowTaskDetail(false);
    setTaskId(null);
  }


  if (!!!userInfo || !!!system) {
    return (<PageSpinner />)
  }


  if (todos.length < 1) {
    return (
      <Row className="d-flex flex-wrap flex-column align-items-center justify-content-center">
        <Modal centered isOpen={isCreate} toggle={toggleCreateTask} >
          <ModalHeader>Create Task</ModalHeader>
          <ModalBody>
            <CreateTask systemId={system._id} onSuccess={() => { dispatch(toggleAllAndRefresh) }} />
          </ModalBody>
          <ModalFooter>
            <Button color="info" onClick={toggleCreateTask}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Empty
          className="-auto"
          image={NoDataImage}
          imageStyle={{
            height: 100,
          }}
          description={false}
        >
          {userInfo.role !== "technician" && <Button color="link" onClick={toggleCreateTask}>Create</Button>}
        </Empty>
      </Row>
    )
  }
  return (
    <ListGroup flush {...restProps}>
      <Modal centered isOpen={isCreate} toggle={toggleCreateTask} >
        <ModalHeader>Create Task</ModalHeader>
        <ModalBody>
          <CreateTask systemId={system._id} onSuccess={() => { dispatch(toggleAllAndRefresh) }} />
        </ModalBody>
        <ModalFooter>
          <Button color="info" onClick={toggleCreateTask}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <Modal centered isOpen={showTaskDetail} toggle={() => toggleShowTask(null)} >
        <ModalHeader>Task Detail</ModalHeader>
        <ModalBody>
          <Card>
            <Task taskId={taskId} onSuccess={() => { dispatch(toggleAllAndRefresh) }} />
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button color="info" onClick={() => toggleShowTask(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <ButtonGroup value={status} className="d-flex items-center content-center">
        <Popover content={"Click to show wip tasks"} title="Hint" trigger="hover">
          <Button
            className="ml-16"
            onClick={() => setStatus("WIP")}
            type={status === "WIP" && "primary"}>
            >WIP</Button>
        </Popover>
        <Popover content={"Click to show finished tasks"} title="Hint" trigger="hover">
          <Button
            onClick={() => setStatus("done")}
            type={status === "done" && "primary"}> >DONE</Button>
        </Popover>
      </ButtonGroup>
      <ListGroupItem className="border-0" color="info" >
        <Row className="d-flex">
          <Label className="mx-8 ml-4 mr-auto">
            Deadline:
          </Label>
          <Label className="align-self-center mr-8" >
            Content
          </Label>
        </Row>
      </ListGroupItem>
      {viewAll ? todos
        .sort((a, b) => new Date(a.duedate) - new Date(b.duedate))
        .filter(task => task.status === status)
        .map(({ _id, content, duedate } = {}) => (
          // <ListGroupItem key={_id} className="border-0" color={new Date(duedate) < new Date() ? "secondary" : ""}>
          <Row className="d-flex" key={_id}>
            <Label className="mx-8 ml-4 mr-auto">
              <span>{moment(new Date(duedate)).format("YYYY-MM-DD HH:mm")}</span>
              {new Date(duedate) < new Date() &&
                <Badge color="secondary" pill className="mr-1">
                  "overdue"
                </Badge>
              }
            </Label>
            <Label className="align-self-center text-red-500 mr-4" >
              {`${content.substring(0, 30)}...  `}<Button color="link" size="sm" onClick={() => toggleShowTask(_id)}>Detail</Button>
            </Label>
          </Row>
        )) : todos
          .sort((a, b) => new Date(a.duedate) - new Date(b.duedate))
          .filter(task => task.status === status)
          .slice(0, 5)
          .map(({ _id, content, duedate } = {}) => (
            // <ListGroupItem key={_id} className="border-0" color={new Date(duedate) < new Date() ? "secondary" : ""}>
            <Row className="d-flex my-1" key={_id} >
              <Label className="mx-8 ml-4 mr-auto">
                <span>{moment(new Date(duedate)).format("YYYY-MM-DD HH:mm")}</span>{' '}
                {new Date(duedate) < new Date() &&
                  <Badge color="secondary" pill className="mr-1">
                    "overdue"
                </Badge>
                }
              </Label>
              <Label className="align-self-center text-red-500 mr-4" >
                {`${content.substring(0, 30)}...  `}<Button color="link" size="sm" onClick={() => toggleShowTask(_id)}>Detail</Button>
              </Label>
            </Row>
          ))}
      <Row className="d-flex">
        <Button type="primary" className="mx-8 ml-4 mr-auto" onClick={toggleCreateTask}>Add</Button>
        {!viewAll && <Button type="link" className="align-self-center mr-8" onClick={() => setViewAll(true)}>View all ....</Button>}
      </Row>
    </ListGroup>
  );
};

Todos.propTypes = propTypes;

Todos.defaultProps = {
  todos: [],
};

export default Todos;
