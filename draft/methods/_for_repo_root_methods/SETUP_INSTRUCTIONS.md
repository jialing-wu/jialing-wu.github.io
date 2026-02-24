# Jekyll 迁移设置指南（当前版本）

## 推送步骤：在 Mac 终端执行

```bash
cd ~/Downloads/personalweb

# 复制 Jekyll 配置文件
cp methods/_for_repo_root/_config.yml .

# 复制 layouts
mkdir -p _layouts
cp methods/_for_repo_root/_layouts/*.html _layouts/

# 复制 includes
mkdir -p _includes/methods
cp methods/_for_repo_root/_includes/methods/*.html _includes/methods/

# 复制 data
mkdir -p _data
cp methods/_for_repo_root/_data/methods_nav.yml _data/

# 推送到 GitHub
git add _config.yml _layouts/ _includes/ _data/
git add methods/index.html methods/style.css
git add methods/demo-course.html
git add methods/notebook.html methods/overview.html
git add methods/guides/demo-guide.html
git commit -m "Jekyll layout: bilingual home, demo course+guide, sidebar, TOC"
git push origin main
```

等 1-2 分钟让 GitHub Pages 构建，然后访问：
- https://jialing-wu.github.io/methods/index.html
- https://jialing-wu.github.io/methods/demo-course.html
- https://jialing-wu.github.io/methods/guides/demo-guide.html

## 验证清单

- [ ] 首页正常，有中英文切换，两个并排卡片
- [ ] demo-course.html：侧边栏、右侧目录、表格、公式、Guide 链接、前后导航
- [ ] demo-guide.html：侧边栏、面包屑、返回课程按钮
- [ ] 侧边栏当前页高亮
- [ ] 其他旧页面（如 lpa.html）仍然正常

## 当前文件结构说明

```
_for_repo_root/
  _config.yml           → 复制到仓库根目录
  _layouts/
    methods-home.html   → 首页布局（带语言切换）
    methods-course.html → 课程页布局（带侧边栏+目录）
    methods-guide.html  → 指南子页布局
  _includes/methods/
    sidebar.html        → 左侧导航栏
    topbar.html         → 顶部栏（含语言切换按钮）
    scripts.html        → JS：语言切换 + 目录生成
  _data/
    methods_nav.yml     → 侧边栏导航数据

methods/
  index.html            → 首页（双语）
  style.css             → 样式
  demo-course.html      → 示例课程页（演示所有效果）
  notebook.html         → 占位
  overview.html         → 浏览课程（占位）
  guides/
    demo-guide.html     → 示例指南子页
```

## 如果出问题了

```bash
cd ~/Downloads/personalweb/methods
git checkout index.html style.css   # 恢复修改过的文件

cd ~/Downloads/personalweb
git rm -r --cached _config.yml _layouts/ _includes/methods/ _data/methods_nav.yml
git commit -m "Revert Jekyll setup"
git push origin main
```
