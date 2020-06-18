import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { buildTwitterOauthURL, currentUser } from '../services';

const Loading = () => <div>Checking LoggedIn User...</div>;

const LoginWindow = ({handleAuthentication}) => (
  <Container fluid>
      <Row className="justify-content-md-center">
        <Col xs lg="3" >
          <img src={process.env.PUBLIC_URL+'/img/twitter_analytics.svg'} height="300" />
        </Col>
      </Row>
      <br />
      <Row className="justify-content-md-center">
        <Col xs lg="4" >
          <Button onClick={handleAuthentication} variant="outline-primary" size="lg" block> <img src="http://pngimg.com/uploads/twitter/twitter_PNG28.png" width="40" /> Authenticate with Twitter </Button>
        </Col>
      </Row>
    </Container>
)

export const Login = () => {

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(()=>{
    currentUser().then((user)=>{
      if(Object.keys(user).length > 0){
        setLoggedIn(true);
      }
      setTimeout(()=>setLoading(false), 2000);
    });
  }, [])

  const handleAuthentication = async () => {
    const authenticationURL = await buildTwitterOauthURL();
    console.log('handling event')
    const opened = window.open( authenticationURL ,"Ratting","width=550,height=670,left=150,top=200,toolbar=0,status=0,");
    let timer = setInterval(function() {   
      if(opened.closed) {  
          clearInterval(timer);  
          currentUser().then((user)=>{
            if(Object.keys(user).length > 0){
              setLoggedIn(true);
            }
          });
      }  
    }, 1000); 
  }

  if(loggedIn){
    return <Redirect to='/' />
  }
  return loading ? <Loading />:<LoginWindow handleAuthentication={handleAuthentication} />
}