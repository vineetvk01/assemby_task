import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

const Title = styled.p`
  text-align:center;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`

const Link = styled.p`
  text-align:center;
  font-size: 10px;
  font-weight: 400;
  color: #333;
  text-transform: uppercase;
`

export const MostSharedLinks = ({ links }) => {
  const sortable = [];

  for (const link in links) {
    sortable.push([link, links[link]]);
  }

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  return (
    <Card>
      <Card.Body style={{ padding: '10px' }}>
        <Title>User shared most links</Title>
        <div>
          {sortable.map((sharedLink)=>{
            return <Link>{sharedLink[0]} ( {sharedLink[1]} )</Link>
          })}
        </div>
      </Card.Body>
    </Card>
  )
}