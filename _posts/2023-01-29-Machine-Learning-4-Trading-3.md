<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']]
            }
        });
    </script>
</head>

---
layout: post
title: Machine Learning for Algorithmic Trading 学习小记（三）
date: 2023-01-29
description: 本文主要记录笔者学习第4章的体会。
---

## 引言

前文的内容如下：

- [Machine Learning for Algorithmic Trading 学习小记(一)](https://rossea.github.io/2023-01-25-Machine-Learning-4-Trading-1/) 安装。
- [Machine Learning for Algorithmic Trading 学习小记(二)](https://rossea.github.io/2023-01-25-Machine-Learning-4-Trading-2/) 第1章到第3章。

本文主要记录笔者学习第4章的体会。本章是该书第二版修订比较大的部分，增加了很多示例。值得精读。

## 第4章 金融特征工程：如何研究 Alpha 因子

本书中 Alpha 因子的概念源自基于Markowitz理论[<sup>1</sup>](#Markowitz1959) 的资本资产定价模型(Capital Asset Pricing Model, CAPM)  [<sup>2,</sup>](#Treynor1961)[<sup>3,</sup>](#Sharpe1964)[<sup>4,</sup>](#Lintner1975)[<sup>5</sup>](#Mossin1966) 。虽然在数学上等价，但是这四篇论文论述的角度不同[<sup>6</sup>](#Sullivan2006)：Treynor 受到 Modigliani and Miller 1958 理论的影响，因此他的着眼点是 Modigliani and Miller 定理中的命题一：企业的资本结构和它的价值无关。Sharpe 受 Markowitz 理论的影响，出发点是最优化投资组合的选择。Linter 的研究更关注通过发行股票融资的公司，并认为公司的财务政策非常重要。Mossin 的工作也来自投资组合理论，但是他关注的重点是资产市场的均衡条件。除此之外，还有其他区别[<sup>7</sup>](#French2003)。

### 模型假设
因子模型的假设基于 Markowitz 描述过的市场投资理论, 即:

- 市场是有效的 (Efficient Market), 即所有投资者拥有同样的市场信息.
- 投资者偏向风险规避(Risk averse).
- 投资者是理性的(rational), 即组合选择会根据期望收益和风险
- 股票或资产没有交易成本, 允许卖空(short), 且收益可以全部投资(fully invested)



对 CAPM 的常见表述是：
特定投资组合的预期回报 $E[r_{a}]$ 可表述为：

<!-- $$r_{p} - r_{f} = \beta_{a}(r_{m} - r_{f}) + \epsilon  \tag1$$ -->

$$E[r_{a}] = r_{f} + \beta_{a}(E[r_{m}]-r_{f}) \tag1$$

其中 $r_{f}$ 是无风险回报(如国债券回报)，$E[r_{m}]$ 是市场的预期回报，通常由标准普尔500指数等指数的回报率来衡量，$\beta_{a}$ 衡量投资相对于市场的波动性，可表述为：

$$\beta_{a} = \frac{\text{Cov}(r_{a},r_{m})}{\text{Var}(r_{m})} \tag2$$

因此，该模型假设 $E[r_{a}]$ 与数量 $(E[r_{m}]-r_{f})$ 之间存在线性关系，也称为市场溢价，受系数 $\beta_{a}$ 影响。如果我们想衡量模型中关于无风险利率 $r_{f}$ 的所有回报，从而在数量 $(E[r_{a}]-r_{f})$ 和市场溢价 $(E[r_{a}]-r_{f})$ 之间构建线性回归关系，可表述为：

$$(E[r_{a}] - r_{f}) = \alpha + \beta_{a}(E[r_{m}] - r_{f}) \tag3$$

通过这种方式，$\alpha$ 衡量了现实生活中所测量的预期收益 $E[r_{a}]$ 之间的差异，以及我们的投资的预期回报：

$$\alpha = E[r_{a}] - \left(r_{f} + \beta_{a}(E[r_{m}] - r_{f})\right) \tag4$$

### 示例说明

以下代码示例

#### 代码示例：如何使用 pandas 和 NumPy 设计因子
 
[ data ](00_data) 目录中的笔记本 [ feature_engineering.ipynb ](00_data/feature_engineering.ipynb)说明了如何设计基本因素。
 
#### 代码示例：如何使用 TA-Lib 创建技术 alpha 因子
 
笔记本 [ how_to_use_talib ](02_how_to_use_talib.ipynb) 说明了 TA-Lib 的用法，其中包括广泛的常用技术指标。这些指标的共同点是它们仅使用市场数据，即价格和数量信息。
 
**附录**中的笔记本 [ common_alpha_factors ](../24_alpha_factor_library/02_common_alpha_factors.ipynb)包含许多其他示例。
 
#### 代码示例：如何使用卡尔曼滤波器对 Alpha 因子进行降噪
 
笔记本 [ kalman_filter_and_wavelets ](03_kalman_filter_and_wavelets.ipynb) 演示了使用PyKalman包进行平滑的卡尔曼滤波器的使用；我们还将在 [第 9 章](../09_time_series_models) 中开发配对交易策略时使用它。
 
#### 代码示例：如何使用小波预处理噪声信号
 
笔记本 [ kalman_filter_and_wavelets ](03_kalman_filter_and_wavelets.ipynb) 还演示了如何使用“PyWavelets”包处理小波。

#### 代码示例：如何使用 Zipline 回测单因素策略
 
notebook [ single_factor_zipline ](04_single_factor_zipline.ipynb) 开发并测试了一个简单的均值回归因子，用于衡量近期表现偏离历史平均水平的程度。短期反转是一种常见的策略，它利用了弱预测模式，即股价上涨可能会在不到一分钟到一个月的时间范围内均值回落。
 
#### 代码示例：在 Quantopian 平台上结合来自不同数据源的因素
 
Quantopian 研究环境专为预测性 alpha 因子的快速测试而量身定制。这个过程非常相似，因为它建立在`zipline` 之上，但提供了更丰富的数据源访问。
 
笔记本 [ multiple_factors_quantopian_research ](05_multiple_factors_quantopian_research.ipynb) 说明了如何不仅像以前那样从市场数据中计算 alpha 因子，而且还从基本面和替代数据中计算 alpha 因子。
 
#### 代码示例：分离信号和噪声——如何使用 alphalens
 
notebook [ performance_eval_alphalens ](06_performance_eval_alphalens.ipynb) 引入了 [ alphalens ](http://quantopian.github.io/alphalens/) 库，用于预测(alpha)因子的性能分析，由 Quantopian 开源。它演示了它如何与我们将在下一章探讨的回测库`zipline`和投资组合绩效和风险分析库`pyfolio` 集成。
 
 
#### 资源
 
- [法玛法语](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html) 数据库
- [ numpy ](https://numpy.org/) 网站
 - [快速入门教程](https://numpy.org/devdocs/user/quickstart.html)
- [熊猫](https://pandas.pydata.org/) 网站
 - [用户指南](https://pandas.pydata.org/docs/user_guide/index.html)
 - [ 10 分钟到熊猫](https://pandas.pydata.org/pandas-docs/stable/getting_started/10min.html)
 - [ Python Pandas 教程：初学者的完整介绍](https://www.learndatasci.com/tutorials/python-pandas-tutorial-complete-introduction-for-beginners/)
- [ alphatools ](https://github.com/marketneutral/alphatools) - Python 中的量化金融研究工具
- [ mlfinlab ](https://github.com/hudson-and-thames/mlfinlab) - 基于 Marcos Lopez de Prado 博士关于金融机器学习进展研究的工作包
- [ PyKalman ](https://pykalman.github.io/) 文档
- [教程：卡尔曼滤波器](http://web.mit.edu/kirtley/kirtley/binlustuff/literature/control/Kalman%20filter.pdf)
- [理解和应用卡尔曼滤波](http://biorobotics.ri.cmu.edu/papers/sbp_papers/integrated3/kleeman_kalman_basics.pdf)
- [卡尔曼滤波器的工作原理，图片](https://www.bzarg.com/p/how-a-kalman-filter-works-in-pictures/)
- [ PyWavelets ](https://pywavelets.readthedocs.io/en/latest/) - Python 中的小波变换
- [小波简介](https://www.eecis.udel.edu/~amer/CISC651/IEEEwavelet.pdf)
- [小波教程](http://web.iitd.ac.in/~sumeet/WaveletTutorial.pdf)
- [儿童小波](http://www.gtwavelet.bme.gatech.edu/wp/kidsA.pdf)
- [ Barra 股权风险模型手册](https://www.alacra.com/alacra/help/barra_handbook_GEM.pdf)
- [主动投资组合管理：产生卓越回报和控制风险的定量方法](https://www.amazon.com/Active-Portfolio-Management-Quantitative-Controlling/dp/0070248826)，作者 Richard Grinold 和 Ronald Kahn，1999 年
- [现代投资管理：均衡方法](https://www.amazon.com/Modern-Investment-Management-Equilibrium-Approach/dp/0471124109) Bob Litterman，2003
- [量化股权投资组合管理：现代技术与应用](https://www.crcpress.com/Quantitative-Equity-Portfolio-Management-Modern-Techniques-and-Applications/Qian-Hua-Sorensen/p/book/9781584885580 ) 作者：Edward Qian、Ronald Hua 和 Eric Sorensen
- [斯皮尔曼等级相关性](https://statistics.laerd.com/statistical-guides/spearmans-rank-order-correlation-statistical-guide.php)
 
- [ zipline ](https://zipline.ml4trading.io/index.html)是一个用于回溯测试的Pythonic事件驱动系统，由 crowd-sourced investment fund Quantopian 开发并用作回测和实时交易引擎。自 2020 年底关闭以来，托管这些文档的域已过期。该库在本书中被广泛使用，作者 Stefan Jansen 试图使库保持最新状态，并可供他的读者和更广泛的Python算法交易社区使用。
 
- [第 8 章](../08_ml4t_workflow) 包含对 Zipline 的更全面的介绍。
-请按照`installation`文件夹中的 [说明](../installation) 进行操作，包括解决**已知问题**。
- `alphalens` 有助于分析有关以下方面的 alpha 因素的预测能力：
  
  -- 信号与后续回报的相关性

  -- 基于信号(子集)的相等或因子加权投资组合的盈利能力

  -- 换手率表明潜在的交易成本

  -- 特定事件期间的因素表现

  -- 按行业划分的上述细目

  参阅[此处](https://github.com/quantopian/alphalens/blob/master/alphalens/examples/alphalens_tutorial_on_quantopian.ipynb)，了解 Quantopian 的详细“alphalens”教程

## 参考


<div id="Markowitz1959"></div>

- [1] Markowitz H. Portfolio Selection Efficient Diversification of Investments. John Wiley&Sons[J]. Inc, New York, 1959.

<div id="Treynor1961"></div>

- [2] Treynor, J. L. Market Value, Time, and Risk. Unpublished manuscript. “Rough Draft” dated 8/8/1961：#95-209.
//Toward a Theory of Market Value of Risky Assets. Unpublished manuscript. “Rough Draft” dated 1962. //In Asset Pricing and Portfolio Performance.R. A. Korajczyk (editor), London: Risk Books, 1999:15–22.

<div id="Sharpe1964"></div>

- [3] Sharpe W F. Capital asset prices: A theory of market equilibrium under conditions of risk[J]. The journal of finance, 1964, 19(3): 425-442.

<div id="Lintner1975"></div>

- [4] Lintner J. The valuation of risk assets and the selection of risky investments in stock portfolios and capital budgets[M]//Stochastic optimization models in finance. Academic Press, 1975: 131-155.

<div id="Mossin1966"></div>

- [5] Mossin J. Equilibrium in a capital asset market[J]. Econometrica: Journal of the econometric society, 1966: 768-783.

<div id="Sullivan2006"></div>

- [6] Sullivan E J. A brief history of the capital asset pricing model[J]. APUBEF Proceedings, 2006: 207-210.

<div id="French2003"></div>

- [7] French C W. The Treynor capital asset pricing model[J]. Journal of Investment Management, 2003, 1(2): 60-72.
