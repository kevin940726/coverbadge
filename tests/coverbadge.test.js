import {
  displayCoverageInfo,
  cli,
} from '../bin/coverbadge';
import { coverbadge } from '../';
import { circle } from '../services/circle';
import { sendSlackWebhook } from '../services/slack';

jest.mock('../', () => ({
  coverbadge: jest.fn(),
}));

jest.mock('../services/circle', () => ({
  circle: jest.fn(() => Promise.resolve()),
}));

jest.mock('../services/slack', () => ({
  sendSlackWebhook: jest.fn(),
}));

beforeAll(() => {
  console.log = jest.fn();
});

afterEach(() => {
  coverbadge.mockClear();
  circle.mockClear();
});

afterAll(() => {
  process.stdin.destroy();
});

describe('cli', () => {
  it('should pass default object if no options', async () => {
    const lcov = 'lcov';

    await cli(lcov);

    expect(coverbadge).not.toHaveBeenCalled();
  });

  it('should not do anything if no outputPath', async () => {
    const lcov = 'lcov';
    const options = {
      o: '',
    };

    await cli(lcov, options);

    expect(coverbadge).not.toHaveBeenCalled();
  });

  it('should only call console once if no lastCoverage', async () => {
    coverbadge.mockImplementationOnce(() => [false, 100]);

    const outputPath = './coverage/badge.svg';
    const options = {
      o: outputPath,
    };

    await cli('lcov', options);

    expect(console.log).toHaveBeenCalledTimes(1);
  });
});

describe('coverbadge', () => {
  beforeEach(() => {
    coverbadge.mockImplementationOnce(() => [50, 100]);
  });

  it('should call coverbadge when there is service', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const options = {
      o: outputPath, 
      s: circle,
    };

    await cli(lcov, options);

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath, undefined);
  });

  it('should still call coverbadge when no service', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const options = {
      o: outputPath, 
    };

    await cli(lcov, options);

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath, undefined);
  });

  it('should still call coverbadge when there is service and the service fail', async () => {
    circle.mockImplementationOnce(() => Promise.reject());

    const lcov = 'lcov';
    const outputPath = './output/path';
    const options = {
      o: outputPath, 
      s: 'circle',
    };

    await cli(lcov, options);

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath, undefined);
  });

  it('should change style with option', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const options = {
      o: outputPath,
      style: 'plastic',
    };

    await cli(lcov, options);

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath, 'plastic');
  });
});

describe('circle', () => {
  beforeEach(() => {
    coverbadge.mockImplementationOnce(() => [50, 100]);
  });

  it('should call circle with options', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const username = 'username';
    const project = 'project';
    const vcs = 'github';

    const options = {
      o: outputPath, 
      s: 'circle',
      u: username,
      p: project,
      vcs,
    };

    await cli(lcov, options);

    expect(circle).toHaveBeenCalledWith({
      username,
      project,
      outputPath,
      vcs,
      token: null,
    });
  });

  it('should call circle with token', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const username = 'username';
    const project = 'project';
    const vcs = 'github';
    const token = 'token';

    const options = {
      o: outputPath, 
      s: 'circle',
      u: username,
      p: project,
      t: token,
      vcs,
    };

    await cli(lcov, options);

    expect(circle).toHaveBeenCalledWith({
      username,
      project,
      outputPath,
      vcs,
      token,
    });
  });
});

describe('displayCoverageInfo', () => {
  it('should display correct info when decreased', () => {
    expect(displayCoverageInfo(66, 55)).toMatchSnapshot();
  });

  it('should display correct info when increased', () => {
    expect(displayCoverageInfo(55, 66)).toMatchSnapshot();
  });

  it('should display correct info when increased and hit 100%', () => {
    expect(displayCoverageInfo(55, 100)).toMatchSnapshot();
  });

  it('should display correct info when remained', () => {
    expect(displayCoverageInfo(55, 55)).toMatchSnapshot();
  });

  it('should display correct info when remained and hit 100%', () => {
    expect(displayCoverageInfo(100, 100)).toMatchSnapshot();
  });
});

describe('slack', () => {
  it('should call slack if option have slack', async () => {
    coverbadge.mockImplementationOnce(() => [50, 100]);

    const outputPath = './coverage/badge.svg';
    const options = {
      o: outputPath,
      slack: 'slack',
    };

    await cli('lcov', options);

    expect(sendSlackWebhook.mock.calls[0].slice(0, 3)).toEqual(['slack', 50, 100]);
  });
});
