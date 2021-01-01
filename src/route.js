class Route {}
module.exports = class Route {
  constructor(options = {}) {
    this.method = options.method;
    this.callback = options.callback;
  }
}