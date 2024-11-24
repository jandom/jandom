---
layout: post
title: 'Feeling the burn: DPPC lipid CHARMM36 with gromacs'
date: '2015-11-17T07:27:00.000-08:00'
author: jandom
tags: 
modified_time: '2015-11-17T07:27:02.275-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-5672744347438204076
blogger_orig_url: https://jandomanski.blogspot.com/2015/11/feeling-burn-dppc-lipid-charmm36-with.html
---

The "oh shit" moment came when I started running a short DPPC run on trusty gromacs 4.6 with CHARMM36. The bilayer switched from liquid crystalline to gel phase and I knew I was in trouble. Played with the system size, increased the temperature from 323 to 333K -- no luck. Turns out there is some pretty strong sensitivity of the lipid properties to electrostatics treatment in gromacs.

The key paper is probably [Molecular Dynamics Simulations of Phosphatidylcholine Membranes: A Comparative Force Field Study](http://pubs.acs.org/doi/full/10.1021/ct3003157) (paywall) which demonstrates the sensitivity to electrostatic parameters and proposes some solutions.

The gromacs authors have suggested their own parameters for running [CHARMM with gromacs](http://www.gromacs.org/Documentation/Terminology/Force_Fields/CHARMM). 

The topic has attracted a lot of attention on the gromacs mailing list, two useful threads are below:
- https://mailman-1.sys.kth.se/pipermail/gromacs.org_gmx-users/2013-August/083370.html
- https://www.mail-archive.com/gmx-users@gromacs.org/msg64050.html