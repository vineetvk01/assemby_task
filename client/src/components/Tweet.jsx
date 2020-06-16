import React from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import styled from 'styled-components';

const Name = styled.span`
  margin: 10px 0;
  font-weight: 500;
`

const Text = styled.p`
  margin: 0px 0;
  font-size: 14px;
  color: #666;
`;

const Location = styled.span`
  margin: 0px 0;
  font-size: 12px;
  color: #666;
`;

const Date = styled.span`
  margin: 0px 0;
  font-size: 12px;
  color: #666;
`;

export const Tweet = ({name, text, location, imageURL, date}) => {
  return (
    <Card body style={{marginBottom: "15px"}}>
      <Container fluid>
        <Row>
          <Col xs={2}>
            <Image src={imageURL} roundedCircle width="50%" style={{margin: 'auto'}} />
          </Col>
          <Col xs={10}>
            <Name>{name}</Name><br />
            <Text>{text}</Text>
            <Location>{location}</Location> , <Date>{date}</Date>
          </Col>
        </Row>
      </Container>
    </Card>
  )
}