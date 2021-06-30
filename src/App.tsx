import * as React from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { loadStats, loadLockfile } from './actions';
import Stats from './components/Stats';
import ModuleReasons from './components/ModuleReasons';
import Modules from './components/Modules';

import './style.scss';

type AppType = ReturnType<typeof mapDispatchToProps>;

const App = (props: AppType) => {
  const { loadStats, loadLockfile } = props;

  React.useEffect(() => {
    loadStats();
    loadLockfile();
  }, []);

  return (
    <Router>
      <Container fluid>
        <Switch>
          <Route exact path="/" component={Stats}/>
          <Route path="/modules" component={Modules}/>
          <Route path="/reasons" component={ModuleReasons}/>
        </Switch>
      </Container>
    </Router>
  )
};

const mapDispatchToProps = dispatch => ({
  loadStats: () => dispatch(loadStats()),
  loadLockfile: () => dispatch(loadLockfile())
})

export default connect(
  null,
  mapDispatchToProps
)(App);
