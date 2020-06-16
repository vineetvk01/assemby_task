import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Image, Card, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { currentUser, logout } from '../services';

const Name = styled.p`
  margin: 10px 0;
  font-weight: 500;
  margin: 0px 0;
`;

const Location = styled.p`
  font-size: 12px;
  margin: 0px 0;
`;

const Email = styled.p`
  font-size: 10px;
  margin: 0px 0;
`;

export const UserInfo = () => {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    currentUser({ all: true }).then((data) => {
      const { user } = data;
      if (user) {
        const { email, linkedAccounts } = user;
        setEmail(email);
        setFullName(linkedAccounts.twitter.name);
        setLocation(linkedAccounts.twitter.location);
        setImageURL(linkedAccounts.twitter.profile_image_url);
      }
    })
  }, [])

  const logout = () => {
    logout().then(() => {
      return <Redirect to="/login" />
    });
  }

  return (
    <Card>
      <Card.Body style={{ padding: '10px' }}>
        <Container fluid>
          <Row>
            <Col xs={4}>
              <Image src={imageURL} roundedCircle />
            </Col>
            <Col xs={8}>
              <Name>{fullName}</Name>
              <Email>{email}</Email>
              <Location>{location}</Location>
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={12}>
              <Button variant="outline-primary" onClick={logout} block> Logout </Button>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  )
}