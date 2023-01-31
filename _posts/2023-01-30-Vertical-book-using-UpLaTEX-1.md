---
layout: post
title: 使用 UpLaTEX 和中文字体的纵书实践（一）
date: 2023-01-30
math: true
description: 本文主要记录笔者使用 LaTEX 进行传统中文直书的尝试过程。
---

# 使用 $\UpLaTEX$ 和中文字体的纵书实践

目前基于 $\LaTEX$ 中文纵书（亦称直书）主要有几个实现方法

## 一、使用 $\XeLaTEX$

主要思路是，首先将汉字向右旋转90度：

```tex
\usepackage{fontspec}%設置字體下行
\setCJKmainfont[RawFeature={vertical:+vert},BoldFont=SourceHanSerifCN-Bold.otf]{SourceHanSerifCN-Regular.otf}%CJK主字體。字體支持並直排。
```

然后对页面进行旋转：

```tex
\usepackage{atbegshi}%打印.pdf時直放
\AtBeginShipout{\global\setbox\AtBeginShipoutBox\vbox{
        \special{pdf: put @thispage<</Rotate 90>>}
        \box\AtBeginShipoutBox}}
```

此种方法的优点是可以直接使用xelatex兼容的宏包，对于字体、字体fallback、页边距的设定配置相对比较简单。对于“割注”可以使用李清、张瑞熹的gezhu包实现。
此种方法的主要问题是对于文中不同位置的标点的压缩方式设定不够灵活。
另外，xelatex的宏包，比如fancy等，是基于横排设计的，设置页码、书名、章节名称等内容时，逻辑复杂。
因为此种方法局限性太大，笔者未进一步尝试。

## 二、使用 $\LuaLaTeX$

主要思路是使用LuaTeX-ja宏包实现中文直书。

2019年，Luigi Scarso等LuaTeX添加了HarfTEX,HarfBuzz库的支持，构建了另一个名为LuaHBTeX的分支（<https://www.tug.org/TUGboat/tb40-3/tb126devfund.pdf>  32.）。从texlive2020开始，将LuaHBTeX作为LuaLaTeX的默认引擎，提升了排版阿拉伯文、梵文等复杂文字的能力。
LuaTeX-ja是一个宏包，用于使用Lua(La)TeX排版日语文本。该项目的目标是为ASCII pTeX提供相同或好的排版方案，ASCII pTeX是传统的标准日本TeX引擎。

这种方法的优点是可以使用原生支持纵书的LuaTeX-ja、luatexja-fontspec、luatexja-otf等宏包，假话了字体的配置。
缺点是，第一次运行时，速度极慢。另外现在lualatex还不够成熟，在展开一些字符空间比较大的字体（比如sourcehans等）时，容易崩溃。
使用luatexja-otf宏包的UTF命令时，从UTF{F0000} 开始，取出的字形和实际码位不一致。

## 三、使用 $\UpLaTeX$

pLaTeX是LaTeX的日语版本，运行在pTeX上。 （带有日语排版扩展的TeX引擎）。（<https://github.com/texjporg/platex）>
使用ptex进行日文纵书的文献可以追溯到1990年（<https://tug.org/TUGboat/tb11-3/tb29hamano.pdf）>
upLaTeX 是 pLaTeX（日语 LaTeX）的 Unicode 版本， 它运行在upTeX（具有更好Unicode支持的pTeX变体）上。 （<https://github.com/texjporg/uplatex）>
一个简单的例子如下：

```tex
% !Tex=uplatex
% \documentclass[uplatex,tate]{jlreq}
\documentclass{utbook}

%%%%%%%%%%%%%%%%%%%%%%%%%%%字体设置开始
\DeclareFontFamily{JY2}{sourcehanrm}{}
\DeclareFontFamily{JT2}{sourcehanrm}{}
\DeclareFontShape{JY2}{sourcehanrm}{m}{n}{<->s*[0.962216]upschrm-h}{}
\DeclareFontShape{JT2}{sourcehanrm}{m}{n}{<->s*[0.962216]upschrm-v}{}

\AtBeginDvi{%
\special{pdf:mapline upstsl-h unicode SourceHanSerifSC-Regular.otf}
\special{pdf:mapline upstsl-v unicode SourceHanSerifSC-Regular.otf -w 1}
}
\DeclareRobustCommand\sourcehanrm{\kanjifamily{sourcehanrm}\selectfont}
%%%%%%%%%%%%%%%%%%%%%%%%%%%字体设置结束

% \usepackage{pxrubrica}%八登崇之的ruby包
% \rubysetup{g}% group

\usepackage[uplatex]{otf} 

\begin{document}
\sourcehanrm

00平面：開，灰。
\par
02平面：𠀀，𪘀。
\par
15平面：\UTF{F0000}，\UTF{F0001}。

\end{document}
```

运行:

```sh
❯ ptex2pdf test1 -u -l
```

从这个最简单的例子可以看出，02平面和15平面的汉字无法显示。

查看生成的dvi文件：

```sh
❯ updvitype test1.dvi
Font 50: upschrm-v scaled 962 (JFM tate)---loaded at size 630600 DVI units

❯ uplatex test1
❯ dvipdfmx -v  test1

><upschrm-v@9.59pt(TFM:upschrm-v)(VF:upschrm-v(TFM:upstsl-v)<upstsl-v@9.59pt
otf_cmap>> Creating Unicode charmap for font="SourceHanSerifSC-Regular.otf" layout="none"
(CID:SourceHanSerifSC-Regular)
pdf_font>> Type0 font "SourceHanSerifSC-Regular.otf" cmap_id=<unicode,2> font_id=<upstsl-v,2>.
>)(VF)>
```

可以看出，第一级虚拟字体为 upschrm-v ，二级虚拟字体为：upstsl-v
检查一下 jvf 的引用关系:

```sh
❯ jfmutil vfinfo upschrm-v.vf
0=upstsl-v
```

我们需要修改tfm和vf文件，使其通过映射到字符范围更广的字体。

因为UF0000、UF0001等PUA区的字符无法在电脑上直接显示。需要用 otf宏包使用\UTF或\CID命令直接调用。需要直接指定otf宏包对应的虚拟字体的映射关系，所以不在此处进行设置。

```sh
❯ cp -r $(kpsewhich upschrm-h.tfm) upschrm-sourcehanrm-h.tfm
❯ cp -r $(kpsewhich upschrm-v.tfm) upschrm-sourcehanrm-v.tfm
❯ cp -r $(kpsewhich upschrm-h.vf) upschrm-sourcehanrm-h.vf
❯ cp -r $(kpsewhich upschrm-v.vf) upschrm-sourcehanrm-v.vf
```

反编译upschrm-sourcehanrm-v.vf：

```sh
❯ jfmutil vf2zvp -u --lenient upschrm-sourcehanrm-v.vf
❯ jfmutil tfm2zpl -u --lenient upschrm-sourcehanrm-v.tfm
```

修改：upschrm-sourcehanrm-v.zvp

```text
(MAPFONT D 0
   (FONTNAME upstsl00-v)
   (FONTCHECKSUM O 0)
   (FONTAT R 1.0)
   (FONTDSIZE R 10.0)
   )
(MAPFONT D 6
   (FONTNAME upstsl02-v)
   (FONTCHECKSUM O 0)
   (FONTAT R 1.0)
   (FONTDSIZE R 10.0)
   )
……
(CHARACTER H 20000
   (MAP
      (SELECTFONT D 6)
      (SETCHAR )
      )
   )
(CHARACTER H 2FA1D
   (MAP
      (SELECTFONT D 6)
      (SETCHAR )
      )
   )
```

理论上讲，要对 “D 6” 组中的所有字符的unicode进行映射，这里针对示例，仅影射了 U20000、U2FA1D两个字。
接下来复制 upstsl-v

```sh
cp -r $(kpsewhich upstsl-h.tfm) upstsl00-h.tfm
cp -r $(kpsewhich upstsl-v.tfm) upstsl00-v.tfm

cp -r $(kpsewhich upstsl-h.tfm) upstsl02-h.tfm
cp -r $(kpsewhich upstsl-v.tfm) upstsl02-v.tfm
```

将代码修改为：

```tex
% !Tex=uplatex
% \documentclass[uplatex,tate]{jlreq}
\NeedsTeXFormat{pLaTeX2e}
\documentclass{utbook}

%%%%%%%%%%%%%%%%%%%%%%%%%%%字体设置开始
\DeclareFontFamily{JY2}{sourcehanrm}{}
\DeclareFontFamily{JT2}{sourcehanrm}{}
\DeclareFontShape{JY2}{sourcehanrm}{m}{n}{<->s*[0.962216]upschrm-sourcehanrm-h}{}
\DeclareFontShape{JT2}{sourcehanrm}{m}{n}{<->s*[0.962216]upschrm-sourcehanrm-v}{}

\AtBeginDvi{%
% \special{pdf:mapline upstsl00-h unicode SourceHanSerifSC-Regular.otf}
% \special{pdf:mapline upstsl00-v unicode SourceHanSerifSC-Regular.otf -w 1}

\special{pdf:mapline upstsl00-h unicode A-OTF-UDReiminSC-GB4-Regular.otf}
\special{pdf:mapline upstsl00-v unicode A-OTF-UDReiminSC-GB4-Regular.otf -w 1}

\special{pdf:mapline upstsl02-h unicode FZSJSONG02.TTF}
\special{pdf:mapline upstsl02-v unicode FZSJSONG02.TTF -w 1}

\special{pdf:mapline upstsl15-h unicode FZSJSONG15.TTF}
\special{pdf:mapline upstsl15-v unicode FZSJSONG15.TTF -w 1}

\special{pdf:mapline utfjmr--v  unicode FZSJSONG15.TTF -w 1}
}
\DeclareRobustCommand\sourcehanrm{\kanjifamily{sourcehanrm}\selectfont}
%%%%%%%%%%%%%%%%%%%%%%%%%%%字体设置结束

\usepackage{pxrubrica}%八登崇之的ruby包
\rubysetup{g}% group && head


\usepackage[uplatex]{otf} 
% \usepackage{bxbase} %使用UI命令调用字形

\begin{document}
\sourcehanrm

00平面：開，灰。
\par
02平面：𠀀，𪘀。
\par
15平面：\UTF{F0000}，\UTF{F0001}。

\end{document}
```

运行:

```sh
❯ ptex2pdf test1 -u -l
```

从这个最简单的例子可以看出，02平面和15平面的汉字的显示正常了。
