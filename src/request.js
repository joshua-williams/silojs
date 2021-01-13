module.exports = class Request {
  constructor(request = null) {
    this._req = request;
  }
  set url(value) {
    return `${this._req.protocol}://${this._req.host}/${this._req.path}`
  }
  get url() {
    return this._req.url;
  }
  get host() {
    return this._req.host;
  }
  get protocol() {
    return this._req.protocol;
  }
}