require('dotenv').config()
const got = require('got')
const sha256 = require('crypto-js/sha256')
const dayjs = require('dayjs')

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

const cardNo = process.env.CARDNO
const password = sha256(process.env.PASSWORD).toString();

(async () => {
  // 登录
  const { body } = await got.post(API.LOGIN, {
    headers,
    json: {
      cardNo: cardNo,
      password: password
    },
    responseType: 'json'
  })

  if (body.success) {
    console.log('登录成功')
  } else {
    console.log('登录失败')
  }

  const token = body.data.token
  const teamId = body.data.teamId
  const userId = body.data.userId
  headers.token = token

  // 获取历史信息
  const resp = await got(API.LASTRECORD, {
    headers,
    searchParams: { teamId, userId },
    responseType: 'json'
  })

  if (resp.body.success) {
    console.log('获取历史数据成功')
    console.log(resp.body)
  } else {
    console.log('获取历史数据失败')
    return
  }

  const reportData = resp.body.data
  const temperature = '36.4'
  delete reportData.id
  reportData.temperature = temperature
  reportData.isTrip = 0
  reportData.mobile = body.data.mobile
  reportData.reportDate = dayjs().format('YYYY-MM-DD')
  reportData.tripList = []
  reportData.peerList = []

  // 上报
  console.log(reportData)

  // Nothing....
  const res = await got.post(API.REPORT, {
    json: reportData,
    headers,
    responseType: 'json'
  })
  console.log(res.body)

  if (res.body.success) {
    console.log('上报成功，今日体温：' + temperature)
  } else {
    console.log('上报成功，今日体温：' + temperature)
  }
})()
