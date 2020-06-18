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

export const MostSharedLinks = ({domains = []}) => {

  return (
    <Card>
      <Card.Body style={{ padding: '10px' }}>
        <Title>User shared most links</Title>
        <div>
          {domains.map((domain)=>{
            return <Link>{domain[0]} ( {domain[1]} )</Link>
          })}
        </div>
      </Card.Body>
    </Card>
  )
}