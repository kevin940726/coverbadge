const svg = jest.fn((status, coverage) => `<text>${coverage}</text>`);

module.exports = {
  svg,
};
