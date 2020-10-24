# lit-ncov-report-cli

洛阳理工学院健康上报系统 CLI

## 声明

本脚本符合正常上报程序，仅仅为了精简操作步骤

1. 使用学号密码登录
2. 提交您测量的温度

融入到一个命令行中

```bash
node cli.js -c B11011111 -p 123456 -t 36.5
```

## Feature

- Report temperature using one command
- temperature 36.0 ~ 37.0

## Get Start

```bash
npm install

node cli.js -c <yourcardNo> -p <yourpassword> -t <temperature>
```
