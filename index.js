require('dotenv').config();
const got = require('got');
const sha256 = require('crypto-js/sha256');

const API = {
    login: 'http://hmgr.sec.lit.edu.cn/wms/healthyLogin',
    report: 'http://hmgr.sec.lit.edu.cn/wms/addHealthyRecord',
    lastRecord: 'http://hmgr.sec.lit.edu.cn/wms/lastHealthyRecord',
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

const cardNo = process.env.CARDNO;
const password = sha256(process.env.PASSWORD).toString();

(async () => {
    // 登录
    const { body } = await got.post(API.login, {
        json: {
            cardNo: cardNo,
            password: password,
        },
        headers,
        responseType: 'json',
    });

    if (body.success) {
        console.log('登录成功');
    } else {
        console.log('登录失败');
    }

    const token = body.data.token;
    const teamId = body.data.teamId;
    const userId = body.data.userId;
    headers.token = token;

    // 获取历史信息
    const resp = await got(API.lastRecord, {
        searchParams: { teamId, userId },
        headers,
        responseType: 'json',
    });

    if (resp.body.success) {
        console.log('获取历史数据成功');
    } else {
        console.log('获取历史数据失败');
    }

    const reportData = resp.body.data;
    const temperature = (Math.random() * 0.6 + 36).toFixed(1).toString();
    reportData.temperature = temperature;
    reportData.isTrip = 0;
    reportData.mobile = body.data.mobile;

    // 上报
    //console.log(reportData);
    const res = await got.post(API.report, {
        json: reportData,
        headers,
        responseType: 'json',
    });
    console.log(res.body);

    if (res.body.success) {
        console.log('上报成功，今日体温：' + temperature);
    }
})();
