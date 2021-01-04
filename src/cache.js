const fs = require('fs');
const path = require('path');
const util = require('./util');

class Cache {
  constructor(config = {}) {
    this.rootDir = path.resolve(config.root) || process.cwd()
    this.siloDir = path.join(this.rootDir, '.silo');
  }

  path(subPath = '') {
    console.log(this.rootDir)
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

  set(relativePath, content) {
    const filePath = this.path(relativePath);
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
    return fs.existsSync(filePath) ? filePath : false;
  }
  get(relativePath) {
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
        return fs.unlinkSync(filePath);
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
    fs.writeFileSync(filePath, content)
    return fs.existsSync(filePath);

    return new Promise((resolve, reject) => {


      const stream = fs.createWriteStream(filePath, {emitClose: true})
        .once('open', fd => {
          stream.write(content);
          stream.end();
        })
        .close(data => {
          console.log('cache created ' + filePath);
          resolve(true);
        });
    });
  }
}
module.exports = Cache;