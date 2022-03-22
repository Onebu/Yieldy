import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Card, CardBody } from 'reactstrap';

import UserCard from './UserCard';

configure({ adapter: new Adapter() });

describe('<UserCard />', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<UserCard />);
    });

    it('should render <Card /> elements ', () => {
        expect(wrapper.find(Card));
    });

    it('should render  <CardBody /> elements ', () => {
        // wrapper.setProps({...:...});    Change this to pass props for test
        expect(wrapper.find(CardBody));
    });

});