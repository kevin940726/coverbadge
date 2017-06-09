const memoryFileSystem = {};

const readFileSync = (path) => {
  return memoryFileSystem[path];
};

const writeFileSync = (path, data) => {
  memoryFileSystem[path] = data;
};

const existsSync = (path) => {
  return (path in memoryFileSystem);
};

const deleteFileSync = (path) => {
  delete memoryFileSystem[path];
};

module.exports = {
  readFileSync,
  writeFileSync,
  existsSync,
  deleteFileSync,
};
