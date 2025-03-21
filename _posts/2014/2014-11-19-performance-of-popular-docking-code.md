---
layout: post
title: Performance of a popular docking code
date: '2014-11-19T04:47:00.001-08:00'
author: jandom
tags: 
modified_time: '2014-11-19T04:47:29.881-08:00'
thumbnail: http://4.bp.blogspot.com/-g68GnUSG0Jw/VGyPiewdROI/AAAAAAAAFFg/6dTCY4GifGU/s72-c/plot.png
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1082155352957824346
blogger_orig_url: https://jandomanski.blogspot.com/2014/11/performance-of-popular-docking-code.html
---

This post is a quick note on a performance of a commercial docking code, as measured across the entire DUDE dataset. For around a 100 protein targets, the code is supposed to rank active compounds higher than decoys compounds -- separate poppy seeds from sand if you like.

Let me start by saying that I'm pretty impressed with what I've seen. Starting this side-project, I assumed that any docking code can be expected to have an AUC of around 0.6-0.7 measured on a standard benchmarking set (such as DUDE). I think that's largely true of free codes such as Autodock vina or rdock. But here we're looking at a piece of code from a major commercial vendor and it performs beyond my expectation.

I'm not disclosing the name of the code, since there may have been something in the academic license that prevents such benchmarking studies from being published (a "gag order" effectively, in case somebody is measuring the code "incorrectly").

![Performance Plot](http://4.bp.blogspot.com/-g68GnUSG0Jw/VGyPiewdROI/AAAAAAAAFFg/6dTCY4GifGU/s1600/plot.png)

AUC is estimated for each target by using only 10% of the decoys available in the DUDE dataset and all of the actives. This increases the error bar per-target but I'm more interested in AUC performance across many targets than any particular one.

The error bars on the boxplots are estimated from 100 randomly selected subslices, half the size of the ranked list of actives and decoys. On the right, boxplots of median target AUCs are plotted for the entire DUDE dataset, the older DUD39 subslice and the non-DUD39 targets. The aim of this last plot is to check if on older, more familiar dataset, DUD39, outperforms something more modern (which doesn't appear to be the case here).