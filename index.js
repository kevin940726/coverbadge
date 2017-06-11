#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const parse = require('lcov-parse');
const get = require('lodash.get');
const shields = require('shields-lightweight');
const cheerio = require('cheerio');
const chalk = require('chalk');

const calculateCoverage = (lcov) => {
  return new Promise((resolve, reject) => {
    parse(lcov, (err, info) => {
      if (err) {
        reject(err);
      }

      const criteria = ['lines', 'functions', 'branches'];

      const foundAndHit = info.reduce((sums, file) => [
        sums[0] + criteria.reduce((hit, c) => hit + get(file, [c, 'hit'], 0), 0),
        sums[1] + criteria.reduce((found, c) => found + get(file, [c, 'found'], 0), 0)
      ], [0, 0]);

      resolve((parseFloat(foundAndHit[0]) / parseFloat(foundAndHit[1])) || 0);
    });
  });
};

const convertCoverageToColor = (value) => {
  if (value === 0) {
    return 'red';
  } else if (value < 80) {
    return 'yellow';
  } else if (value < 90) {
    return 'yellowgreen';
  } else if (value < 100) {
    return 'green';
  } else {
    return 'brightgreen';
  }
};

const getPastCoverage = (outputPath) => {
  if (fs.existsSync(outputPath)) {
    const pastBadge = fs.readFileSync(outputPath, 'utf8');
    const $ = cheerio.load(pastBadge);
    const pastCoverage = $('text')
      .map((i, ele) => $(ele).text())
      .toArray()
      .map(text => /^(([\d\.])+)%$/g.exec(text))
      .filter(group => group && group[1])
      .map(group => group[1]);

    if (pastCoverage && pastCoverage[0]) {
      return parseFloat(pastCoverage[0]);
    }
  }

  return false;
};

const coverbadge = (lcov, outputPath, style = 'flat') => (
  calculateCoverage(lcov).then((coverageRatio) => {
    const coverage = Math.floor(coverageRatio * 10000) / 100;

    const svgBadge = shields.svg(
      'coverage',
      `${coverage}%`,
      convertCoverageToColor(coverage),
      style
    );

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir);
    }

    const pastCoverage = getPastCoverage(outputPath);

    fs.writeFileSync(outputPath, svgBadge);

    return [pastCoverage, coverage];
  })
);

module.exports = {
  calculateCoverage,
  convertCoverageToColor,
  getPastCoverage,
  coverbadge,
};
