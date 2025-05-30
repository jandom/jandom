---
layout: post
title: Electorostatics artifacs in water simulations
date: '2012-08-25T19:00:00.001-07:00'
author: jandom
tags: 
modified_time: '2012-12-07T20:20:36.833-08:00'
thumbnail: http://4.bp.blogspot.com/-AHFLUwa0j6I/UDmB5VOTkdI/AAAAAAAAANQ/YB4jfGKpFTQ/s72-c/plot.png
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-856808768448300368
blogger_orig_url: https://jandomanski.blogspot.com/2012/08/electorostatics-artifacs-in-water.html
---

The major computational cost in MD simulation is the calculation of non-bonded interactions between particles, especially the electrostatic ("minus-plus") interactions.

There are several ways in which these interactions can be computed. The simplest one is a distance cut-off: only particles within *x* of each other will interact. More sophisticated methods, compute a grid onto which the particle charges are discretized for the whole system; the short-range interactions are computed within a cut-off, while the long-range interactions are computed to every grid point. 

The choice is important: simple models can give advantage in terms of computation speed, while more accurate models can save one from various artifacts.
A prominent example of which, is the artificial ordering of water molecules in a simulation, which occurs when using the simple cut-off scheme for electrostatics (not shown).

Figure 1, shows that if one inspects two properties of water in simulations generated using the different methods for calculating electrostatic interactions, it's clear that 1) none of them matches experiment (TIP3P is just another model), 2) there is a variation in the actual computed quantity, 3) there is variation in performance.

![Plot of water properties](http://4.bp.blogspot.com/-AHFLUwa0j6I/UDmB5VOTkdI/AAAAAAAAANQ/YB4jfGKpFTQ/s400/plot.png)

Figure 1: Changes in simulation performance, computed density and diffusion coefficient of water when using different electrostatics calculation methods.

References:
* A severe artifact in simulation of liquid water using a long cut-off length: Appearance of a strange layer structure, Yoshiteru Yonetani, http://www.sciencedirect.com/science/article/pii/S000926140500271X

P.S. The results of papers on the electrostatic artifacts in water simulations when using cut-off methods (published more than 5 years ago) could be reproduced over a weekend with a laptop in 2012.