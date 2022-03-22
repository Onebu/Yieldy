import React from "react";
import styled from 'styled-components';
import { Result } from 'antd';

const Section = styled.div`
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  color: coral;
  height:100vh
`


const NotFound = props => {
  return (
    <Section>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      // extra={<Button type="primary">Back Home</Button>}
      />
    </Section >
  );
}

export default NotFound;