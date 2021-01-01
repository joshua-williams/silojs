const fs = require('fs');
const path = require('path');

class Cache {
  constructor(config = {}) {
    this.rootDir = config.root || process.cwd()
    this.siloDir = path.join(this.rootDir, '.silo');
  }

  path(subPath = '') {
    return path.join(this.rootDir, '.silo', 'cache', subPath);
  }

  cacheDirectoryExists() {
    return (fs.existsSync(this.path()));
  }

  makeCacheDirectory() {
    return new Promise((resolve, reject) => {
      if (this.cacheDirectoryExists()) {
        return resolve(true);
      }
      if (fs.existsSync(this.path())) {
        return resolve(true);
      }
      fs.mkdir(this.path(), {recursive:true}, (err) => {
        if (err) {
          return reject('Failed to create cache directory: ' + this.path() )
        } else {
          return resolve(true)
        }
      })

    });
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
        return this.removeDir(filePath);
      } else if (fs.statSync(filePath).isFile()) {
        return fs.unlinkSync(filePath);
      }
    } else {
      return this.removeDir(this.path());
    }
  }

  removeDir(path) {
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path)

      if (files.length > 0) {
        files.forEach(filename => {
          if (fs.statSync(path + "/" + filename).isDirectory()) {
            this.removeDir(path + "/" + filename)
          } else {
            fs.unlinkSync(path + "/" + filename)
          }
        })
        fs.rmdirSync(path)
      } else {
        fs.rmdirSync(path)
      }
      return true;
    } else {
      return false;
      console.log("Directory path not found.")
    }
  }

  createDirectoryIfNotExists(filePath) {
    if (this.isDir(filePath)) {
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

  isDir(filePath) {
    return (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory());
  }
}
module.exports = Cache;