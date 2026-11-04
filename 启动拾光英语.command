#!/bin/zsh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  print '请先安装 Node.js 18 或更新版本，也可以直接双击「拾光英语.html」使用文件版。'
  read '?按回车关闭窗口。'
  exit 1
fi
node scripts/serve.mjs --open
if [ $? -ne 0 ]; then
  read '?按回车关闭窗口。'
fi
