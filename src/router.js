const fs = require('fs');
const path = require('path');
const Route = require('./route');
const Cache = require('./cache');
const Parser = require('./parser');
const ContentType = require('./content-type');
const util = require('./util');

class Router {
  constructor(config = {}) {
    this.config = {
      ...config,
      rootDir: path.resolve(config.root) || process.cwd()
    }
    this.rootDir = this.config.rootDir;
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
      parser: new Parser(config),
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

      if (file.ext == 'jsx') {
        let cachePath = this.services.cache.exists(req.url);
        if (cachePath) {
          console.log('---cachePath')
          let content = this.services.parser.renderReactComponent(cachePath);
        } else {
          console.log('----react component----', file)
          let content = this.services.parser.renderReactComponent(file.path);
        }
        if (content) {
          console.log('------content-----', content)
          const cachePath = this.services.cache.set(file.url, content)
          return this.serveFile(req, res, cachePath);
        } else {
          return this.dispatch(req, res, 'error');
        }
      }
      return this.serveFile(req, res, file.path);
    }
    if (file.isDir) {
      let indexPath = this.indexFilePath(file.path);
      if (indexPath) {
        return this.serveFile(req, res, indexPath)
      } else {
        return this.dispatch(req, res, 'error');
      }
    }
  }

  listen(req, res) {
    try {
      this.handleRequest(req, res);
      res.end();
    } catch (e) {
      console.log(e)
      this.dispatch(req, res, 'error');
    }
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
   * @param url
   * @returns {string|boolean} Index file path if exists or false if not.
   */
  indexFilePath(url) {
    let indexPath = path.join(this.rootDir, url);
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
    let filePath = this.filePath(url) || this.indexFilePath(url) || path.join(this.rootDir, url);
    if (!filePath) {
      return false;
    }
    let stat = fs.statSync(filePath);
    let ext = util.getFileExt(filePath);
    let file = {
      ext,
      url,
      path: filePath,
      isDir: stat?.isDirectory?.(),
      isFile: stat?.isFile?.()
    }
    return file;
  }

  serveFile(req, res, filePath) {
    let ext = util.getFileExt(filePath);
    let contentType = ContentType.getByExtension(ext, 'text/plain');
    let content = fs.readFileSync(filePath, {encoding: 'utf8'});
    res.setHeader('Content-Type', contentType);
    res.statusCode = 200;
    res.send(content);

  }

  streamCache(req, res) {

  }
}
module.exports = Router;