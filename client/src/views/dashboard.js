import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { Tweet } from '../components/Tweet';
import { UserInfo } from '../components/UserInfo';
import { MostSharedLinks } from '../components/MostSharedLinks';
import { UserWithMostLinks } from '../components/UserWithMostLinks';
import { currentUser, fetchTimeline, analysis } from '../services';

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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [topDomains, setTopDomains] = useState([]);
  const [userSharedMost, setUserSharedMost] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(()=>{
    currentUser().then(({user}) => {
        if(!user){
          setIsLoggedIn(false);
        }else{
          console.log(user);
        }
    });
    
    fetchTimeline().then((data)=>{
      const { total_count, tweets, page } = data;
      setTimeline(tweets);
      setTotal(total_count);
      setPage(page);
    })

    analysis().then((data)=>{
      const { user_shared_most_links, top_domain_shared } = data;
      setUserSharedMost(user_shared_most_links);
      setTopDomains(top_domain_shared);
    })
  }, [])

  if(!isLoggedIn){
    return <Redirect to="/login" />
  }

  return(<Container fluid>
    <Row>
      <Col xs lg={3}>
        <UserInfo updateLoggedIn={setIsLoggedIn} />
        <br />
        <UserWithMostLinks userSharedMostLinks={userSharedMost}/>
        <br />
        <MostSharedLinks domains={topDomains} />

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