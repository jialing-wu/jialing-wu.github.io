# Methods Website Quality Audit Checklist
> 每次检查页面时对照此文档打分，确保一致性

---

## 一、主页面（reg-*.html）审查标准

### A. 小白友好性（入口层）
- [ ] **challenge-overview 用日常语言**：是否用"你遇到了什么情况"开头？是否有具体场景（而非抽象定义）？
- [ ] **类比是否展开**：类比不是一句话带过，而是像 TM 那样展开为一个完整小故事（地图、交通、食谱级别）
- [ ] **无跳跃**：没有公式/术语突然出现却不解释。每个首次出现的术语都有直觉铺垫
- [ ] **problem-index 问题自然**：问题用第一人称疑问句（"我怎么知道…"），不是教科书标题

### B. 内容深度
- [ ] **每个 section 至少 2-3 个 h3 子节**（TM 标准是 3-4 个）
- [ ] **method-when 决策框架存在**：每个核心概念都有"何时用/不用"指导
- [ ] **method-example 真实案例**：来自政治学/社会学/经济学的具体研究，不是虚构数据
- [ ] **对比表或视觉元素**：至少一处使用 HTML 表格/compare-grid 来对比（如：FE vs RE、logit vs probit）
- [ ] **Resources 节完整**：推荐教材 + R/Stata 包 + 经典论文

### C. 中文质量
- [ ] **不是逐词直译**：检查是否有"每额外X增加Y的平均增加"这类机翻句式
- [ ] **术语统一**：同一页面内中英术语对应一致（不在某处叫"标准误"另一处叫"标准误差"）
- [ ] **读起来像母语写的解说文**：对标 reg-text.html / reg-race.html 的中文水平

### D. Guide 覆盖
- [ ] **至少 1 个 guide**：每个主页面至少挂 1 个 guide
- [ ] **guide 类型匹配需求**：
  - 有可视化概念 → 应有交互模拟 guide（Chart.js / Canvas）
  - 有统计方法流程 → 应有 R 代码 walkthrough guide
  - 有数学推导 → 应有推导 guide（MathJax）
- [ ] **guide 链接卡片存在且正确**：主页面有 `<!-- GUIDES -->` 区块，链接指向正确文件

### E. 元数据
- [ ] **front matter 完整**：layout, title, breadcrumb, bilingual, prev/next
- [ ] **prev/next 链接正确**：指向存在的页面，顺序合理
- [ ] **section id 命名规范**：`XX-s1`, `XX-s2`...（XX 为页面前缀）

---

## 二、Guide 页面（guides/reg-*.html）审查标准

### A. 元数据
- [ ] **parent_url 指向正确的 reg-*.html 文件名**
- [ ] **layout: methods-guide**
- [ ] **title / title_zh 都存在**

### B. 双层读者设计
- [ ] **前半段小白友好**：用交互/可视化/直觉解释让零基础读者建立概念
- [ ] **后半段深度扩展**：完整数学推导、R 代码流程、或高级用法
- [ ] **不是纯代码流水账**：如果只有 R 代码没有解释/可视化，判定为质量差

### C. 交互性
- [ ] **JS 代码存在且合理**（如声明了 Chart.js 或 Canvas）
- [ ] **控件有 data-lang 双语标签**
- [ ] **insight-box 总结关键发现**

### D. 中文质量
- [ ] 同主页面标准

### E. 内容完整度
- [ ] **不少于 350 行**（225 行的 reg-ts-panel.html 是反面教材）
- [ ] **有明确的学习路径**：从"为什么需要这个" → "核心概念" → "动手操作" → "常见陷阱"

---

## 三、Overview.html 审查标准

- [ ] **问题导向组织**：用户按"我遇到了什么问题"找方法，不是按学科翻目录
- [ ] **覆盖全部 18 个课程页面**：TM + 17 个 reg-*
- [ ] **每个入口有中英双语描述**
- [ ] **卡片格式统一**：使用 .m-list / .m-card 组件

---

## 四、各页面当前状态速查表

| 页面 | 行数 | 中文 | 深度 | 类比 | 对比表 | Guide数 | Guide质量 | 需做 |
|------|------|------|------|------|--------|---------|-----------|------|
| theoretical-modeling | 580 | ★★★ | ★★★ | ★★★ | ✓范式表+收益矩阵 | 4(tm-*) | ★★★ | 标杆 |
| reg-foundations | 326 | ★☆☆ | ★★☆ | ★★☆ | ✗ | 2 | ★★☆ | 润中文+补对比表 |
| reg-dataviz | 336 | ★★★ | ★★★ | ★★☆ | ✗ | 1 | ★★★ | 可加chart类型对比表 |
| reg-ols | 347 | ★☆☆ | ★★☆ | ★★☆ | ✗ | 2 | ★★★ | 润中文+补OLS假设对比表 |
| reg-mle | 317 | ★☆☆ | ★★☆ | ★★☆ | ✗ | 1 | ★★★ | 润中文+补GLM链接函数表+考虑加guide |
| reg-bayes | 311 | ★☆☆ | ★★☆ | ★★☆ | ✗ | 1 | ★★★ | 润中文+补MCMC诊断子节+考虑加guide |
| reg-causal | 362 | ★★★ | ★★★ | ★★★ | ✗ | 2 | ★★☆ | 内容OK |
| reg-timeseries | 319 | ★★☆ | ★★☆ | ★★☆ | ✗ | 1 | ★☆☆(225行) | guide需重写扩充+考虑加ARIMA guide |
| reg-measurement | 342 | ★★★ | ★★★ | ★★★ | ✗ | 2 | ★★★ | OK |
| reg-multilevel | 293 | ★☆☆ | ★★☆ | ★★☆ | ✗ | 1 | ★★★ | 润中文+补交叉嵌套/GLMM+FE-vs-RE对比表 |
| reg-empirical | 346 | ★★★ | ★★★ | ★★★ | ✗ | 1 | ★★★ | 可加空间权重矩阵可视化guide |
| reg-sem | 295 | ★★☆ | ★★☆ | ★★☆ | ✗ | 1 | ★★★ | 补路径图可视化+考虑加交互式路径编辑guide |
| reg-robustness | 319 | ★★★ | ★★★ | ★★★ | ✗ | 1(link断) | ★★★ | 修broken link+可加specification curve guide |
| reg-ml | 318 | ★★★ | ★★★ | ★★☆ | ✓compare-grid | 2 | ★★★ | OK（唯一有对比组件的页面）|
| reg-text | 299 | ★★★ | ★★★ | ★★★ | ✗ | 1 | ★★★ | 可加word embedding可视化guide |
| reg-network | 300 | ★★★ | ★★★ | ★★★ | ✗ | 1 | ★★★ | 可加社区检测guide |
| reg-rational | 343 | ★★★ | ★★★ | ★★★ | ✗ | 2 | ★★★ | 检查重复resource节 |
| reg-race | 346 | ★★★ | ★★★ | ★★★ | ✗ | 1 | ★★☆ | OK |

**星级说明**：★★★ = TM水平 | ★★☆ = 可用但有改进空间 | ★☆☆ = 需要修

---

## 五、已知 Broken Links / Bugs

1. `guides/reg-robust-boot.html` → `parent_url: "reg-robust.html"` → 应为 `"reg-robustness.html"`
2. `reg-rational.html` → 可能有重复 Resources 节（待验证）
3. `overview.html` → 只有 Demo Course，缺全部 18 个课程入口

---

## 六、新增 Guide 候选清单

| 候选 Guide | 父页面 | 类型 | 理由 |
|------------|--------|------|------|
| GLM 链接函数选择器 | reg-mle | 交互 | 主页缺"根据DV类型选链接函数"的决策工具 |
| MCMC 诊断可视化 | reg-bayes | 交互 | 主页提到MCMC但没有trace plot/Rhat交互 |
| ARIMA/时序分解 | reg-timeseries | 交互 | 现有guide只有面板FE/RE，缺纯时序内容 |
| 路径图交互编辑器 | reg-sem | 交互 | SEM最核心的就是路径图，缺可视化 |
| Specification Curve | reg-robustness | 交互 | 主页讲了但没有guide配合 |
| Word Embedding 可视化 | reg-text | 交互 | 语义空间t-SNE/PCA降维可视化 |
| 社区检测模拟 | reg-network | 交互 | Louvain算法步骤可视化 |
| 空间权重矩阵 | reg-empirical | 交互 | W矩阵构建和空间滞后可视化 |

优先级排序：前 4 个（GLM选择器、MCMC诊断、ARIMA、路径图）优先，因为对应的主页面内容也需要补强。后 4 个锦上添花。

---

## 七、执行顺序

```
第一步：重建 overview.html
第二步：修 broken links（reg-robust-boot parent_url + reg-rational 重复节）
第三步：润色 5 个中文差的主页面（ols, foundations, multilevel, mle, bayes）
第四步：内容补强 + guide 覆盖 + 小白友好性（按速查表逐页处理）
第五步：修质量差的 guide（重写 reg-ts-panel + 审查全部 23 个）
每步做完 commit 一次。
```
