---
layout: post
title: Benchmarking molecular fingerprints
date: '2013-04-13T14:07:00.000-07:00'
author: jandom
tags: 
modified_time: '2013-04-20T06:27:38.978-07:00'
thumbnail: http://4.bp.blogspot.com/-E_zyvxBjRfM/UXG3GzidZzI/AAAAAAAAATc/bb-qIlDu9iI/s72-c/plot.png
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-8275189925009270396
blogger_orig_url: https://jandomanski.blogspot.com/2013/04/benchmarking-molecular-fingerprints.html
---

Inspired by Anthony Nicholls's paper "So what do we know and when do we know it?", I've started measuring the performance of available molecular fingerprint methods in discriminating between active and inactive compounds. Here are some preliminary results.

The left side of the first figure summarizes published results in the field; the right side of the figure reproduces the known performance for MACCS fingerprint and adds-in a bunch of different fingerprints. Overall they're not that different with ECFP4 perhaps being the best (highest median and narrow 1st-Quartile-3rd-Quartile range).

![Fingerprint Performance Plot](http://4.bp.blogspot.com/-E_zyvxBjRfM/UXG3GzidZzI/AAAAAAAAATc/bb-qIlDu9iI/s640/plot.png)

![Fingerprint Correlation Plot](http://1.bp.blogspot.com/-Da1Mlc-alEU/UXG3IoXJ1aI/AAAAAAAAATk/gfYSN0xUdEo/s400/correlation.png)

All methods were tested on the same ~100 protein targets. The second figure tries to explain how the performance of various fingerprints may be correlated with each other across this set of 100 targets.