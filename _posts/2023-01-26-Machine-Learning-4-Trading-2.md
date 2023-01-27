---
layout: post
title: Machine Learning for Algorithmic Trading 学习小记 （二）
date: 2023-01-25
description: 在学习《机器学习与算法交易（第二版）》的过程中，发现一些琐碎的技术细节，特记录如下。本文主要记录笔者在学习第。
---

## 引言

前文 [Machine Learning for Algorithmic Trading 学习小记（一）](./2023-01-25-Machine-Learning-4-Trading-1.md)介绍了笔者安装本书算例的过程。

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

欲运行本示例，首先要[下载NASDAQ100 分钟线交易数据（大小4.2GB）](https://algoseek-public.s3.amazonaws.com/nasdaq100-1min.zip)。

并解压到“D:\src\python3\machine-learning-for-trading-master\data\nasdaq100\1min_taq\”
得到 “2015”、“2016”、“2017”三个文件夹。

```python
% matplotlib inline
```

是可以在Ipython编译器里直接使用，功能是可以内嵌绘图，并且可以省略掉plt.show()这一步。要注释掉才能执行，否则会报错：

```text
UsageError: Line magic function `%` not found.
```

---
免责声明：

本文档的表达为个人观点；彼以往、现在或未来并无就本文档所提供的具体建议或所表迖的观点直接或间接收取任何报酬。通过本文档引证及推论的结果并不构成本人对投资的任何具体意见。
