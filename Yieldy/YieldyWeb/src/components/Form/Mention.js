import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Row } from 'reactstrap';


const Mention = props => {
    const system = useSelector(state => state.system.systemInfo);
    const [dev, setDev] = useState(null);
    const [t, setT] = useState(null);

    const device = (
        <Menu>
            {system.devices.map(device => {
                return <Menu.Item
                    key={device._id}
                    onClick={()=>{
                        setDev(device.name);
                        props.setDevice(device._id)
                    }
                    }
                    >
                    {device.name}
                </Menu.Item>
            })}
        </Menu>
    );

    const task = (
        <Menu>
            {system.tasks.map(task => {
                return <Menu.Item 
                key={task._id}
                onClick={()=>{
                    setT(`${task.content.substring(0, 5)}...`);
                    props.setTask(task._id);
            }}
                >
                    {`${task.content.substring(0, 5)}...`}
                </Menu.Item>
            })}
        </Menu>
    );

    return (
        <Row className="ml-4">
            <Dropdown overlay={device}>
                <Button className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    {!!dev ? dev : "Select Device"}<DownOutlined />
                </Button>
            </Dropdown>
            <Dropdown overlay={task}>
                <Button className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    {!!t ? t : "Select Task"}<DownOutlined />
                </Button>
            </Dropdown>
        </Row>
    )
}

export default Mention;