---
layout: post
title: Machine Learning for Algorithmic Trading 学习小记（一）
date: 2023-01-25
description: 在学习《机器学习与算法交易（第二版）》的过程中，发现一些琐碎的技术细节，特记录如下。本文主要记录笔者使用 Docker Desktop 在 Windows 环境下的安装过程。
---

## 引言

《机器学习与算法交易（第二版）》（[Machine Learning for Algorithmic Trading - 2nd Edition](https://www.amazon.com/Machine-Learning-Algorithmic-Trading-alternative/dp/1839217715?pf_rd_r=GZH2XZ35GB3BET09PCCA&pf_rd_p=c5b6893a-24f2-4a59-9d4b-aff5065c90ec&pd_rd_r=91a679c7-f069-4a6e-bdbb-a2b3f548f0c8&pd_rd_w=2B0Q0&pd_rd_wg=GMY5S&ref_=pd_gw_ci_mcx_mr_hp_d)）。第一版2018年12月出版，共计503页。第二版2020年7月出版，有1274页。主要增加了以下内容：

1. 8 The ML4T Workflow – From Model to Strategy Backtesting 介绍策略的回测方法；
2. 100多种不同的alpha因子；

书中[算例](https://github.com/PacktPublishing/Machine-Learning-for-Algorithmic-Trading-Second-Edition)所使用的框架是在 [Zipline原版代码](https://github.com/quantopian/zipline) 基础上修改过的版本。

Zipline是Quantopian的官方投研框架。Quantopian官方已经在2020年10月在其官方网站上发布 [公告](https://link.zhihu.com/?target=https%3A//www.quantopian.com/posts/quantopians-community-services-are-closing)，下架了Zipline，Alphalens，Pyfolio，Empyrical，Trading Calendars等服务。这些项目仍在GitHub提供，可以实现本地环境的搭建。

为了使zipline适配中国A股，kanghua309 针对 [zipline 1.0.2 (python2.7)](http://github.com/kanghua309/zipline/archive/astock.zip)版本和 [zipline 1.1.1 (python 3.5)](http://github.com/kanghua309/zipline/archive/astock3.zip)版本，进行了改造。笔者没有测试过。Zipline的架构和数据处理思路在今天仍有参考价值。

## 安装

为了简单，笔者使用Windows10(21H2)结合docker-desktop和wsl2搭建测试环境。测试环境的系统版本信息如下:

```sh
> systeminfo
```

```txt
OS Name:                   Microsoft Windows 10 IoT 企业版 LTSC
OS Version:                10.0.19044 N/A Build 19044
……
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 140 Stepping 1 GenuineIntel ~2803 Mhz
……
Total Physical Memory:     32,466 MB
……
```

### 安装wsl2

Windows10的内部版本号必须高于18362或18363，次要内部版本号需要高于.1049。

#### 启用wsl功能

以管理员身份打开 PowerShell（右键“开始”菜单 >“Windows PowerShell（管理员）”），然后输入以下命令，

```sh
> dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```
  
#### 启用虚拟机功能

安装 WSL 2 之前，必须启用“虚拟机平台”可选功能。 计算机需要虚拟化功能才能使用此功能。

以管理员身份打开 PowerShell 并运行，

```sh
> dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

重新启动系统

#### Linux内核更新

下载 [Linux 内核更新包](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)

运行上一步中下载的更新包。 （双击以运行 - 系统将提示你提供提升的权限，选择“是”以批准此安装。）

重新启动系统。

#### 将 WSL 2 设置为默认版本

将 WSL 2 设置为默认版本

```sh
> wsl --set-default-version 2
```

#### 下载ubuntu20.04安装包

进入 [Downloading distributions](https://docs.microsoft.com/en-us/windows/wsl/install-manual) 选择合适的系统安装包。

这里选择ubuntu20.04。

因为笔者的C盘只有120GB，所以下载到D盘wsl目录下。将下载的文件解压后，运行ubuntu2004.exe 完成安装wsl并设置用户名和密码。

### 安装Docker

下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
升级到最新版本

```sh
> docker --version
Docker version 20.10.22, build 3a2c30b
```

### 迁移数据（可选项）

因为笔者的C盘只有120GB，所以笔者把docker的镜像也移到D盘docker目录下。基于WSL2的版本的docker desktop在安装的时候创建两个wsl子系统。

```sh
 > wsl -l -v --all  
  NAME                   STATE           VERSION
* docker-desktop         Running         2
  docker-desktop-data    Running         2 
  Ubuntu-20.04           Running         2
```

可以看到docker-desktop用于存放程序文件，docker-desktop-data用于存放docker镜像，这两个wsl子系统都是默认放在系统盘的。

#### 导出wsl子系统镜像

```sh

> wsl --export docker-desktop D:\docker\wsl\docker-desktop.tar
  wsl --export docker-desktop-data D:\docker\wsl\docker-desktop-data.tar
```

#### 删除现有的wsl子系统

```sh

> wsl --unregister docker-desktop
  wsl --unregister docker-desktop-data
```

#### 导入wsl子系统

```sh

> wsl --import docker-desktop D:\docker\wsl D:\docker\wsl\docker-desktop.tar --version 2
  wsl --import docker-desktop-data D:\docker\date D:\docker\wsl\docker-desktop-data.tar --version 2

```

### 获取QUANDL API密钥

要下载在整本书中用作几个示例的美国纳斯达克股票数据，需要在 [纳斯达克](https://data.nasdaq.com/) 注册一个个人帐户。API密钥会显示在 "ACCOUNT SETTING" -> "Your profile" -> "YOUR API KEY"中。

#### 获取书籍源码

笔者的源码存放位置是 D:/src/python3/machine-learning-for-trading-master

```sh
> cd D:/src/python3
> git clone https://github.com/PacktPublishing/Machine-Learning-for-Algorithmic-Trading-Second-Edition
❯ mv Machine-Learning-for-Algorithmic-Trading-Second-Edition machine-learning-for-trading-master

```

#### 创建并运行docker

```sh
> docker run -it -v D:/src/python3/machine-learning-for-trading-master:/home/packt/ml4t -p 8888:8888 -e QUANDL_API_KEY=<YOUR API KEY> --name ml4t appliedai/packt:latest bash
```

第一次运行要拉取大约 3GB 的镜像。

## 运行

启动。

```sh
> docker start -a -i ml4t
```

镜像中的jupyter lab并不会自动启动，需要手工运行。

```sh
(base) packt@8b57b786cab8:~/ml4t$ jupyter lab --ip 0.0.0.0 --no-browser --allow-root&
```

根据提示的地址（地址需要包含token）用浏览器访问。

```text
http://127.0.0.1:8888/lab?token=2ae7a039d2f487c0cf3abafac511fda71c096ce13caa0f4a
```

就可以开始下载数据进行投研了。

---
免责声明：

本文档的表达为个人观点；彼以往、现在或未来并无就本文档所提供的具体建议或所表迖的观点直接或间接收取任何报酬。通过本文档引证及推论的结果并不构成本人对投资的任何具体意见。
