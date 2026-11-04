# 拾光英语

给久未使用英语的成人学习者准备的本地学习应用。核心是自然拼读、词句记忆与听说读写情景练习，界面适配电脑与手机尺寸。

## 从 GitHub 获取

公开仓库：https://github.com/henghuaz917/little-english

```sh
git clone https://github.com/henghuaz917/little-english.git
cd little-english
npm ci
npm run build
npm start
```

然后访问 `http://127.0.0.1:4173`。也可以直接下载仓库内的 `拾光英语.html` 使用文件版。源码仓库不包含 `dist/`，首次使用启动脚本前请先执行上述安装与构建步骤。

## 直接使用

- **推荐**：在 Finder 中双击 `启动拾光英语.command`，自动打开 `http://127.0.0.1:4173`。需要 Node.js 18+，已构建版本无需安装 npm 依赖。保留终端窗口，关闭窗口即停止本地服务。
- **文件版**：双击 `拾光英语.html` 可直接使用。浏览器对 `file://` 的录音与存储支持不同，需要录音或稳定保存时使用推荐方式。
- 建议固定使用同一个浏览器和入口。文件版、`localhost`、`127.0.0.1` 以及不同端口分别保存进度；可以通过「学习设置 → 导出备份 / 导入备份」迁移。
- 当前服务仅监听本机；手机尺寸已适配，但并未发布公网，也不会自动同步到手机。

## 已实现

- 14 个原创 A1 生活情景，每课包含词句认识、拼读、听力、阅读、开口、自主写句六个步骤。
- 12 组自然拼读单元、41 个美式发音教学音项（含例词和口型提示）、声音侦探与拼读积木。
- 70 个词句。FSRS 调度识义、听辨、主动口头表达三个独立记忆方向，按真实自评安排复习。
- 浏览器英文朗读、语速选择、最长 60 秒的本地录音与回放。
- 课程进度续学、到期卡片自动更新、15/35/60 分钟目标、基于实际完成记录的成长页。
- 版本化本地存储、损坏提示、JSON 备份导出和校验后合并导入。

## 当前能力边界

- 音频使用浏览器 TTS，质量及可用声音由系统决定；部分语音需要系统下载或联网。音标页播放完整例词，不把音标字符串直接交给 TTS，不冒充单音真人教学录音。
- 口语采用录音回听和自评，没有专业发音评分；录音不上传，离开当前练习会释放。
- 写作支持固定参考句匹配（忽略大小写、常用标点及多余空格），并允许参考自查，尚无自由作文语法批改。
- 记忆复习为用户自评，不是口语或阅读水平考试。各方向的学习记录独立。
- 每个课程的完成、时间、四项练习次数仅首次通关累计，重复练习不重复刷记录。课程计时只累积前台活跃时段，连续两分钟没有交互会暂停累积；退出前自动保存。
- 35 分钟等是学习目标，不是强制等待时长。第一版内容为两周入门材料，没有声称达到某一 CEFR 等级或保证短期流利。
- 清理浏览器数据可能丢失记录，建议定期导出。当前版本不提供云账户或跨设备自动同步。

## 开发

```sh
npm install
npm run dev
npm test
npm run build
npm start
```

开发服务默认为 5173；可交付本地服务为 4173。QA 使用 5173，不会污染 4173 的正式学习记录。

技术栈：React、TypeScript、Vite、Lucide 图标、ts-fsrs。全部课程内容原创；未复制网络课程音视频与第三方词库。

## 参考与设计依据

- [TypeWords](https://github.com/zyronon/TypeWords)：词句输入、听写及错词回收的功能方向，仅参考设计，未复制其 GPL 源码。
- [Qwerty Learner](https://github.com/RealKai42/qwerty-learner)：面向键盘使用者的练习交互方向。
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)：实际使用的 MIT 复习调度组件。
- [National Literacy Trust：Phonics](https://literacytrust.org.uk/information/what-is-literacy/what-phonics/)：声音与字母对应的基础说明。
- [The role of variable retrieval in effective learning](https://pubmed.ncbi.nlm.nih.gov/39453748/)：主动回忆、间隔练习的研究参考；不据此承诺特定学习速度。

后续协作记录位于 `docs/ai/`，工作分支为 `ai/codex/english-learning`。源码已公开发布到 GitHub，保留开发分支，未合并其他分支。
