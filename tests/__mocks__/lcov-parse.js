let info = [];
let error = null;

const parse = jest.fn((lcov, cb) => cb(error, info));

parse.setInfo = (data) => {
  info = data;
};

parse.resetInfo = () => {
  info = [];
  error = null;
};

parse.setError = () => {
  error = 'error';
};

module.exports = parse;
