---
layout: post
title: Make a molecule dissapear in gromacs
date: '2014-08-07T15:56:00.001-07:00'
author: jandom
tags: 
modified_time: '2014-08-07T15:56:34.338-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-4253798050663009006
blogger_orig_url: https://jandomanski.blogspot.com/2014/08/make-molecule-dissapear-in-gromacs.html
---

This is a free energy perturbation basics -- making molecules appear and disappear and using that to estimate free energies.

This code can also be used for other, imaginative purposes. To make a molecule 'Ligand' disappear, use the following

```
grompp.mdp
...
integrator = ld
dt = 0.001
nsteps = 10000
...
; FREE ENERGY
free_energy          = yes
init_lambda          = 0.00
delta_lambda         = 1e-4
sc-alpha             = 1.5 #
sc-power             = 1.0
couple-moltype       = Pore
couple-lambda0       = vdw-q
couple-lambda1       = none
```

Now let's break it down:
- `free_energy = yes` is an on-switch for this feature of gromacs
- `init_lambda = 0.0` defines how invisible is the molecule at the start of the run, a value of 0 indicates that it's fully visible
- `delta_lambda = 1e-4` will define by how much the molecule is disappeared at every step of the simulation. Here this has to match the nsteps value - after 10000 steps the molecule will be fully gone.
- `couple-lambda0 = vdw-q` shows that at the start of the simulation both the van der Waals (vdw) and charged (q) interactions are turned on
- `couple-lambda1 = none` will make that both the vdw and q are turned off at the end of the run.