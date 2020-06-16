import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';

export const Navigation = () => {
  return(
    <>
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand href="#home">
      <img
        alt=""
        src="http://pngimg.com/uploads/twitter/twitter_PNG35.png"
        width="30"
        height="30"
        className="d-inline-block align-top"
      />{' '}
      Twitter Analyzer
    </Navbar.Brand>
  </Navbar>
</>
  )
}