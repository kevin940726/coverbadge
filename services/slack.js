const fetch = require('isomorphic-fetch');

const formatMessage = (lastCoverage, coverage) => {
  const coverageText = `${coverage}%`;
  const distance = `${coverage > lastCoverage ? '+' : ''}${(coverage - lastCoverage).toFixed(2)}%`;

  let emoji = coverage === 100 ? ':100:' : ':bookmark:';
  let text = `Coverage remained the same at *${coverage}%*.`;

  if (lastCoverage > coverage) {
    emoji = ':warning:';
    text = `Coverage decreased (*${distance}*) to *${coverageText}*.`;
  } else if (lastCoverage < coverage) {
    emoji = coverage === 100 ? ':100:' : ':tada:';
    text = `Coverage increased (*${distance}*) to *${coverageText}*.`;
  }

  return {
    emoji,
    text,
  };
};

const sendSlackWebhook = (webhook, lastCoverage, coverage, others = {}) => {
  const { emoji, text } = formatMessage(lastCoverage, coverage);
  const { vcs, username, project, branch } = others;
  let body = text;

  if (vcs && username && project) {
    const repoURL = `https://${vcs}.com/${username}/${project}`; 
    const repo = `<https://${vcs}.com/${username}/${project}/${branch ? `/tree/${branch}` : ''}|[${username}/${project}]>`;
    const branchSuffix = branch ? ` on <${repoURL}/tree/${branch}|${branch}>`;
    body = `<${repoURL}|[${username}/${project}]> ${text}${branchSuffix}`;
  }

  return fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'coverbadge',
      icon_emoji: emoji,
      text: body,
    }),
  });
};

module.exports = {
  formatMessage,
  sendSlackWebhook,
};
