import React, { useState } from 'react';
import PropTypes from 'utils/propTypes';
import { CardImg, CardImgOverlay, ListGroup, Row, ModalBody, ModalFooter, ModalHeader, Modal } from 'reactstrap';
import { propTypes as TodosPropTypes } from 'components/BasicElement/Todos';
import { Card, Empty, Button } from 'antd';
import backgroundImage from 'assets/img/bg/background_1920-18.jpg';
import * as taskActions from '../../store/actions/task';
import Board from 'react-trello'

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

const TodosCard = ({ image, title, subtitle, todos, ...restProps }) => {

  const userInfo = useSelector(state => state.user.userProfile);
  const system = useSelector(state => state.system.systemInfo);
  const [isCreate, setIsCreate] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const dispatch = useDispatch();

  let data = {
    lanes: [
      {
        id: 'WIP',
        title: 'Planned Tasks',
        hideCardDeleteIcon: true,
        canAddCards: true,
        cardStyle: { backgroundColor: '#ffe' },
        cards: [
        ]
      },
      {
        id: 'done',
        title: 'Completed',
        editable: false,
        laneStyle: { backgroundColor: '#cde' },
        cards: []
      }
    ]
  }

  const toggleCreateTask = () => {
    setIsCreate(!isCreate);
  }

  const toggleShowTask = (id) => {
    setTaskId(id);
    setShowTaskDetail(!showTaskDetail);
  }

  const handleChangeStatus = async (id, status) => {
    dispatch(taskActions.updateTaskById(id, status, system._id))
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
  } else if (!!todos && !!userInfo) {
    todos
      .sort((a, b) => new Date(a.duedate) - new Date(b.duedate))
      .filter(task => task.status === "WIP")
      .map((task => {
        return data.lanes[0].cards.push({
          id: task._id,
          title: moment(new Date(task.duedate)).format("YYYY-MM-DD HH:mm"),
          description: task.content,
          label: new Date(task.duedate) < new Date() ? "overdue" : "",
        })
      }))
    todos
      .sort((a, b) => new Date(a.duedate) - new Date(b.duedate))
      .filter(task => task.status !== "WIP")
      .map((task => {
        return data.lanes[1].cards.push({ id: task._id, title: moment(new Date(task.duedate)).format("YYYY-MM-DD HH:mm"), description: task.content, label: new Date(task.duedate) < new Date() ? "overdue" : "" })
      }))
  }

  return (
    <Card {...restProps}>
      <div className="position-relative mb-0">
        <CardImg src={image} />
        <CardImgOverlay className="bg-dark" style={{ opacity: 0.8, display: 'flex', justifyContent: 'flex-end' }}>
          {!!userInfo && userInfo.role !== "technician" && <Button type="primary" className="bottom-0 right-0" onClick={toggleCreateTask}>Create New task</Button>}
        </CardImgOverlay>
      </div>
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
      </ListGroup>
      <Board
        data={data}
        onCardClick={(card) => toggleShowTask(card)}
        handleDragEnd={(cardId, sourceLaneId, targetLaneId, position, cardDetails) =>
          handleChangeStatus(cardId, targetLaneId)
        }
        tagStyle={{ fontSize: '80%' }}
        cardDraggable={userInfo.role !== "technician"}
        hideCardDeleteIcon
        laneStyle={{ backgroundColor: '#a66' }}
        style={{ backgroundColor: '#ddd' }} />

    </Card>
  );
};

TodosCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  todos: TodosPropTypes.todos,
};

TodosCard.defaultProps = {
  image: backgroundImage,
  title: 'Tasks',
  subtitle: 'Due soon...',
};

export default TodosCard;
