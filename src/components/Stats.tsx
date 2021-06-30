import * as React from 'react';
import { connect } from 'react-redux';
import { Table, Row, Spinner } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

import { loadStats, sortStats, loadLockfile } from '../actions';
import { humanSize, isExternalModule } from '../helpers';
import { Col } from 'react-bootstrap';

const Stats = ({ stats, lockfile, sortStats, sortStatsBy }) => {
  const [sorting, setSorting] = React.useState<string>(null);
  const [page, setPage] = React.useState<number>(0);

  React.useEffect(() => {
    if (!sortStatsBy || !stats) {
      return;
    }
    // console.log(sortStatsBy);
    //
    // const sortedStats = { ...stats };
    // sortedStats['modules'] = _.orderBy(sortedStats['modules'] || [], ['failed', sortStatsBy], ['desc', 'desc']);
    // stats = Object.assign({}, { a: 1 });

  }, [sortStatsBy]);

  if (!stats) {
    return <Spinner animation="border" variant="primary" role="status"/>;
  }

  return (
    <>
      <Row><Col>Webpack version: {stats['version']}</Col></Row>
      <Row><Col>Built at: {new Date(stats['builtAt']).toLocaleString()}</Col></Row>
      <Row><Col>Build time: {stats['time'] / 1000} secs.</Col></Row>
      <Row><Col>Count modules: {(stats['modules'] || []).length}</Col></Row>
      <Row><Col>Warnings: {(stats['warnings'] || []).length}</Col></Row>

      <Row>
        <Col>
          <Table id="stats" striped bordered hover responsive size="sm" variant="dark">
        <thead>
        <tr>
          <th>Name</th>
          <th>Total Modules</th>
          <th>Externals Modules</th>
          <th>Types</th>
          <th onClick={() => sortStats('size')}>Size</th>
        </tr>
        </thead>
        <tbody>
        {
          (
            stats['chunks'] || []
          ).map((chunk, index: number) => (
            <tr key={'chunk-' + index}>
              <td className="name">
                <span>{chunk['names'].join(', ')}</span>
                <span className="entrypoint-icon">
                  {chunk['entry'] ? <Icon.BoxArrowInRight/> : ''}
                </span>
              </td>
              <td>
                <Link to={{ pathname: '/modules', search: '?chunkId=' + chunk['id'] }}>
                  {chunk['modules'].length}
                </Link>
              </td>
              <td>
                {chunk['modules'].filter((module) => isExternalModule(module.name)).length}
              </td>
              <td className="file-types">
                {
                  chunk['files'].map((file) =>
                    file.split('.').pop()
                  ).filter((ext) => ext !== 'map').join(', ')
                }
              </td>
              <td className="size">
                {humanSize(chunk['size'])}
                {chunk['size'] >= 1024 * 1024 ? <Icon.ExclamationTriangleFill/> : ''}
              </td>
            </tr>
          ))
        }
        </tbody>
      </Table>
        </Col>
      </Row>

      {/*<Table striped bordered hover size="sm">*/}
      {/*  <thead>*/}
      {/*    <tr>*/}
      {/*      <th>Chunks</th>*/}
      {/*      <th onClick={() => sortStats('name')}>Name</th>*/}
      {/*      <th onClick={() => sortStats('reasons')}>Reasons</th>*/}
      {/*      <th onClick={() => sortStats('size')}>Size</th>*/}
      {/*    </tr>*/}
      {/*  </thead>*/}
      {/*  <tbody>*/}
      {/*    {*/}
      {/*      (stats['modules'] || []).map((module) => (*/}
      {/*        <tr>*/}
      {/*          <td>{ module['chunks'].join(', ') }</td>*/}
      {/*          <td>{ extractModuleName(module['name']) } ({ _.map(lf[extractModuleName(module['name'])], 'version').join(', ') })<br/>{ module['name'] }</td>*/}
      {/*          <td>*/}
      {/*            <Link to={{ pathname: '/reasons', state: { moduleId: module['id'] } }}>*/}
      {/*              { module['reasons'].length }*/}
      {/*            </Link>*/}
      {/*          </td>*/}
      {/*          <td>{ (module['size'] / 1024).toFixed(2) } kB</td>*/}
      {/*        </tr>*/}
      {/*      ))*/}
      {/*    }*/}
      {/*  </tbody>*/}
      {/*</Table>*/}
    </>
  );
};

const mapStateToProps = ({ stats, sortStatsBy, lockfile }) => (
  {
    stats,
    sortStatsBy,
    lockfile
  }
);

const mapDispatchToProps = dispatch => (
  {
    loadStats: () => dispatch(loadStats()),
    loadLockfile: () => dispatch(loadLockfile()),
    sortStats: (sortBy: string) => dispatch(sortStats(sortBy))
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stats);
