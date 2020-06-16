import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { routeConfig } from './routeConfig';
import { Navigation } from './components/Navbar';

const Main = styled.main`
  padding: 1em;
  min-height: 80vh;
`

const App = () => {
  return (
    <Router>
      <Navigation />
      <Main>
        <Switch>
          {Object.keys(routeConfig).map((routeKey, index) => {
            const Component = routeConfig[routeKey].component;
            const { exact, route, props } = routeConfig[routeKey];

            return <Route exact={exact} path={route} key={index} render={nProps => {
              const updatedProps = {
                ...nProps,
                ...props
              };
              return <Component {...updatedProps} />;
            }}
            />
          })}
        </Switch>
      </Main>
      <footer>
      </footer>
    </Router>
  )
}

export default App;