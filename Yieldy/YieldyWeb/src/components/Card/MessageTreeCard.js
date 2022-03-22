import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Comment, Avatar, Button, Form, Input, } from 'antd';
import { Badge } from 'reactstrap';
import moment from 'moment';
import * as messageActions from '../../store/actions/message';
import { PageSpinner } from 'components/BasicElement';
import userImage from 'assets/img/users/userDefault.png';
import InfiniteScroll from 'react-infinite-scroller';

const Editor = ({ onChange, onSubmit, submitting, value, onToggle, postValue, type, showModal, task, device }) => (
    <div>
        <Form.Item>
            <Input.TextArea rows={4} onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item>

            <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary" disabled={!!!postValue}>
                Publish
        </Button>{"       "}
            <Button htmlType="submit" loading={submitting} onClick={onToggle} type="primary">
                Cancel
        </Button>
        </Form.Item>
    </div>
);

const MessageTreeCard = props => {

    const [isLoading, setIsLoading] = useState(false);
    const [publish, setPublish] = useState(false);
    const taskDetail = useSelector(state => state.message.messageById);
    const userInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [postValue, setPostValue] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    let mainContent = null;
    let basicContent = null;


    const handleInfiniteOnLoad = () => {
        setLoading(true);
        if (!!taskDetail && taskDetail.reply.length > 12) {
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
            await dispatch(messageActions.fetchMessageById(props.msg))
        }
        setIsLoading(true);
        fetchMessage().then(setIsLoading(false));
    }, [dispatch, props.msg])

    const handleChange = e => {
        setPostValue(e.target.value);
    };


    const handleSubmit = async () => {
        if (!postValue) {
            return;
        }
        setSubmitting(true);
        await dispatch(
            messageActions.replyMessage(
                postValue,
                replyTo,
                taskDetail.system
            )).then(clearAll())
            .then(props.onSuccess());
    };

    const clearAll = () => {
        setSubmitting(false);
        setPublish(false);
        setPostValue(null);
        setReplyTo(null);
    }



    if (!!taskDetail) {
        if (taskDetail.reply.length > 0) {
            mainContent = taskDetail.reply.map((post, id) => {
                return <Comment
                    key={post._id}
                    style={{ marginLeft: id * 20 }}
                    actions={[<span key="comment-nested-reply-to"
                        onClick={() => {
                            setPublish(true);
                            setReplyTo(post._id)
                        }}
                    >Reply</span>]}
                    author={!!!post.publisher ? "Removed User" : (!!post.publisher.name ? post.publisher.name : post.publisher.username)}
                    avatar={
                        <Avatar
                            src={!!post.publisher && !!post.publisher.profileImage ? post.publisher.profileImage.cloudImage : userImage}
                            alt="User Image"
                        />
                    }
                    content={
                        <p>
                            {post.content}
                        </p>
                    }
                >
                    <Badge color="secondary" pill className="mr-1">
                        {moment(new Date(post.dataAdded)).format("MM-DD HH:mm")}
                    </Badge>
                    {!!post.task && <Badge color="primary" pill className="mr-1">
                        @Task:{`${post.task.content.substring(0, 5)}...`}
                    </Badge>}
                    {!!post.device && <Badge color="primary" pill className="mr-1">
                        @Device:{`${post.device.name.substring(0, 5)}...`}
                    </Badge>}
                </Comment>
            })
        }
        basicContent = <Comment
            actions={[<span key="comment-nested-reply-to" onClick={() => {
                setPublish(true);
                setReplyTo(taskDetail._id)
            }}>Reply</span>]}
            author={!!!taskDetail.publisher ? "Removed User" : (!!taskDetail.publisher.name ? taskDetail.publisher.name : taskDetail.publisher.username)}
            avatar={
                <Avatar
                    src={!!taskDetail.publisher && !!taskDetail.publisher.profileImage ? taskDetail.publisher.profileImage.cloudImage : userImage}
                    alt="User Image"
                />
            }
            content={
                <p>
                    {taskDetail.content}
                </p>
            }
        >
        </Comment>
    }



    if (isLoading || !!!taskDetail) {
        return <PageSpinner />
    }

    return (
        <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={handleInfiniteOnLoad}
            hasMore={!loading && hasMore}
            useWindow={false}
        >
            {mainContent}
            <div>
                Selected Post
                {basicContent}
            </div>
            {publish && <Comment
                avatar={
                    <Avatar
                        src={!!userInfo.profileImage ? userInfo.profileImage.cloudImage : userImage}
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
                    />
                }
            />}
        </InfiniteScroll>
    )
}

export default MessageTreeCard;
