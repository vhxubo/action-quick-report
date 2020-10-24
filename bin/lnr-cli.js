#!/usr/bin/env node

const { program } = require('commander');
const { Report } = require('../lib/report');

program
  .version('0.0.1')
  .command('report <cardNo>')
  .requiredOption('-p, --password <string>', 'password is required')
  .requiredOption('-t,--temperature <float>', 'temperature is required')
  .alias('r')
  .description('洛阳理工学院健康上报 CLI')
  .action((cardNo, cmdObj) => {
    console.log(cardNo, cmdObj.password, cmdObj.temperature);
    Report(cardNo, cmdObj.password, cmdObj.temperature).then((res) =>
      console.log(res)
    );
  });

program.parse(process.argv);
