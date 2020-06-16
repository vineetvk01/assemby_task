import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

const Title = styled.p`
  text-align:center;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`

const User = styled.p`
  text-align:center;
  font-size: 10px;
  font-weight: 400;
  color: #333;
  text-transform: uppercase;
`

export const UserWithMostLinks = ({ userSharedMostLinks }) => {

  const sortable = [];

  for (const user in userSharedMostLinks) {
    sortable.push([user, userSharedMostLinks[user]]);
  }

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  return (
    <Card>
      <Card.Body style={{ padding: '10px' }}>
        <Title>User shared most links</Title>
        <div>
          {sortable.slice(0,5).map((userLink)=>{
            return <User>{userLink[0]} ( {userLink[1]} )</User>
          })}
        </div>
      </Card.Body>
    </Card>
  )
}