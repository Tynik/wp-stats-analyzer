import * as React from 'react';
import * as _ from 'lodash';
import { Link, useLocation } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';

const ModuleReasons = ({ stats }) => {
  const { state } = useLocation();
  const reasons = _.find(stats['modules'], { id: state['moduleId'] }).reasons;
  console.log(reasons);

  return (
    <>
      <Link to="/">Back</Link>
      <Table striped bordered hover size="sm">
        <thead>
        <tr>
          <th>Module</th>
          <th>Loc</th>
        </tr>
        </thead>
        <tbody>
        {
          reasons.map((reason) => (
            <tr>
              <td>{reason['module']}</td>
              <td>{reason['loc']}</td>
            </tr>
          ))
        }
        </tbody>
      </Table>
    </>
  );
};

const mapStateToProps = ({ stats }) => (
  {
    stats
  }
);

export default connect(mapStateToProps)(ModuleReasons);