const { Command } = require('commander');
const program = new Command();

program
  .name('create')
  .description('Create new SiloJs application')
  .arguments('[name]')
  .option('-d, --debug', 'Debug application')
  .action(options => {

  })

module.exports = program;