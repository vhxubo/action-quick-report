const got = require('got')
const sha256 = require('crypto-js/sha256')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc') // dependent on utc plugin
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

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

const options = {
  headers,
  responseType: 'json'
}

// 账号登陆
function login (cardNo, password) {
  return got.post(API.LOGIN, {
    json: {
      cardNo: cardNo,
      password: sha256(password).toString()
    },
    ...options
  })
}

//  获取历史数据
function getHistory (loginData) {
  const { token, teamId, userId } = loginData
  options.headers.token = token
  return got(API.LASTRECORD, {
    ...options,
    searchParams: { teamId, userId }
  })
}

// 检测是否完成上报
function isReported (oldData, today) {
  const {
    temperature,
    reportDate
  } = oldData

  if (
    (temperature !== null || temperature !== '') &&
    reportDate === today
  ) { return true }

  return false
}

// 生成今日体温
function setReportData (oldData, mobile, temperature) {
  delete oldData.id
  return {
    ...oldData,
    isTrip: 0,
    mobile,
    tripList: [],
    peerList: [],
    temperature
  }
}

module.exports = async function report (cardNo, password, temperature) {
  if (temperature < 36.0 || temperature > 37.0) { return { success: false, msg: '体温错误' } }

  const today = dayjs().tz('Asia/ShangHai').format('YYYY-MM-DD')
  console.log(today)

  // 登录
  const { body: loginBody } = await login(cardNo, password)

  if (loginBody.success) {
    console.log('登录成功')
  } else {
    return { success: false, msg: '登录失败' }
  }
  const loginData = loginBody.data

  // 获取历史信息
  const { body: oldBody } = await getHistory(loginBody.data)

  if (oldBody.success) {
    console.log('获取历史数据成功')
  } else {
    return { success: false, msg: '获取历史数据失败' }
  }
  const oldData = oldBody.data

  // 今日上报是否完成
  if (isReported(oldData, today)) {
    return { success: false, msg: '今日上报已被完成' }
  }

  // 生成今日上报数据
  const reportData = setReportData(oldData, loginData.mobile, temperature)

  console.log(JSON.stringify(reportData))

  // 上报今日体温数据
  const { body: resultBody } = await got.post(API.REPORT, {
    json: reportData,
    ...options
  })

  if (resultBody.success) {
    console.log(`上报成功，今日体温: ${temperature}°C`)
  } else {
    return { success: false, msg: '上报失败' }
  }

  return { success: true, msg: '今日上报已成功!', desp: `今日体温: ${temperature}°C` }
}
