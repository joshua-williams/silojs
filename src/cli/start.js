const server = require('../server.js');
const { Command } = require('commander');
const program = new Command();

program
  .name('start')
  .description('Start silo application')
  .arguments('[indexPath]')
  .option('-p, --port [number]', 'Port number', 3000)
  .option('-r, --root [string]', 'The document root directory', 'public')
  .option('-i, --index[string]', 'Index file to serve content.', ['index.[html|js|jsx]'])
  .option('--no-cache[boolean]', 'Disable caching', 'false')
  .option('-d, --debug', 'Debug application')
  .action(() => {
    const options = {port: program.port};
    console.log(options)
    server(options).start();
  })

module.exports = program;