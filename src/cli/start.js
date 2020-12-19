const { Command } = require('commander');
const program = new Command();

program
  .name('start')
  .description('Start silo application')
  .arguments('[indexPath]')
  .option('-d, --debug', 'Debug application')
  .action(options => {
    console.log('starting silo application...')
  })

module.exports = program;