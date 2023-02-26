#!/usr/bin/env zx

/* eslint-disable */

/*
 * This script is needed to send commands to BotFather
 * npm run botfather-commands
 */

const commands = require('../data/commands.json')

const formatted = commands
  .map(({ command, description }) => `${command} - ${description}`)
  .join('\n')

await $`echo ${formatted} | pbcopy`

console.log('\n\n\nCommands were copied to your cipboard')
