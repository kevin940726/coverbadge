const path = require('path');
const fs = require('fs');
const fetch = require('isomorphic-fetch');
const get = require('lodash.get');

const HOST = 'https://circleci.com/api/v1.1';

const api = endpoint => (
  fetch(`${HOST}/${endpoint}`, {
    headers: {
      'Content-Type': 'Application/json',
    },
  }).then(res => res.json())
);

const getBuildSummary = ({
  username,
  project,
  vcs = 'github',
  token = null,
  branch,
}) => {
  const tokenQuery = token ? `circle-token=${token}&` : '';
  const branchQuery = branch ? `/tree/${encodeURIComponent(branch)}` : '';

  return api(`project/${vcs}/${username}/${project}${branchQuery}?${tokenQuery}limit=1&filter=running`)
};

const getBuildArtifacts = ({
  username,
  project,
  buildNum,
  vcs = 'github',
  token = null,
}) => {
  const tokenQuery = token ? `?circle-token=${token}` : '';

  return api(`project/${vcs}/${username}/${project}/${buildNum}/artifacts${tokenQuery}`);
};

const getLastBadgeURL = (artifacts, outputPath) => {
  const artifact = artifacts.find(art => art.path.endsWith(path.basename(outputPath)));
  
  return artifact && artifact.url;
};

const downloadBadge = (url, outputPath, token = null) => {
  const tokenQuery = token ? `?circle-token=${token}` : '';

  return fetch(`${url}${tokenQuery}`)
    .then(res => res.text())
    .then((svg) => {
      fs.writeFileSync(path.resolve(process.cwd(), outputPath), svg);
    });
}

const circle = ({
  username,
  project,
  token = null,
  vcs = 'github',
  branch,
  outputPath,
  lastBuildNum,
}) => {
  const payload = {
    username,
    project,
    token,
    vcs,
    branch,
  };

  return getBuildArtifacts(Object.assign({}, payload, { buildNum: lastBuildNum }))
    .then(artifacts => getLastBadgeURL(artifacts, outputPath))
    .then(url => downloadBadge(url, outputPath, token))
};

module.exports = {
  HOST,
  api,
  getBuildSummary,
  getBuildArtifacts,
  getLastBadgeURL,
  downloadBadge,
  circle,
};
