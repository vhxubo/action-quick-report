const got = require('got')
const sha256 = require('crypto-js/sha256')
const dayjs = require('dayjs')
const chalk = require('chalk')

const API = {
  LOGIN: 'http://hmgr.sec.lit.edu.cn/wms/healthyLogin',
  REPORT: 'http://hmgr.sec.lit.edu.cn/wms/addHealthyRecord',
  LASTRECORD: 'http://hmgr.sec.lit.edu.cn/wms/lastHealthyRecord'
}

const headers = {
  Host: 'hmgr.sec.lit.edu.cn',
  Connection: 'keep-alive',
  Accept: 'application/json, text/plain, */*',
  DNT: '1',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36 Edg/81.0.416.64',
  Referer: 'http://hmgr.sec.lit.edu.cn/web/',
  'Accept-Encoding': 'gzip, deflate'
}

module.exports = async function Report (cardNo, password, temperature) {
  if (temperature < 36.0 || temperature > 37.0) { return chalk.red('取消上报！温度（36.0 ~ 37.0）') }

  const reportDate = dayjs().format('YYYY-MM-DD')

  // 登录
  const { body: loginBody } = await got.post(API.LOGIN, {
    headers,
    json: {
      cardNo: cardNo,
      password: sha256(password).toString()
    },
    responseType: 'json'
  })

  if (loginBody.success) {
    console.log(chalk.green('登录成功'))
  } else {
    return chalk.red('登录失败')
  }

  const { token, teamId, userId } = loginBody.data
  headers.token = token

  // 获取历史信息
  const { body: oldBody } = await got(API.LASTRECORD, {
    headers,
    searchParams: { teamId, userId },
    responseType: 'json'
  })

  if (oldBody.success) {
    console.log(chalk.green('获取历史数据成功'))

    const {
      temperature: oldTemperature,
      reportDate: oldReportDate
    } = oldBody.data

    if (
      (oldTemperature !== null || oldTemperature !== '') &&
      reportDate === oldReportDate
    ) {
      return chalk.blue(
        `获取到本日上报数据！已提交的温度为: ${oldTemperature}°C`
      )
    }
  } else {
    return chalk.red('获取历史数据失败')
  }

  const reportData = {
    ...oldBody.data,
    temperature,
    reportDate,
    isTrip: 0,
    mobile: loginBody.data.mobile,
    tripList: [],
    peerList: []
  }
  delete reportData.id

  // console.log(reportData)

  // Nothing....
  const { body: resultBody } = await got.post(API.REPORT, {
    json: reportData,
    headers,
    responseType: 'json'
  })
  console.log(resultBody)

  if (resultBody.success) {
    return chalk.green(`上报成功，今日体温: ${temperature}°C`)
  } else {
    return chalk.red('上报失败')
  }
}
