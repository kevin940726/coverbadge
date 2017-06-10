#!/usr/bin/env node
const yargs = require('yargs');
const { coverbadge } = require('../');

// services
const { circle } = require('../services/circle');

const argv = yargs
  .alias('o', 'out-file')
  .default('o', 'badge.svg', '(output file path)')
  .nargs('o', 1)
  .alias('s', 'service')
  .alias('u', 'username')
  .alias('p', 'project')
  .alias('t', 'token')
  .default('vcs', 'github')
  .argv

process.stdin.resume();
process.stdin.setEncoding('utf8');

let data = '';

/* istanbul ignore next */
process.stdin.on('data', function(chunk) {
  data += chunk;
});

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
      .then(() => coverbadge(lcov, options.o));
  }
};

/* istanbul ignore next */
process.stdin.on('end', () => cli(data, argv));

module.exports = cli;
