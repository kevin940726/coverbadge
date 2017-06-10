#!/usr/bin/env node
const yargs = require('yargs');
const chalk = require('chalk');
const { coverbadge } = require('../');

// services
const { circle } = require('../services/circle');
const { sendSlackWebhook } = require('../services/slack');

const argv = yargs
  .alias('o', 'out-file')
  .default('o', 'badge.svg', '(output file path)')
  .nargs('o', 1)
  .alias('s', 'service')
  .alias('u', 'username')
  .alias('p', 'project')
  .alias('t', 'token')
  .default('vcs', 'github')
  .argv;

const displayCoverageInfo = (pastCoverage, coverage) => {
  const coverageText = chalk.underline.bold(`${coverage}%`);
  const distance = chalk.bold(`${coverage > pastCoverage ? '+' : ''}${(coverage - pastCoverage).toFixed(2)}%`);

  let emoji = coverage === 100 ? '💯' : '🔖';
  let text = chalk.green(`Coverage remained the same at ${chalk.underline.bold(`${coverage}%`)}.`);

  if (pastCoverage > coverage) {
    emoji = '⚠️';
    text = chalk.red(`Coverage decreased (${distance}) to ${coverageText}.`);
  } else if (pastCoverage < coverage) {
    emoji = coverage === 100 ? '💯' : '🎉';
    text = chalk.green(`Coverage increased (${distance}) to ${coverageText}.`);
  }

  return `${emoji}  ${text}`;
};

const cli = (lcov, options = {}) => {
  if (options.o) {
    let preBuild = Promise.resolve();

    if (options.s) {
      if (options.s === 'circle') {
        preBuild = circle({
          username: options.u,
          project: options.p,
          token: options.t || null,
          vcs: options.vcs,
          outputPath: options.o,
        });
      }
    }

    return preBuild
      // proceed anyway
      .catch(() => Promise.resolve())
      .then(() => coverbadge(lcov, options.o))
      .then(([lastCoverage, coverage]) => {
        if (typeof lastCoverage === 'number') {
          console.log(displayCoverageInfo(lastCoverage, coverage));

          if (options.slack) {
            sendSlackWebhook(options.slack, lastCoverage, coverage);
          }
        }

        console.log(chalk.yellow(`Badge has successfully saved to ${chalk.underline(options.o)}!`));
      });
  }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

let data = '';

/* istanbul ignore next */
process.stdin.on('data', function(chunk) {
  data += chunk;
});

/* istanbul ignore next */
process.stdin.on('end', () => cli(data, argv));

module.exports = {
  displayCoverageInfo,
  cli,
};
