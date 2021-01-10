#!/usr/bin/env node

const { Command } = require('commander');
const create = require('./create');
const start = require('./start');
const cache = require('./cache');
const program = new Command();

program
  .addCommand(start)
  .addCommand(create)
  .addCommand(cache)
  .parse(process.argv)