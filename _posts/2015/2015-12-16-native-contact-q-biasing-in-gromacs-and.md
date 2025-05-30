---
layout: post
title: Native contact (Q) biasing in GROMACS and plumed2
date: '2015-12-16T11:21:00.000-08:00'
author: jandom
tags: 
modified_time: '2015-12-17T19:54:53.616-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-6260596837281565664
blogger_orig_url: https://jandomanski.blogspot.com/2015/12/native-contact-q-biasing-in-gromacs-and.html
---

Fraction of native contacts is a pretty darn good coordinate for looking at protein folding, definitely when it comes to small proteins. Just have a look:

http://www.pnas.org/content/110/44/17874.abstract

Fraction of native contacts can be used to analyze long, unbiased MD runs -- like those from DESRES -- or in biasing simulations. But how does it fare when used in biasing? Well I don't know -- but you can now find out by yourself! Either in umbrella sampling or metadynamics -- or a method of your choice that doesn't use energy as your collective variable.

Here, I'm happy to report that I incorporated an implementation of native contact CV into plumed2 -- an enhanced sampling package that can be used with a number of popular MD simulation engines. The pull request is now closed https://github.com/plumed/plumed2/pull/177 and it's likely that the next release of plumed2 will include this.

"Tutorial" is a regression test in plumed2 sources `regtest/basic/rt29/` which shows a simple plumed input for a trp-cage protein.

Credits: Robert Best for writing the original gromacs-only implementation, Wenwei Zheng for the draft plumed2 implementation, Giovanni Bussi for code review and feedback.

**Edited** clarified some points, cleaned-up, post still needs a re-structure