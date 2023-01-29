---
layout: post
title: Machine Learning for Algorithmic Trading 学习小记（二）
date: 2023-01-26
description: 在学习《机器学习与算法交易（第二版）》的过程中，发现一些琐碎的技术细节，特记录如下。本文主要记录笔者在学习第1章至第3章中遇到的问题。
---

## 引言

前文 [Machine Learning for Algorithmic Trading 学习小记（一）](https://rossea.github.io/2023-01-25-Machine-Learning-4-Trading-1/)介绍了笔者安装本书算例的过程。本文主要记录笔者在学习第1章至第3章中遇到的问题。如果不做美国股票这三章，只需要大概了解。因后继章节会用到第二章获得的数据。

## 第1章 机器学习交易：从构想到执行

基本介绍。本章无示例。

## 第2章 市场和基本数据：来源和技术

本章介绍美股NASDAQ数据的获取，略读。

### 2.2.3.1 代码示例：解析和标准化报价数据

#### 示例1

```text
machine-learning-for-trading-master
  │
  └───02_market_and_fundamental_data/
      │
      └───01_NASDAQ_TotalView-ITCH_Order_Book
          │
          └───01_parse_itch_order_flow_messages.ipynb
```

本示例下载[Nasdaq TotalView-ITCH 5.0](http://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf)格式 TotalView ITCH Order Book的10302019.NASDAQ_ITCH50示例数据，并解析后存入 ./data/itch.h5 文件。
笔者在处理二进制文件并生成按消息类型存储的解析订单消息环节，耗时 01:01:17.09小时，生成的 HDF5 格式的文件占用 15.9 GB 磁盘空间。
内存使用的峰值为 28.8 GB。

---

- 数据下载地址变更

因 NASDAQ ftp server 无法访问，改为https方式：

```diff
cell [6]:
- FTP_URL = 'ftp://emi.nasdaq.com/ITCH/Nasdaq ITCH/'
+ FTP_URL = 'https://emi.nasdaq.com/ITCH/Nasdaq ITCH/'
SOURCE_FILE = '10302019.NASDAQ_ITCH50.gz'
```

---

- xlrd 版本过高

```python
cell [12]:
message_data = (pd.read_excel('message_types.xlsx',
                              sheet_name='messages')
                .sort_values('id')
                .drop('id', axis=1))
```

```text
ValueError: Your version of xlrd is 2.0.1. In xlrd >= 2.0, only the xls format is supported. Install openpyxl instead.
```

需要降级xlrd：

```sh
(base) packt@8b57b786cab8:~/ml4t$ conda activate ml4t
(ml4t) packt@8b57b786cab8:~/ml4t$ conda search -f xlrd
```

可以看到，2.0.0 以下的最高版本是 1.2.0.

```sh
(ml4t) packt@8b57b786cab8:~/ml4t$ conda install xlrd==1.2.0
```

#### 示例2

```text
machine-learning-for-trading-master
  │
  └───02_market_and_fundamental_data/
      │
      └───01_NASDAQ_TotalView-ITCH_Order_Book
          │
          └───02_rebuild_nasdaq_order_book.ipynb
```

- 本示例重建Nasdaq交易订单簿并存入 order_book.h5 文件。可直接运行。

#### 示例3

```text
machine-learning-for-trading-master
  │
  └───02_market_and_fundamental_data/
      │
      └───01_NASDAQ_TotalView-ITCH_Order_Book
          │
          └───03_normalize_tick_data.ipynb
```

- 本示例规范化tick数据。可直接运行。

### 2.2.4.2 代码示例：如何处理AlgoSeek的日内数据

本示例展示如何处理 NASDAQ100 分钟线交易数据。

#### 示例

```text
machine-learning-for-trading-master
  │
  └───02_market_and_fundamental_data/
      │
      └───02_algoseek_intraday
          │
          └───algoseek_minute_data.ipynb
```

```python
% matplotlib inline
```

是可以在Ipython编译器里直接使用，功能是可以内嵌绘图，并且可以省略掉plt.show()这一步。
对于使用jupyter lab的同学，需要注释掉才能执行，否则会报错：

```text
UsageError: Line magic function `%` not found.
```

对于使用vscode和Docker插件的同学，无此问题。

欲运行本示例，要[下载NASDAQ100 分钟线交易数据（大小4.2GB）](https://algoseek-public.s3.amazonaws.com/nasdaq100-1min.zip)。
解压得到 “2015”、“2016”、“2017”三个文件夹。

示例代码将在 D:\src\python3\machine-learning-for-trading-master\data\nasdaq100 目录下生成的 algoseek.h5 文件。但在 data.to_hdf() 步骤需要的物理内存大于32GB，因为我的笔记本电脑只有32GB内存，只能按照“年”为单位，划分为3个区间，对应生成 algoseek_2015.h5、 algoseek_2016.h5、 algoseek_2017.h5 三个文件。

具体做法是 先把解压的“2015”文件夹放入到“D:\src\python3\machine-learning-for-trading-master\data\nasdaq100\1min_taq\”中，修改代码：

```diff
cell[9]:
def extract_and_combine_data():
    path = nasdaq_path / '1min_taq'
    if not path.exists():
        path.mkdir(parents=True)

    data = []
    # ~80K files to process
    for f in tqdm(list(path.glob('*/**/*.csv.gz'))):
        data.append(pd.read_csv(f, parse_dates=[['Date', 'TimeBarStart']])
                    .rename(columns=str.lower)
                    .drop(tcols + drop_cols, axis=1)
                    .rename(columns=columns)
                    .set_index('date_timebarstart')
                    .sort_index()
                    .between_time('9:30', '16:00')
                    .set_index('ticker', append=True)
                    .swaplevel()
                    .rename(columns=lambda x: x.replace('tradeat', 'at')))
    data = pd.concat(data).apply(pd.to_numeric, downcast='integer')
    data.index.rename(['ticker', 'date_time'], inplace=True)
    print(data.info(show_counts=True))
-    data.to_hdf(nasdaq_path / 'algoseek.h5', 'min_taq')
+    data.to_hdf(nasdaq_path / 'algoseek_2015.h5', 'min_taq')
```

```diff
cell[11]
- df = pd.read_hdf(nasdaq_path / 'algoseek_2015.h5', 'min_taq')
+ df = pd.read_hdf(nasdaq_path / 'algoseek_2015.h5', 'min_taq')
```

同理，继续分别处理“2016”、“2017”文件夹。

---

### 2.3.5.3  代码示例：Pandas 数据读取器

```text
machine-learning-for-trading-master
  │
  └───02_market_and_fundamental_data/
      │
      └───03_data_providers
          │
          └───01_pandas_datareader_demo.ipynb
```

用read_html函数访问网站上显示的数据

#### 示例

因为某些原因，以下地址需要代理才能访问。

- 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'

- 'https://finance.yahoo.com/quote/FB/history?period1=1388548800&period2=1495684799&interval=1d&frequency=1d&filter=history'

以下地址也无法访问：

- Fama/French

```text
ConnectionError: HTTPConnectionPool(host='mba.tuck.dartmouth.edu', port=80): Max retries exceeded with url: /pages/faculty/ken.french/ftp/5_Industry_Portfolios_CSV.zip (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x7f6434069040>: Failed to establish a new connection: [Errno -3] Temporary failure in name resolution'))
```

### 2.3.5.4 yfinance：Yahoo! 金融市场和基本数据

```text
machine-learning-for-trading-master
  │
  └───02_market_and_fundamental_data/
      │
      └───03_data_providers
          │
          └───02_yfinance_demo.ipynb
```

#### 示例

因为某些原因，以下地址需要代理才能访问。

- 'https://finance.yahoo.com/*

### 2.3.5.5 LOBSTER Tick 数据基本数据

```text
machine-learning-for-trading-master/
  │
  └───02_market_and_fundamental_data/
      │
      └───03_data_providers/
          │
          └───03_lobster_itch_data.ipynb
```

#### 示例

运行前需要先 [下载](https://lobsterdata.com/info/DataSamples.php) AMZN Level 10 示例数据。解压到
“D:\src\python3\machine-learning-for-trading-master\02_market_and_fundamental_data\03_data_providers\data” 即可

---

### 2.3.5.6 Quandl

```text
machine-learning-for-trading-master/
  │
  └───02_market_and_fundamental_data/
      │
      └───03_data_providers/
          │
          └───04_quandl_demo.ipynb
```

#### 示例

笔记本03_quandl_demo显示了Quandl如何使用非常简单的API来提供其免费和高级数据。

可正常运行。

### 2.3.5.7 Zipline 和 Qantopian

```text
machine-learning-for-trading-master/
  │
  └───02_market_and_fundamental_data/
      │
      └───03_data_providers/
          │
          └───05_zipline_data_demo.ipynb
```

#### 示例

笔记本[包含笔记本zipline_data简要介绍了 zipline 我们将在本书中使用的回溯测试库，并展示了如何在进行回溯测试时访问股票价格数据。

Qantopian 的免费数据服务已停止。

### 2.4 如何使用基本数据

基本数据与确定证券价值的经济动因有关。数据的性质取决于资产类别：我们将重点关注美国的股票基本面，因为美国的数据更易于访问。全球约有13,000多家上市公司，它们产生200万页的年度报告和30,000多个小时的收益电话。在算法交易中，基本数据和根据该数据设计的功能可用于直接导出交易信号，例如作为价值指标，并且是预测模型（包括机器学习模型）的基本输入。

#### 2.4.1 财务报表数据

证券交易委员会（SEC）要求美国发行人（即上市公司和证券，包括共同基金）除了各种形式外，还必须提交三份季度财务报表（表格10-Q）和一份年度报告（表格10-K）。其他监管备案要求。
自1990年代初以来，SEC通过其电子数据收集，分析和检索（EDGAR）系统提供了这些文件。它们构成了对股权和其他证券（例如公司信贷）进行基础分析的主要数据源，其价值取决于发行人的业务前景和财务状况。

### 2.4.2 使用XBRL标记进行自动处理

自从SEC引入XBRL （一种用于电子表示和交换业务报告的免费，开放和全球性标准）以来，对监管文件的自动分析变得更加容易。XBRL基于XML。它依靠分类法来定义报告元素的含义，并映射到在报告的电子版本中突出显示相应信息的标签。一种这样的分类法代表了美国公认会计原则（GAAP）。

SEC于2005年针对会计丑闻引入了自愿XBRL备案，此后自2009年以来对所有备案人都要求采用这种格式，并继续将强制性覆盖面扩大到其他监管备案。SEC维护着一个网站，该网站列出了影响不同文件内容的当前分类法，并可用于提取特定项目。

有几种途径可以跟踪和访问向SEC报告的基本数据：

- 对于股票和公司信贷，它包括公司财务以及行业和经济范围的数据。
- 对于政府债券，它包括国际宏观数据和外汇。
- 对于商品，它包括特定于资产的供求决定因子，例如农作物的天气数据。
- 作为EDGAR公共传播服务（PDS）的一部分，可以接受收费的电子格式提要。
- SEC每10分钟更新一次RSS提要，其中列出了结构化的披露提交。
- 有公共索引文件，可通过FTP检索所有文件以进行自动处理。
- 财务报表（和注释）数据集包含来自所有财务报表和随附注释的已解析XBRL数据。

SEC还通过SEC.gov发布了包含EDGAR档案的互联网搜索流量的日志文件，尽管有六个月的延迟。

### 2.4.3 建立基本数据时间序列

在数据的范围财务报表及附注数据集，包括这些声明从主要财务报表数字数据（资产负债表，利润表，现金流量表，股东权益变动表和综合收益）和脚注。该数据最早于2009年可用。

#### 示例

可正常运行。

### 2.3.5.7 Zipline 和 Qantopian

```text
machine-learning-for-trading-master/
  │
  └───02_market_and_fundamental_data/
      │
      └───04_sec_edgar/
          │
          └───edgar_xbrl.ipynb
```

本示例用于下载和解析XBRL格式的EDGAR数据，并通过结合财务报表和价格数据来创建诸如市盈率之类的基本指标。

直接运行需要 90GB 磁盘空间。大约1小时左右。

---

### 2.5 Pandas 高效存储数据
笔记本storage_benchmark比较主要存储格式的效率和性能。特别是，它比较：

- CSV：逗号分隔的标准纯文本文件格式。
- HDF5：分层数据格式，最初是在国家超级计算机中心开发的，是一种快速且可扩展的数字数据存储格式，可通过PyTables库在Pandas 中使用。
- Parquet：二进制，列式存储格式，是Apache Hadoop生态系统的一部分，可提供有效的数据压缩和编码，由Cloudera和Twitter开发。在Pandas 的原始作者韦斯·麦金尼（Wes McKinney）领导的pyarrow库中，Pandas 可以使用它。

它使用 DataFrame 可以配置为包含数字数据或文本数据，或同时包含两者的测试。对于HDF5库，我们同时测试了固定格式和表格格式。表格式允许查询，并且可以附加到表格式中。

## 2.5.1 测试结果

简而言之，结果是：

- 对于纯数字数据，HDF5格式性能最佳，并且表格式也与CSV共享最小的内存占用空间，为1.6 GB。固定格式使用两倍的空间，而Parquet格式使用2 GB。
- 对于数字和文本数据的混合，Parquet显着更快，并且HDF5相对于CSV利用其优势进行读取。

```text
machine-learning-for-trading-master/
  │
  └───02_market_and_fundamental_data/
      │
      └───05_storage_benchmark/
          │
          └───storage_benchmark.ipynb
```

说明了如何使用 %%timeit Cell Magic来配置，测试和收集时序。同时演示了使用这些存储格式所需的相关pandas命令的用法。

## 第3章 替代交易数据

本章所谓的 "替代交易数据" 主要指网络爬取的数据。

注意：与所有其他示例不同，本章代码编写为在主机上运行，而不是使用 Docker 映像，因为它依赖于浏览器。

因浏览器版本和对应selenium版本更新较快，变化较大，本章示例代码不具备调试价值。主要学习思路。

### 替代数据革命

对于算法交易，如果新数据源提供对传统来源无法获得的信息的访问，或者更快地提供访问，则它们将提供信息优势。随着全球趋势，投资行业正在迅速从市场和基本面数据扩展到其他来源，通过信息优势获得阿尔法。到3年，数据、技术能力和相关人才的年度支出预计将从目前的12亿美元每年增加8.2020%。

如今，投资者可以实时访问宏观或公司特定的数据，这些数据历来只能以低得多的频率获得。新数据源的用例包括：

- 一组具有代表性的商品和服务的在线价格数据可用于衡量通货膨胀

- 商店访问或购买的次数允许实时估计公司或行业特定的销售或经济活动

- 卫星图像可以揭示农业产量，或矿山或石油钻井平台上的活动，然后才能在其他地方获得这些信息。

### 替代数据的来源

替代数据集由许多来源生成，但可以在高级别分类为主要由以下来源生成：

- 在社交媒体上发帖、评论产品或使用搜索引擎的个人
- 记录商业交易（尤其是信用卡付款）或作为中介捕获供应链活动的企业
- 除其他许多事项外，通过卫星或安全摄像头等图像或通过手机信号塔等运动模式捕获经济活动
- 随着新数据源的出现以及以前标记为“替代”的来源成为主流的一部分，替代数据的性质继续迅速演变。例如，波罗的海干散货指数（BDI）收集了数百家航运公司的数据，以估算干散货船的供需情况，现在可以在彭博码头获得。

替代数据源在关键方面有所不同，这些方面决定了它们对算法交易策略的价值或信号内容。

### 评估替代数据集的标准

替代数据的最终目标是在竞争性搜索中提供信息优势，以寻找产生阿尔法的交易信号，即正的、不相关的投资回报。在实践中，从替代数据集中提取的信号可以独立使用，也可以与其他信号结合使用，作为定量策略的一部分。

此子文件夹01_opentable包含脚本opentable_selenium，用于使用 Scrapy 和 Selenium 抓取 OpenTable 数据。

子文件夹02_earnings_calls包含脚本sa_selenium，用于从 SeekingAlpha 网站抓取收益电话会议记录。

---
免责声明：

本文档的表达为个人观点；彼以往、现在或未来并无就本文档所提供的具体建议或所表迖的观点直接或间接收取任何报酬。通过本文档引证及推论的结果并不构成本人对投资的任何具体意见。
