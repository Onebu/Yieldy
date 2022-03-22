import React, { useState } from 'react';
import { Card, Result, Button, Popover, Menu, Switch } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { PageSpinner } from '../BasicElement/';
import * as deviceActions from '../../store/actions/device';

const DeviceOptionCard = props => {

    const { deviceInfo, onDelete } = props;
    const userInfo = useSelector(state => state.user.userProfile);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [theme, setTheme] = useState("light");
    const [current, setCurrent] = useState("1");

    const changeTheme = value => {
        setTheme(value ? 'dark' : 'light');
    };

    const handleClick = e => {
        setCurrent(e.key);
    };



    if (!!!userInfo || isLoading) {
        return <PageSpinner />
    }

    const handleDelete = async () => {
        setIsLoading(true);
        await dispatch(deviceActions.deletedevice(deviceInfo.system._id, deviceInfo._id))
            .then(setIsLoading(false))
            .then(onDelete());
    }

    const handleVisibleChange = visible => {
        setVisible(visible);
    };


    if (!!!deviceInfo) {
        return (<Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
        />)
    }

    return (
        <Card style={{ minWidth: 200 }} title="Device Info">
            <Switch
                checked={theme === 'dark'}
                onChange={changeTheme}
                checkedChildren="Dark"
                unCheckedChildren="Light"
            />
            <br />
            <br />
            <Popover
                content={<Button type="danger" onClick={handleDelete} >^_^Yes</Button>}
                title="Are you sure?"
                trigger="click"
                visible={visible}
                onVisibleChange={handleVisibleChange}
            >
                {(userInfo.role === "co" || userInfo.role === "admins") && <div className="align-self-center text-red-500 mr-4 cursor-pointer" >
                    Remove
                </div>}
            </Popover>
            <hr></hr>
            <p>Name: {deviceInfo.name}</p>
            <p>Stats Code:<strong> {deviceInfo.statusCode}</strong></p>
            <Menu
                theme={theme}
                onClick={(e)=>{
                    props.handleClick(e.key);
                    handleClick(e)

                }}
                style={{ width: "100%" }}
                defaultOpenKeys={['sub0']}
                selectedKeys={[current]}
                mode="inline"
            >
                <Menu.Item key="1">Metric stats</Menu.Item>
                <Menu.Item key="2">Audit stats</Menu.Item>
                <Menu.Item key="3" disabled>File stats</Menu.Item>
                <Menu.Item key="4" disabled>Winlog stats</Menu.Item>
                <Menu.Item key="5" disabled>Packet stats</Menu.Item>
                <Menu.Item key="6" disabled>Heart stats</Menu.Item>
            </Menu>
        </Card>
    )
}

export default DeviceOptionCard;