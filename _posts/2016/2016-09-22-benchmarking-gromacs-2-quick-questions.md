---
layout: post
title: "Benchmarking GROMACS – 2 Quick Questions"
date: '2016-09-22T14:44:00.003-07:00'
author: jandom
tags: []
modified_time: '2016-09-25T02:00:59.636-07:00'
thumbnail: https://4.bp.blogspot.com/-4sQ4eiNaVig/V-RO3DVl2EI/AAAAAAAAHqQ/ACcrnGHPdy88IEpj-_l69hNNxhoaOfHJgCK4B/s72-c/plot.png
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1695023872077238121
blogger_orig_url: https://jandomanski.blogspot.com/2016/09/benchmarking-gromacs-2-quick-questions.html
---

With GROMACS, there are all these things you have to do when benchmarking; it's a bit of a mess. One question I always wondered about was: well, how long do you have to run to get a reliable performance number in ns/day? 1e0 MD step is certainly too short, but 1e7 steps seem unnecessarily excessive.

The second question was: could one get away with measuring benchmarking speed using just a box of water? Currently, people use systems like DHPR or APOA1 (protein in water) to assess performance, but those are arbitrary. A box of water has a dramatically simpler topology than a protein, but maybe that doesn’t matter?

One thing this assesses is the absolute performance of GROMACS. The ns/day results below are low because I used an old workstation, without GPU acceleration.

[![plot](https://4.bp.blogspot.com/-4sQ4eiNaVig/V-RO3DVl2EI/AAAAAAAAHqQ/ACcrnGHPdy88IEpj-_l69hNNxhoaOfHJgCK4B/s640/plot.png)](http://4.bp.blogspot.com/-4sQ4eiNaVig/V-RO3DVl2EI/AAAAAAAAHqQ/ACcrnGHPdy88IEpj-_l69hNNxhoaOfHJgCK4B/s1600/plot.png)

The answers are pretty simple: 1e4–1e5 steps are required to 'converge' the performance estimate for my test system. Also, a water box of very similar dimensions (and number of particles) but without the protein runs a little faster. The effect is not huge—around 20-30%—so it could easily be used as a meaningful benchmark, though maybe I’m missing something.

The simplicity of the water box benchmark (where the size of the box can be varied) is pretty cool. In my mind, it totally offsets the intellectually infertile discussion about "oh, which protein—big or small—to choose to show that my favorite code is better."
