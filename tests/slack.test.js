import fetch from 'isomorphic-fetch';
import {
  formatMessage,
  sendSlackWebhook,
} from '../services/slack';

jest.mock('isomorphic-fetch');

describe('formatMessage', () => {
  it('should display correct info when decreased', () => {
    expect(formatMessage(66, 55)).toMatchSnapshot();
  });

  it('should display correct info when increased', () => {
    expect(formatMessage(55, 66)).toMatchSnapshot();
  });

  it('should display correct info when hit 100%', () => {
    expect(formatMessage(55, 100)).toMatchSnapshot();
  });

  it('should display correct info when remained', () => {
    expect(formatMessage(55, 55)).toMatchSnapshot();
  });

  it('should display correct info when remained and hit 100%', () => {
    expect(formatMessage(100, 100)).toMatchSnapshot();
  });
});

describe('sendSlackWebhook', () => {
  afterEach(() => {
    fetch.mockClear();
  });

  it('should call fetch with parameters', async () => {
    await sendSlackWebhook('slack', 50, 100);

    expect(fetch.mock.calls).toMatchSnapshot();
  });

  it('should format the text if have other options', async () => {
    await sendSlackWebhook('slack', 50, 100, {
      username: 'usernmame',
      project: 'project',
      vcs: 'github',
    });

    expect(fetch.mock.calls).toMatchSnapshot();
  });

  it('should further format the text if have branch', async () => {
    await sendSlackWebhook('slack', 50, 100, {
      username: 'usernmame',
      project: 'project',
      vcs: 'github',
      branch: 'branch',
    });

    expect(fetch.mock.calls).toMatchSnapshot();
  });
});
