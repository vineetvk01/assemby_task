import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, InputGroup, FormControl } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { Tweet } from '../components/Tweet';
import { UserInfo } from '../components/UserInfo';
import { MostSharedLinks } from '../components/MostSharedLinks';
import { UserWithMostLinks } from '../components/UserWithMostLinks';
import { currentUser, fetchTimeline, analysis, sync } from '../services';

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
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(20);
  const [topDomains, setTopDomains] = useState([]);
  const [userSharedMost, setUserSharedMost] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');

  useEffect(() => {
    currentUser().then(({ user }) => {
      if (!user) {
        setIsLoggedIn(false);
      }
    });

    fetchTimeline({ page, count, hashtags, location }).then((data) => {
      const { total_count, tweets, page } = data;
      setTimeline(tweets);
      setTotal(parseInt(total_count));
    })

    analysis().then((data) => {
      const { user_shared_most_links, top_domain_shared } = data;
      setUserSharedMost(user_shared_most_links);
      setTopDomains(top_domain_shared);
    })
  }, [page, count]);

  if (!isLoggedIn) {
    return <Redirect to="/login" />
  }

  const syncTwitter = () => {
    sync().then(({ success }) => {
      if (Boolean(success)) {
        return <Redirect to="/" />
      }
    })
  }

  const applyFilter = () => {
    fetchTimeline({ page, count, hashtags, location }).then((data) => {
      const { total_count, tweets, page } = data;
      setTimeline(tweets);
      setTotal(parseInt(total_count));
      setPage(parseInt(page));
    })
  }

  const next = () => total - (page * count) > 0;

  return (
    <Container fluid>
      <Row>
        <Col xs lg={3}>
          <UserInfo updateLoggedIn={setIsLoggedIn} />
          <br />
          <UserWithMostLinks userSharedMostLinks={userSharedMost} />
          <br />
          <MostSharedLinks domains={topDomains} />

        </Col>
        <Col xs lg={9}>
          <Row>
            <Col xs lg={5}>
              <Button variant="outline-primary" onClick={syncTwitter} style={{ marginRight: '5px' }}> Sync Now! </Button>
              <Button variant="outline-info" onClick={() => setPage((page) => page > 1 ? page - 1 : page)} style={{ marginRight: '5px' }} > Prev </Button>
              <span style={{ fontSize: '20px', margin: '0 5px' }}>{page}</span>
              <Button variant="outline-info" onClick={() => setPage((page) => next() ? page + 1 : page)} style={{ marginRight: '5px' }}> Next </Button>
            </Col>
            <Col xs lg={7}>  
            <InputGroup style={{ width: '100%' }}>
                <InputGroup.Prepend>
                  <InputGroup.Text id="basic-addon1">♯</InputGroup.Text>
                </InputGroup.Prepend>
                
                <FormControl
                  placeholder="HasTags"
                  aria-label="Hash-Tags"
                  aria-describedby="basic-addon1"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs lg={12} >
              <InputGroup className="mt-3 mb-1" style={{ width: '100%' }}>
                <InputGroup.Prepend>
                  <InputGroup.Text id="basic-addon1">📍</InputGroup.Text>
                </InputGroup.Prepend>
                
                <FormControl
                  placeholder="Location"
                  aria-label="Location"
                  aria-describedby="basic-addon1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <InputGroup.Append>
                  <Button variant="outline-secondary" onClick={applyFilter}>Search</Button>
                </InputGroup.Append>
              </InputGroup>
            </Col>
          </Row>
          <br />
          <div>
            {timeline.map((tweet) => {
              console.log(tweet);
              return <Tweet key={tweet._id} name={tweet.name} text={tweet.full_text} location={tweet.location} imageURL={tweet.profile_image_url} date={tweet.created_at} />
            })}
          </div>
        </Col>
      </Row>
    </Container>)


}