const fs = require('fs');
const path = require('path');
const util = require('./util');

class Cache {
  constructor(config = {}) {
    this.rootDir = config.root && path.resolve(config.root) || process.cwd()
    this.siloDir = path.join(this.rootDir, '.silo');
    if (!fs.existsSync(this.path())) {
      util.mkdir(this.path())
    }
  }

  path(subPath = '') {
    return path.join(this.rootDir, '.silo', 'cache', subPath);
  }

  cacheDirectoryExists() {
    return (fs.existsSync(this.path()));
  }

  makeCacheDirectory() {
    if (this.cacheDirectoryExists()) {
      return Promise.resolve(true);
    }
    if (fs.existsSync(this.path())) {
      return Promise.resolve(true);
    }
    return util.mkdir(this.path());
  }

  set(file, content) {
    let filePath = this.path(file.url);
    if (file.url == '/') {
      filePath = this.path('index.html')
    }
    if (fs.existsSync(filePath)) {
      this.clear(filePath);
    }
    let parentDir = path.dirname(filePath);
    if (!this.createDirectoryIfNotExists(parentDir)) {
      console.error('failed to create parent directory ' + parentDir)
      return false;
    }
    if (!this.writeFile(filePath, content)) {
      console.error('failed to write content to file ', filePath)
      return false;
    }
    return true;
  }
  exists(relativePath) {
    let filePath = this.path(relativePath);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile() && filePath;
  }
  get(relativePath) {
    if (relativePath == '/') {
      relativePath = 'index.html';
      console.log('getting..', relativePath)
    }
    if (this.exists(relativePath)) {
      return fs.readFileSync(this.path(relativePath));
    } else {
      return false;
    }
  }

  clear(relativePath = false) {
    if (relativePath) {
      let filePath = this.path(relativePath);
      if (!fs.existsSync(filePath)) {
        return false;
      }
      if (fs.statSync(filePath).isDirectory()) {
        return util.removeDir(filePath);
      } else if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
        return fs.existsSync(filePath) ? false : true;
      }
    } else {
      return util.removeDir(this.path());
    }
  }

  createDirectoryIfNotExists(filePath) {
    if (util.isDir(filePath)) {
      return true;
    }
    fs.mkdirSync(filePath, {recursive: true});
    if (fs.existsSync(filePath)) {
      return true;
    } else {
      return false;
    }
  }

  writeFile(filePath, content) {
    if (typeof content !== 'string') {
      throw new Error('Can not write file @ ' + filePath);
    }
    fs.writeFileSync(filePath, content)
    return fs.existsSync(filePath);
  }
}
module.exports = Cache;
