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

const sendSlackWebhook = (webhook, lastCoverage, coverage) => {
  const { emoji, text } = formatMessage(lastCoverage, coverage);

  return fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'coverbadge',
      icon_emoji: emoji,
      text,
    }),
  });
};

module.exports = {
  formatMessage,
  sendSlackWebhook,
};
