# lit-ncov-report-cli

洛阳理工学院健康上报系统 CLI

## 声明

本脚本符合正常上报程序，仅仅为了精简操作步骤

1. 使用学号密码登录
2. 提交您测量的温度

融入到一个命令行中

```bash
npx github:vhxubo/lit-ncov-report-cli r <yourcardNo> -p <yourpassword> -t <temperature>
```

## Feature

- Report temperature using one command
- temperature 36.0 ~ 37.0

## Get Start

```bash
git clone https://github.com/vhxubo/lit-ncov-report-cli.git

cd /lit-ncov-report-cli

npm install

npm link

lnr-cli report <yourcardNo> -p <yourpassword> -t <temperature>
```
