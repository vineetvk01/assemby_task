import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Image, Card, ListGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { Tweet } from '../components/Tweet';
import { UserInfo } from '../components/UserInfo';
import { MostSharedLinks } from '../components/MostSharedLinks';
import { UserWithMostLinks } from '../components/UserWithMostLinks';
import { fetchTimeline } from '../services';

const Name = styled.span`
  margin: 10px 0;
  font-weight: 500;
`

const Location = styled.span`
  margin: 0px 0;
`;

const Title = styled.p`
  text-align:center;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`

export const DashBoard = () => {

  const [timeline, setTimeline] = useState([]);
  const [total, setTotal] = useState('');
  const [topDomains, setTopDomains] = useState('');
  const [userSharedMost, setUserSharedMost] = useState('');

  useEffect(()=>{
    fetchTimeline().then((data)=>{
      console.log(data);
      const { total, timeline, top_domain_shared, user_shared_most_links } = data;
      setTimeline(timeline);
      setTotal(total);
      setTopDomains(top_domain_shared);
      setUserSharedMost(user_shared_most_links);
    })
  }, [])

  return(<Container fluid>
    <Row>
      <Col xs lg={3}>
        <UserInfo />
        <br />
        <UserWithMostLinks userSharedMostLinks={userSharedMost} />
        <br />
        <MostSharedLinks links={topDomains} />

      </Col>
      <Col xs lg={9}>
        <div>
          { timeline.map((tweet)=>{
            return <Tweet key={tweet.id} name={tweet.name} text={tweet.full_text} location={tweet.location} imageURL={tweet.profile_image_url} date={tweet.created_at} />
          })}
        </div>


      </Col>
    </Row>
  </Container>)


}