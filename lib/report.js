const got = require('got');
const sha256 = require('crypto-js/sha256');
const dayjs = require('dayjs');
const chalk = require('chalk');

const API = {
  LOGIN: 'http://hmgr.sec.lit.edu.cn/wms/healthyLogin',
  REPORT: 'http://hmgr.sec.lit.edu.cn/wms/addHealthyRecord',
  LASTRECORD: 'http://hmgr.sec.lit.edu.cn/wms/lastHealthyRecord',
};

const headers = {
  Host: 'hmgr.sec.lit.edu.cn',
  Connection: 'keep-alive',
  Accept: 'application/json, text/plain, */*',
  DNT: '1',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36 Edg/81.0.416.64',
  Referer: 'http://hmgr.sec.lit.edu.cn/web/',
  'Accept-Encoding': 'gzip, deflate',
};

async function Report(cardNo, password, temperature) {
  if (temperature < 36.0 || temperature > 37.0)
    return chalk.red('取消上报！温度（36.0 ~ 37.0）');

  // 登录
  const { body } = await got.post(API.LOGIN, {
    headers,
    json: {
      cardNo: cardNo,
      password: sha256(password).toString(),
    },
    responseType: 'json',
  });

  if (body.success) {
    console.log(chalk.green('登录成功'));
  } else {
    return chalk.red('登录失败');
  }

  const token = body.data.token;
  const teamId = body.data.teamId;
  const userId = body.data.userId;
  headers.token = token;

  // 获取历史信息
  const resp = await got(API.LASTRECORD, {
    headers,
    searchParams: { teamId, userId },
    responseType: 'json',
  });

  if (resp.body.success) {
    console.log(chalk.green('获取历史数据成功'));
    //console.log(resp.body);
    const oldTemperature = resp.body.data.temperature;
    if (oldTemperature !== null || oldTemperature !== '')
      return chalk.blue(
        `获取到本日上报数据！已提交的温度为: ${oldTemperature}°C`
      );
  } else {
    return chalk.red('获取历史数据失败');
  }

  const reportData = resp.body.data;
  delete reportData.id;
  reportData.temperature = temperature;
  reportData.isTrip = 0;
  reportData.mobile = body.data.mobile;
  reportData.reportDate = dayjs().format('YYYY-MM-DD');
  reportData.tripList = [];
  reportData.peerList = [];

  // 上报信息
  //console.log(reportData);

  // Nothing....
  const res = await got.post(API.REPORT, {
    json: reportData,
    headers,
    responseType: 'json',
  });
  console.log(res.body);

  if (res.body.success) {
    return chalk.green(`上报成功，今日体温: ${temperature}°C`);
  } else {
    return chalk.red('上报失败');
  }
}

module.exports.Report = Report;
