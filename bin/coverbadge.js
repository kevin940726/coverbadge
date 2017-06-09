#!/usr/bin/env node
const yargs = require('yargs');
const { coverbadge } = require('../');

const argv = yargs
  .alias('o', 'out-file')
  .alias('')
  .default('o', 'badge.svg', '(output file path)')
  .nargs('o', 1)
  .argv

process.stdin.resume();
process.stdin.setEncoding('utf8');

let lcov = '';

process.stdin.on('data', function(chunk) {
  lcov += chunk;
});

process.stdin.on('end', () => {
  if (argv && argv.o) {
    coverbadge(lcov, argv.o);
  }
});
