import * as React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Table, Badge, Spinner, Form } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import {
  isLoader,
  humanSize,
  useQueryParams,
  recognizeModuleName,
  extractExternalModuleName
} from '../helpers';

const prepareModules = (lockfile, modules) =>
  modules.reduce((result: any[], module: Record<string, any>) => {
    const moduleNames = recognizeModuleName(lockfile, module['name']);

    let existedModule = _.find(result, { moduleName: moduleNames[0] });
    if (existedModule) {
      existedModule.module.size += module.size;
      if (moduleNames.length > 1) {
        existedModule.countInnerModules++;
      } else {
        // concatenate reasons
        existedModule.module.reasons = _.uniqBy(
          existedModule.module.reasons.concat(module.reasons), 'moduleName'
        );
      }
    } else {
      module.reasons = _.uniqBy(module.reasons, 'moduleName');

      const externalModuleName = extractExternalModuleName(moduleNames[0]);

      result.push({
        moduleName: externalModuleName || moduleNames[0],
        isExternal: Boolean(externalModuleName),
        isLoader: isLoader(module['name']),
        countInnerModules: 0,
        module: _.cloneDeep(module)
      });
    }
    return result;
  }, []);

const dependOn = (lockfile: Record<string, any>, moduleName: string) =>
  _.orderBy(_.reduce(lockfile, (
    result: any[],
    modules: Record<string, any>[],
    dependentModuleName: string
    ) => {
      modules.forEach((module) => {
        if (module.dependencies && module.dependencies[moduleName]) {
          result.push({
            version: module.version,
            versionType: module.version.indexOf('file:') === 0 ? 'file' : 'number',
            usedVersion: module.dependencies[moduleName],
            usedVersionType: module.dependencies[moduleName].indexOf('file:') === 0 ? 'file' : 'number',
            dependentModuleName
          });
        }
      });
      return result;
    }, []), ['usedVersion'], ['desc']
  );

type ModulesType = ReturnType<typeof mapStateToProps>;

const Modules = (props: ModulesType) => {
  const { stats, lockfile } = props;

  const queryParams = useQueryParams();

  const [modules, setModules] = React.useState<Record<string, any>>(null);
  const [searchBy, setSearchBy] = React.useState<string>(null);
  const [dependOnShowMore, setDependOnShowMore] = React.useState<Record<string, any>>({});
  const [reasonsShowMore, setReasonsShowMore] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (!lockfile || !stats) {
      return;
    }
    const chunkId = +queryParams.get('chunkId');
    const chunk = _.find(stats['chunks'], { id: chunkId });
    if (chunk) {
      let preparedModules = prepareModules(lockfile, chunk.modules);
      preparedModules = _.orderBy(preparedModules, (module) =>
        module.module.size, ['desc']
      );
      setModules(preparedModules);
    } else {
      throw new Error('Chunk cannot be found');
    }
  }, [lockfile, stats]);

  const getFilteredModules = React.useCallback(() => {
    if (!searchBy) {
      return modules || [];
    }
    return modules.filter((module) =>
      !module.moduleName
      || module.moduleName.toLowerCase().indexOf(searchBy.toLowerCase()) !== -1
    );
  }, [modules, searchBy]);

  const onSearch = (e) => {
    setSearchBy(e.target.value);
  };

  const showHideMoreDependOn = (moduleId, e) => {
    e.preventDefault();

    setDependOnShowMore((dependOnShowMore) => (
      { ...dependOnShowMore, [moduleId]: !dependOnShowMore[moduleId] }
    ))
  }

  const showHideMoreReasons = (moduleId, e) => {
    e.preventDefault();

    setReasonsShowMore((reasonsShowMore) => (
      { ...reasonsShowMore, [moduleId]: !reasonsShowMore[moduleId] }
    ))
  }

  if (!modules) {
    return <Spinner animation="border" variant="primary" role="status"/>;
  }

  return (
    <>
      <Link to="/">Back</Link>
      <Form>
        <Form.Group>
          <Form.Control onChange={onSearch} type="text" placeholder="Type to search something"/>
        </Form.Group>
      </Form>
      <Table id="modules" striped bordered hover responsive size="sm" variant="dark">
        <thead>
        <tr>
          <th>Name</th>
          <th>Depend on</th>
          <th>Size</th>
          <th>Reasons</th>
        </tr>
        </thead>
        <tbody>
        {
          getFilteredModules().map(({ moduleName, isLoader, isExternal, countInnerModules, module }, moduleIndex: number) =>
            <tr key={'module-' + moduleIndex}>
              <td className="name">
                <span>{moduleName}</span>
                {
                  Boolean(countInnerModules) && (
                    <span> ({countInnerModules})</span>
                  )
                }
                {
                  isExternal && (
                    <Icon.ArrowBarLeft/>
                  )
                }
                {
                  isLoader && (
                    <Icon.Plug/>
                  )
                }
              </td>
              <td className="depend-on">
                {
                  _.map(
                    dependOnShowMore[module['id']] ? dependOn(lockfile, moduleName) : dependOn(lockfile, moduleName).slice(0, 3),
                    ({ dependentModuleName, version, usedVersion, versionType, usedVersionType }) => (
                      <div key={moduleName + dependentModuleName + version}>
                        <span>{dependentModuleName}@{versionType === 'file' ? 'FILE' : version}</span>
                        <Badge className="used-version" variant="primary">
                          {
                            usedVersionType === 'file' ? 'FILE' : usedVersion
                          }
                        </Badge>
                      </div>
                    )
                  )
                }
                {dependOn(lockfile, moduleName).length > 3 && (
                  <a className="show-more" href="#" onClick={(e) => showHideMoreDependOn(module['id'], e)}>
                    {
                      dependOnShowMore[module['id']] ? (
                        <>Hide more</>
                      ) : (
                        <>Show more (+{dependOn(lockfile, moduleName).length - 3})</>
                      )
                    }
                  </a>
                )}
              </td>
              <td className="size">
                {isExternal ? (
                  <span>-</span>
                ) : (
                  <>
                    <span>{humanSize(module['size'])}</span>
                    <span>{module['size'] >= 1024 * 1024 ? <Icon.ExclamationTriangleFill/> : ''}</span>
                  </>
                )}
              </td>
              <td className="reasons">
                {
                  _.map(reasonsShowMore[module['id']] ? module['reasons'] : module['reasons'].slice(0, 3), (reason: Record<string, any>, reasonIndex: number) => (
                    <div key={'reason-' + moduleIndex + '-' + reasonIndex}>
                      <span>{reason['moduleName']}</span>
                    </div>
                  ))
                }
                {module['reasons'].length > 3 && (
                  <a className="show-more" href="#" onClick={(e) => showHideMoreReasons(module['id'], e)}>
                    {
                      reasonsShowMore[module['id']] ? (
                        <>Hide more</>
                      ) : (
                        <>Show more (+{module['reasons'].length - 3})</>
                      )
                    }
                  </a>
                )}
              </td>
            </tr>
          )
        }
        </tbody>
      </Table>
    </>
  );
};

const mapStateToProps = ({ stats, lockfile }) => (
  {
    stats,
    lockfile
  }
);

export default connect(mapStateToProps)(Modules);
