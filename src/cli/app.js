#!/usr/bin/env node

const { Command } = require('commander');
const create = require('./create');
const start = require('./start');
const program = new Command();

program
  .addCommand(start)
  .addCommand(create)
  .parse(process.argv)