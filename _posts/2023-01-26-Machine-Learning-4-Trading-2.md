---
layout: post
title: Machine Learning for Algorithmic Trading 学习小记（二）
date: 2023-01-26
description: 在学习《机器学习与算法交易（第二版）》的过程中，发现一些琐碎的技术细节，特记录如下。本文主要记录笔者在学习第1章和第2章中遇到的问题。
---

## 引言

前文 [Machine Learning for Algorithmic Trading 学习小记（一）](https://rossea.github.io/2023-01-25-Machine-Learning-4-Trading-1/)介绍了笔者安装本书算例的过程。本文主要记录笔者在学习第1章和第2章中遇到的问题。

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

是可以在Ipython编译器里直接使用，功能是可以内嵌绘图，并且可以省略掉plt.show()这一步。要注释掉才能执行，否则会报错：

```text
UsageError: Line magic function `%` not found.
```

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
免责声明：

本文档的表达为个人观点；彼以往、现在或未来并无就本文档所提供的具体建议或所表迖的观点直接或间接收取任何报酬。通过本文档引证及推论的结果并不构成本人对投资的任何具体意见。
