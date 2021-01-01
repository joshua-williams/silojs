module.exports = class Response {
  constructor() {
    this.headers = {}
    this.body = ''
  }
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  }
  setContentType(cotentType) {
    this.headers['Content-Type'] = cotentType;
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