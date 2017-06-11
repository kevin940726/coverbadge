import fs from 'fs';
import path from 'path';
import fetch from 'isomorphic-fetch';
import {
  HOST,
  api,
  getBuildSummary,
  getBuildArtifacts,
  getLastBadgeURL,
  downloadBadge,
  circle,
} from '../services/circle';

jest.mock('isomorphic-fetch');
jest.mock('fs');

const defaultOptions = {
  headers: {
    'Content-Type': 'Application/json',
  },
};
const username = 'username';
const project = 'project';
const token = 'token';
const vcs = 'gitlab';

afterEach(() => {
  fetch.__reset();
})

describe('api', () => {
  it('should call fetch with options', async () => {
    const endpoint = 'some/endpoint';
    const mockResponse = {};
    fetch.__setData(mockResponse);

    const result = await api(endpoint);

    expect(fetch).toHaveBeenCalledWith(`${HOST}/${endpoint}`, defaultOptions);
    expect(result).toBe(mockResponse);
  });
});

describe('getBuildSummary', () => {
  it('should call fetch with default parameters', async () => {
    const mockResponse = {};
    fetch.__setData(mockResponse);

    const result = await getBuildSummary({
      username,
      project,
    });

    expect(fetch).toHaveBeenCalledWith(`${HOST}/project/github/${username}/${project}?limit=1&filter=running`, defaultOptions);
    expect(result).toBe(mockResponse);
  });

  it('should call fetch with token and vcs', async () => {
    const mockResponse = {};
    fetch.__setData(mockResponse);

    const result = await getBuildSummary({
      username,
      project,
      token,
      vcs,
    });

    expect(fetch).toHaveBeenCalledWith(`${HOST}/project/${vcs}/${username}/${project}?circle-token=${token}&limit=1&filter=running`, defaultOptions);
    expect(result).toBe(mockResponse);
  });

  it('should call branch api if there is branch', async () => {
    const mockResponse = {};
    fetch.__setData(mockResponse);

    const result = await getBuildSummary({
      username,
      project,
      token,
      vcs,
      branch: 'master',
    });

    expect(fetch).toHaveBeenCalledWith(`${HOST}/project/${vcs}/${username}/${project}/tree/master?circle-token=${token}&limit=1&filter=running`, defaultOptions);
    expect(result).toBe(mockResponse);
  });
});

describe('getBuildArtifacts', () => {
  it('should call fetch with default parameters', async () => {
    const mockResponse = {};
    fetch.__setData(mockResponse);

    const result = await getBuildArtifacts({
      username,
      project,
      buildNum: 10,
    });

    expect(fetch).toHaveBeenCalledWith(`${HOST}/project/github/${username}/${project}/10/artifacts`, defaultOptions);
    expect(result).toBe(mockResponse);
  });

  it('should call fetch with token and vcs', async () => {
    const mockResponse = {};
    fetch.__setData(mockResponse);

    const result = await getBuildArtifacts({
      username,
      project,
      token,
      vcs,
      buildNum: 10,
    });

    expect(fetch).toHaveBeenCalledWith(`${HOST}/project/${vcs}/${username}/${project}/10/artifacts?circle-token=${token}`, defaultOptions);
    expect(result).toBe(mockResponse);
  });
});

describe('getLastBadgeURL', () => {
  it('should get the last badge url', () => {
    const outputPath = './coverage/badge.svg';
    const url = 'url';

    const artifacts = [{
      path: `/home/ubuntu/coverbadge/coverage/badge.svg`,
      url,
    }];

    const result = getLastBadgeURL(artifacts, outputPath);

    expect(result).toBe(url);
  });

  it('should return null if not found', () => {
    const outputPath = './coverage/badges.svg';
    const url = 'url';

    const artifacts = [{
      path: `/home/ubuntu/coverbadge/coverage/badge.svg`,
      url,
    }];

    const result = getLastBadgeURL(artifacts, outputPath);

    expect(result).toBeUndefined();
  });
});

describe('downloadBadge', () => {
  it('should download the badge from url', async () => {
    fetch.__setData('svg');
    const outputPath = './coverage/badges.svg';

    await downloadBadge(null, outputPath);

    const file = fs.readFileSync(path.resolve(process.cwd(), outputPath));

    expect(file).toBe('svg');
  });
});

describe('circle', () => {
  it('should call with default parameters', async () => {
    const outputPath = './coverage/badges.svg';

    fetch.__pushReturnData(
      [{
        path: `/home/ubuntu/coverbadge/coverage/badge.svg`,
        url: 'url',
      }],
      'svg'
    );

    await circle({
      username,
      project,
      outputPath,
      lastBuildNum: 10,
    });

    const file = fs.readFileSync(path.resolve(process.cwd(), outputPath));

    expect(file).toBe('svg');
  });
});
