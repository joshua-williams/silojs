module.exports = class Response {
  constructor() {
    this.headers = {
      'Content-Type': 'text/plain'
    };
    this.body = '';
  }

  setHeader(name, value) {
    this.headers[name] = value;
    return this;
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
  send(content) {

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