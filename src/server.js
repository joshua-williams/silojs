const path = require('path');
const fs = require('fs');
const http = require('http');
const Router = require('./router');

class Server {

  constructor(options = {port:3000, root: null}) {
    this.port = options?.port;
    this.root = options?.root ?? process.cwd();
    this.router = new Router({
      root: this.root
    })
  }

  start() {
    const server = http.createServer(this.router.listen.bind(this.router))
    server.listen(this.port, () => {
      console.log(`silo application started on port ${this.port}`);
    })
  }
}

module.exports = options => new Server(options)



