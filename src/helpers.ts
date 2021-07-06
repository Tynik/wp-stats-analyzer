import { useLocation } from 'react-router-dom';

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

interface RequestInterface {
  data?: object | FormData;
  method?: RequestMethod;
  auth?: boolean | true;
  cache?: boolean | null;
  headers?: Record<string, string>;
}

export const request = <T>(
  url: string,
  {
    data = null,
    method = RequestMethod.GET,
    cache = null, // null as default value
    headers = {}
  }: RequestInterface = {}
): Promise<T> => {

  const defaultHeaders: Headers = new Headers();
  const params: RequestInit = { method };

  if (cache === false) {
    params.cache = 'no-cache';
  }
  let newUrl = url;
  if (data) {
    if ([RequestMethod.GET, RequestMethod.DELETE].includes(method)) {
      newUrl = `${url}?${getQueryString(data)}`;
    } else {
      if (!(data instanceof FormData)) {
        defaultHeaders.set('Content-Type', 'application/json; charset=utf-8');
      }
      // POST, PUT and etc.
      params.body = data instanceof FormData ? data : JSON.stringify(data);
    }
  }
  Object.keys(headers).forEach(key => {
    defaultHeaders.set(key, headers[key]);
  });
  params.headers = defaultHeaders;

  return fetch(newUrl, params).then(resp => {
    const contentType = resp.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return resp.json();
    }
    return resp.text();
  });
};

const getQueryString = (params): string => {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
};

export const humanSize = (size: number): string => {
  if (size >= 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + ' MB'
  }
  if (size >= 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  }
  if (size < 1024) {
    return size + ' B'
  }
}

export const useQueryParams = (): URLSearchParams  => {
  return new URLSearchParams(useLocation().search);
}

export const isLoader = (moduleName: string) =>
  moduleName.indexOf('!') !== -1;

export const isExternalModule = (moduleName: string) =>
  moduleName.indexOf('external ') === 0;

export const extractExternalModuleName = (externalModuleName: string) => {
  const r = /external "(.+)"/.exec(externalModuleName);
  return r && r[1];
};

export const recognizeModuleName = (
  lockfile: Record<string, any>,
  modulePath: string,
  options: Record<string, any> = { modulesDirname: 'node_modules' }
): string[] => {
  const result = [];
  const moduleParts = modulePath.split('/');

  let startInd = 0;
  while (1) {
    startInd = moduleParts.indexOf(options.modulesDirname, startInd);
    if (startInd === -1) {
      result.push(modulePath);
      break;
    }
    let supposedModuleName = moduleParts[++startInd];
    let max = 0;
    while (!lockfile[supposedModuleName] && max < 4) {
      max++;
      startInd++;
      if (!moduleParts[startInd]) {
        break;
      }
      supposedModuleName += '/' + moduleParts[startInd];
    }
    result.push(supposedModuleName);
  }
  return result;
}
