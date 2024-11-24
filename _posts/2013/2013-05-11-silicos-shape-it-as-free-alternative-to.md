---
layout: post
title: Silicos shape-it as a free alternative to OpenEye ROCS?
date: '2013-05-11T15:49:00.001-07:00'
author: jandom
tags: 
modified_time: '2013-05-11T15:49:04.801-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-7821359318583528352
blogger_orig_url: https://jandomanski.blogspot.com/2013/05/silicos-shape-it-as-free-alternative-to.html
---

Silicos provides shape-it - a C++ program for doing shape matching using gaussian volume.

To compile under Ubuntu 12.04:

```bash
sudo apt-get install libopenbabel-dev libopenbabel4 openbabel

export BABEL_INCLUDEDIR=/usr/include/openbabel-2.0/openbabel
export BABEL_LIBDIR=/usr/lib/openbabel/2.3.1/
export BABEL_DATADIR=/usr/share/openbabel/openbabel/2.3.1/
```