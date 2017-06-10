import fs from 'fs';
import mkdirp from 'mkdirp';
import shields from 'shields-lightweight';
import parse from 'lcov-parse';
import {
  calculateCoverage,
  convertCoverageToColor,
  getPastCoverage,
  displayCoverageInfo,
  coverbadge,
} from '../';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('shields-lightweight');
jest.mock('lcov-parse');

const mockedLcovInfo = `
LF:5
LH:4
LF:10
LH:1
`;

describe('calculateCoverage', () => {
  afterEach(() => {
    parse.resetInfo();
  });

  it('should throw error if parse failed', () => {
    parse.setError();

    expect(calculateCoverage()).rejects.toBe('error');
  });

  it('should parse lcov.info', async () => {
    parse.setInfo([]);

    const coverage = await calculateCoverage();

    expect(coverage).toBe(0);
  });

  it('should parse one file', async () => {
    parse.setInfo([{
      lines: { found: 10, hit: 5 },
      functions: { found: 10, hit: 5 },
      branches: { found: 10, hit: 5 },
    }]);

    const coverage = await calculateCoverage();

    expect(coverage).toBe(15 / 30);
  });

  it('should parse multiple files', async () => {
    parse.setInfo([
      {
        lines: { found: 10, hit: 5 },
        functions: { found: 10, hit: 5 },
        branches: { found: 10, hit: 5 },
      },
      {
        lines: { found: 10, hit: 10 },
        functions: { found: 10, hit: 10 },
        branches: { found: 10, hit: 10 },
      },
    ]);

    const coverage = await calculateCoverage();

    expect(coverage).toBe(45 / 60);
  });

  it('should parse files with sparse data', async () => {
    parse.setInfo([
      {
        lines: { found: 10, hit: 5 },
        branches: { found: 10, hit: 5 },
      },
      {
        lines: { found: 0, hit: 0 },
        functions: { found: 10, hit: 10 },
      },
    ]);

    const coverage = await calculateCoverage();

    expect(coverage).toBe(20 / 30);
  });
});

describe('convertCoverageToColor', () => {
  it('should convert coverage to color', () => {
    expect(convertCoverageToColor(0)).toBe('red');
    expect(convertCoverageToColor(50)).toBe('yellow');
    expect(convertCoverageToColor(80)).toBe('yellowgreen');
    expect(convertCoverageToColor(90)).toBe('green');
    expect(convertCoverageToColor(100)).toBe('brightgreen');
  });
});

describe('getPastCoverage', () => {
  const path = './some/path';

  it('should return false when there is no file', () => {
    expect(getPastCoverage(path)).toBe(false);
  });

  it('should get past coverage', () => {
    fs.writeFileSync(path, '<text>87%</text>');

    const pastCoverage = getPastCoverage(path);

    expect(pastCoverage).toBe(87);

    fs.deleteFileSync(path);
  });

  it('should return false if fail to get past coverage', () => {
    fs.writeFileSync(path, '<text>87</text>');

    const pastCoverage = getPastCoverage(path);

    expect(pastCoverage).toBe(false);

    fs.deleteFileSync(path);
  });
});

describe('coverbadge', () => {
  const outputPath = './some/output/path.svg';

  afterEach(() => {
    fs.deleteFileSync(outputPath);
    jest.clearAllMocks();
    parse.resetInfo();
  });

  it('should call svg', async () => {
    parse.setInfo([{
      lines: { found: 15, hit: 5 },
    }]);

    await coverbadge(mockedLcovInfo, outputPath);

    expect(shields.svg).toHaveBeenCalledWith('coverage', '33.33%', 'yellow', 'plastic');
  });

  it('should called mkdirp if dir not exist', async () => {
    await coverbadge(mockedLcovInfo, outputPath);

    expect(mkdirp.sync).toHaveBeenCalledWith('./some/output');
  });

  it('should not called mkdirp if dir exist', async () => {
    fs.writeFileSync('./some/output', 1);

    await coverbadge(mockedLcovInfo, outputPath);

    expect(mkdirp.sync).not.toHaveBeenCalled();

    fs.deleteFileSync('./some/output');
  });

  it('should write badge to file', async () => {
    parse.setInfo([{
      lines: { found: 15, hit: 5 },
    }]);

    await coverbadge(mockedLcovInfo, outputPath);

    expect(fs.readFileSync(outputPath)).toBe('<text>33.33%</text>');
  });

  it('should return lastCoverage and current coverage', async () => {
    parse.setInfo([{
      lines: { found: 15, hit: 5 },
    }]);
    fs.writeFileSync(outputPath, '<text>10%</text>');

    const [lastCoverage, coverage] = await coverbadge(mockedLcovInfo, outputPath);

    expect(lastCoverage).toBe(10);
    expect(coverage).toBe(33.33);

    fs.deleteFileSync(outputPath);
  });

  it('should return only current coverage if no last', async () => {
    parse.setInfo([{
      lines: { found: 15, hit: 5 },
    }]);
    const [lastCoverage, coverage] = await coverbadge(mockedLcovInfo, outputPath);

    expect(lastCoverage).toBe(false);
    expect(coverage).toBe(33.33);
  });

  it('should throw error if parse failed', () => {
    parse.setError();

    expect(coverbadge(mockedLcovInfo, outputPath)).rejects.toBeDefined();
  });
});
