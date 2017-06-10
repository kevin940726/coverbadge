import cli from '../bin/coverbadge';
import { coverbadge } from '../';
import { circle } from '../services/circle';

jest.mock('../', () => ({
  coverbadge: jest.fn(),
}));

jest.mock('../services/circle', () => ({
  circle: jest.fn(() => Promise.resolve()),
}));

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
});

describe('coverbadge', () => {
  it('should call coverbadge when there is service', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const options = {
      o: outputPath, 
      s: circle,
    };

    await cli(lcov, options);

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath);
  });

  it('should still call coverbadge when no service', async () => {
    const lcov = 'lcov';
    const outputPath = './output/path';
    const options = {
      o: outputPath, 
    };

    await cli(lcov, options);

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath);
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

    expect(coverbadge).toHaveBeenCalledWith(lcov, outputPath);
  });
});

describe('circle', () => {
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
