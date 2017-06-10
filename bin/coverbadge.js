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

let lcov = '';

process.stdin.on('data', function(chunk) {
  lcov += chunk;
});

process.stdin.on('end', () => {
  if (argv && argv.o) {
    let preBuild = Promise.resolve();

    if (argv.s) {
      if (argv.s === 'circle') {
        preBuild = circle({
          username: argv.u,
          project: argv.p,
          token: argv.t || null,
          vcs: argv.vcs,
          outputPath: argv.o,
        });
      }
    }

    return preBuild
      .then(() => coverbadge(lcov, argv.o));
  }
});
