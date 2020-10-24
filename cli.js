const { program } = require('commander');
const { Report } = require('./index');

program
  .version('0.0.1')
  .requiredOption('-c, --cardNo <string>', 'cardNo is required')
  .requiredOption('-p, --password <string>', 'password is required')
  .requiredOption('-t,--temperature <float>', 'temperature is required');

program.parse(process.argv);

console.log(`cardNo:${program.cardNo}\npassword: ${program.password}`);

if (
  program.temperature !== undefined &&
  program.temperature >= 36.0 &&
  program.temperature < 37.0
) {
  console.log(`temperature:${program.temperature}`);
  Report(program.cardNo, program.password, program.temperature).then((res) =>
    console.log(res)
  );
} else {
  console.log('temperature error');
  return -1;
}
