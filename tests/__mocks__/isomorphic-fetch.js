let data = {};

const fetch = jest.fn((url, options) => Promise.resolve({
  json: () => Promise.resolve(Array.isArray(data) ? data.shift() : data),
  text: () => Promise.resolve(Array.isArray(data) ? data.shift() : data),
}));

fetch.__setData = (input) => {
  data = input;
};

fetch.__reset = () => {
  data = {};
  fetch.mockClear();
};

fetch.__pushReturnData = (...input) => {
  if (!Array.isArray(data)) {
    data = [];
  }

  data.push(...input);
};

module.exports = fetch;
