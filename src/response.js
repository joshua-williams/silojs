module.exports = class Response {
  constructor(response = null) {
    this._res = response;
    this.headers = {
      'Content-Type': 'text/plain'
    };
    this.body = '';
  }
  set statusCode(value) {
    this._res.statusCode = value;
  }
  setHeader(name, value) {
    this._res.setHeader(name, value);
    return this;
  }

  setBody(content) {
    this.body = content;
  }

  contentType(contentType = false) {
    if (contentType === false) {
      return this.headers['Content-Type']
    }
    return this.setContentType(contentType);
  }

  setContentType(contentType) {
    this.headers['Content-Type'] = contentType;
  }
  end(content) {
    this._res.end(content)
  }
  sendHtml(html) {
    this.setContentType('text/html');
    this.body = html;
  }
  sendJson(obj) {
    this.setContentType('text/json');
    this.body = JSON.stringify(obj);
  }
}