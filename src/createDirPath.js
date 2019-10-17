import fs from 'fs';
import path from 'path';

const createDirPath = (filePath) => {
  const dirs = [];
  let parentPath = filePath;

  while (parentPath !== '.') {
    parentPath = path.dirname(parentPath);
    dirs.unshift(parentPath);
  }

  for (let i = 0; i < dirs.length; i += 1) {
    if (!fs.existsSync(dirs[i])) {
      fs.mkdirSync(dirs[i]);
    }
  }
};

export default createDirPath;
