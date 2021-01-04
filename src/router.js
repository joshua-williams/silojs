const fs = require('fs');
const path = require('path');
const Route = require('./route');
const Cache = require('./cache');
const Parser = require('./parser');

class Router {
  constructor(config = {}) {
    this.rootDir = config.root || process.cwd();
    this.routes = {
      any: [],
      get: [],
      post: [],
      put: [],
      delete: [],
      connect: [],
      options: [],
      error: []
    }
    this.services = {
      cache: new Cache(config),
      parser: new Parser(config)
    }
    if (!this.rootDirExists()) {
      throw new Error('root path does not exist or does not have 755 permissions - ' + this.rootDir)
    }
  }

  rootDirExists() {
    try {
      return fs.existsSync(this.rootDir)
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  makeRoute(method, callback) {
    console.log(typeof callback)
    if (typeof callback != 'functionn') {
      throw new Error('route callback must be function');
    }
    if (!this.routes.hasOwnProperty(method)) {
      throw new Error('invalid http method');
    }
    let options = {method, callback};
    let route = new Route(options);
    this.routes[method].push(route)
  }

  get(uri, callback) {
    this.makeRoute('get', callback)
  }

  post(uri, callback) {
    this.makeRoute('post', callback)
  }

  put(uri, callback) {
    this.makeRoute('put', callback)
  }

  patch(uri, callback) {
    this.makeRoute('patch', callback)
  }

  delete(uri, callback) {
    this.makeRoute('delete', callback)
  }

  options(uri, callback) {
    this.makeRoute('options', callback)
  }

  any(uri, callback) {
    this.makeRoute('any', callback)
  }

  handleRequest(req, res) {
    const file = this.mapUrlToFile(req.url);
    if (!file) {
      return this.dispatch(req, res, 'error');
    }
    if (file.isFile) {
      let cachePath = this.services.cache.exists(req.url);
      if (cachePath) {
        return this.streamFile(req, res, cachePath)
      }
      if (file.ext == 'jsx') {
        const content = this.services.parser.renderReactComponent(file.path);
        if (content) {
          const cachePath = this.services.cache.set(file.url, content)
          return this.streamFile(req, res, cachePath);
        } else {
          return this.dispatch(req, res, 'error');
        }
      }
      return this.streamFile(req, res, file.path);
    }
    if (file.isDir) {
      let indexPath = this.indexFilePath(file.path);
      if (indexPath) {
        return this.streamFile(req, res, indexPath)
      } else {
        return this.dispatch(req, res, 'error');
      }
    }
  }

  listen(req, res) {
    try {
      this.handleRequest(req, res);
    } catch (e) {
      this.dispatch(req, res, 'error');
    }
  }

  /**
   * @description Gets file extension from url string
   * @param url {string}
   * @returns {string|boolean} File extension
   */
  getFileExtension(url="") {
    url = url.replace(/\?.*$/, '');
    let match = url.match(/\.(\w+)$/);
    if (!match) return false;
    return match[1].toLowerCase();
  }

  getFileExt(url = "") {
    return this.getFileExtension(url);
  }

  /**
   * @description Gets the corresponding file path from url
   * @param url
   * @returns {string|boolean}
   */
  filePath(url='') {
    let filePath = path.join(this.rootDir, url);
    if (fs.existsSync(`${filePath}.html`)) {
      return `${filePath}.html`;
    } else if (fs.existsSync(`${filePath}.jsx`)) {
      return `${filePath}.jsx`
    }
    return false;
  }
  /**
   * @description Gets the index.(html|jsx) file path and checks if it exists
   * @param uri
   * @returns {string|boolean} Index file path if exists or false if not.
   */
  indexFilePath(uri) {
    let indexPath = path.join(this.rootDir, uri);
    if (fs.existsSync(path.join(indexPath, 'index.jsx'))) {
      return path.join(indexPath, 'index.jsx');
    } else if (fs.existsSync(path.join(indexPath, 'index.html'))) {
      return path.join(indexPath, 'index.html');
    } else {
      return false;
    }
  }

  dispatch(request, response, event) {
    if (this.routes.hasOwnProperty(event)) {
      for (route of this.routes[event]) {
        route.render();
      }
    }
  }

  mapUrlToFile(url) {
    let filePath = path.join(this.rootDir, url);
    let stat = fs.statSync(filePath);
    let file = {
      url,
      path: filePath,
      isDir: stat.isDirectory(),
      isFile: stat.isFile()
    }
    file.ext = file.isFile ? this.getFileExt(url) : false;
  }

  streamFile(req, res, filePath) {

  }

  streamCache(req, res) {

  }
}
module.exports = Router;