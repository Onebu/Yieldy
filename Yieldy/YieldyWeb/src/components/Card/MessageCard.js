import React, { useState, useEffect } from 'react';
import { Skeleton, Card, Avatar, Input, Form, Button, Comment, Spin } from 'antd';
import { EditOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Badge, ModalFooter,ModalHeader, ModalBody, Modal  } from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useSelector, useDispatch } from 'react-redux';
import { Mention } from '../Form/';
import { MessageTreeCard } from './';
import moment from 'moment';
import "antd/dist/antd.css";
import { useHistory } from 'react-router';
import * as messageActions from '../../store/actions/message';
import { Task } from 'components/Form/';
import userImage from 'assets/img/users/userDefault.png';


const { Meta } = Card;

const Editor = ({ onChange, onSubmit, submitting, value, onToggle, postValue, type, showModal, task, device }) => (
    <div>
        <Form.Item>
            <Input.TextArea rows={4} onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item>
            {type === "Post" && <Button htmlType="submit" loading={submitting} type="primary" onClick={showModal}>
                @{!!task && "1 task;"}{!!device && "1 device"}
            </Button>}

            {"       "}<Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary" disabled={!!!postValue}>
                Publish
        </Button>{"       "}
            <Button htmlType="submit" loading={submitting} onClick={onToggle} type="primary">
                Cancel
        </Button>
        </Form.Item>
    </div>
);

const MessageCard = props => {

    const [publish, setPublish] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [postValue, setPostValue] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [visible, setVisible] = useState(false);
    const [task, setTask] = useState(null);
    const [device, setDevice] = useState(null);
    const [editType, setEditType] = useState(null);
    const [showMsg, setShowMsg] = useState(false);
    const [msg, setMsg] = useState(null);
    const history = useHistory();
    const systemId = props.system;
    const msgList = useSelector(state => state.message.fetchedMessages);
    const userInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();

    const handleInfiniteOnLoad = () => {
        setLoading(true);
        if (msgList.length > 12) {
            setHasMore(false);
            setLoading(false);
            return;
        }
        //Modify for future modification about inifite loading
        // this.fetchData(res => {
        //     data = data.concat(res.results);
        //     this.setState({
        //         data,
        //         loading: false,
        //     });
        // });
    };

    useEffect(() => {
        async function fetchMessage() {
            await dispatch(messageActions.fetchMessageBySystem(systemId));
        }
        fetchMessage();
        return () => { }
    }, [dispatch, systemId])

    const togglePublish = () => {
        setPublish(!publish);
    }

    const handleChange = e => {
        setPostValue(e.target.value);
    };

    const toggleShowTask = (id) => {
        setTaskId(id);
        setShowTaskDetail(!showTaskDetail);
    }


    const toggleAllAndRefresh = () => {
        setShowTaskDetail(false);
        setTaskId(null);
    }


    const handleSubmit = async () => {
        if (!postValue) {
            return;
        }
        if (editType === "Post") {
            setSubmitting(true);
            await dispatch(
                messageActions.createMessage(
                    postValue,
                    systemId,
                    device,
                    task
                )).then(clearAll());
        } else if (editType === "Reply") {
            setSubmitting(true);
            await dispatch(
                messageActions.replyMessage(
                    postValue,
                    replyTo,
                    systemId
                )).then(clearAll());
        }
    };

    const showModal = () => {
        setVisible(!visible);
    };


    const clearAll = () => {
        setShowMsg(false);
        setVisible(false);
        setSubmitting(false);
        setPublish(false);
        setTask(null);
        setDevice(null);
        setPostValue(null);
        setReplyTo(null);
        setShowTaskDetail(false);
    }

    return (
        <div>
            <Modal isOpen={showTaskDetail} toggle={clearAll} >
                <ModalHeader>Task Detail</ModalHeader>
                <ModalBody>
                    <Task taskId={taskId} onSuccess={() => { dispatch(toggleAllAndRefresh) }} />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => toggleShowTask(null)} >Cancel</Button>
                </ModalFooter>
            </Modal>
            <Modal
                isOpen={visible}
                toggle={showModal}
            >
                <ModalHeader>Mention</ModalHeader>
                <ModalBody>
                    <Mention
                        setTask={setTask}
                        setDevice={setDevice}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={clearAll}>Cancel</Button>
                    <Button type="primary" onClick={showModal}>Ok</Button>
                </ModalFooter>
            </Modal>
            <Modal
                isOpen={showMsg}
                toggle={clearAll}
            >
                <ModalHeader>
                    Message Detail
                </ModalHeader>
                <ModalBody>
                    <MessageTreeCard
                        onSuccess={clearAll}
                        msg={msg}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button type="primary" onClick={() => setShowMsg(false)}>Ok</Button>
                </ModalFooter>
            </Modal>
            <Skeleton loading={!!!msgList} avatar active />
            {!publish && <Button type="primary" onClick={() => {
                setEditType("Post");
                togglePublish()
            }} className="mb-2">New Post</Button>}
            {publish && <Comment
                avatar={
                    <Avatar
                        src={!!userInfo.profileImage? userInfo.profileImage.cloudImage : userImage}
                        alt="User Image"
                    />
                }
                content={
                    <Editor
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        value={postValue}
                        onToggle={clearAll}
                        postValue={postValue}
                        showModal={showModal}
                        type={editType}
                        task={task}
                        device={device}
                    />
                }
            />}
            <div style={{height:800}}
                className="demo-infinite-container">
                {!!msgList && <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={handleInfiniteOnLoad}
                    hasMore={!loading && hasMore}
                    useWindow={false}
                >
                    {msgList.map((msg) => {
                        return <Card
                            key={msg._id}
                            className="mt-2"
                            actions={[
                                <EditOutlined
                                    key="edit"
                                    onClick={() => {
                                        setReplyTo(msg._id);
                                        setEditType("Reply");
                                        togglePublish()
                                    }}
                                />,
                                <EllipsisOutlined
                                    key="ellipsis"
                                    onClick={() => {
                                        setMsg(msg._id);
                                        setShowMsg(true);
                                    }}
                                />,
                            ]}
                        >
                            <Meta
                                avatar={
                                    <Avatar
                                        src={!!msg.publisher.profileImage ?
                                            msg.publisher.profileImage.cloudImage : userImage}
                                    />
                                }
                                title={!!msg.publisher.name ? msg.publisher.name : msg.publisher.username}
                                description={msg.content}
                            />
                            <br />
                            <small className="text-muted">{moment(new Date(msg.dataAdded)).format("MM-DD HH:mm")}</small> <br />
                            {!!msg.task && <Badge
                                color="primary"
                                pill
                                className="mr-1 cursor-pointer"
                                onClick={() => toggleShowTask(msg.task._id)}
                            >
                                @Task:{`${msg.task.content.substring(0, 3)}...`}
                            </Badge>}
                            {!!msg.device && <Badge
                                color="primary"
                                pill
                                className="mr-1 cursor-pointer"
                                onClick={() => { 
                                    history.replace('/device', { device: msg.device._id });
                                }}
                            >
                                @Device:{`${msg.device.name.substring(0, 3)}...`}
                            </Badge>}
                        </Card>

                    })}
                    {loading && hasMore &&
                        <div className="demo-loading-container">
                            <Spin />
                        </div>
                    }
                </InfiniteScroll>}
            </div>
        </div >
    )
}

export default MessageCard;