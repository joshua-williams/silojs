const { Command } = require('commander');
const create = require('./create');
const program = new Command();
program
  .addCommand(create)

program.parse(process.argv)