const { Command } = require('commander');
const program = new Command();

program
  .name('create')
  .description('Create new SiloJs application')
  .arguments('[name]')
  .option('-d, --debug', 'Debug application')
  .action(options => {
    console.log('creating silo application...')
  })

module.exports = program;