---
layout: post
title: Gromacs 5.x on TITAN Cray machine
date: '2016-06-03T08:28:00.000-07:00'
author: jandom
tags: 
modified_time: '2016-06-08T08:42:24.765-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1189317326607145637
blogger_orig_url: https://jandomanski.blogspot.com/2016/06/gromacs-5x-on-titan-cray-machine.html
---

For compilation instructions checkout [this link](https://groups.google.com/d/msg/plumed-users/Tx29XNNRq8o/xeAu7RNaBAAJ).

For a while, we've been preparing to run some simulations on this machine, hosted by Oak Ridge National Lab. Every cluster is a bit different, and that's definitely true for [TITAN](https://en.wikipedia.org/wiki/Titan_(supercomputer)): each box has 16 CPUs (arranged in 2 "numas") and 1 K20 NVIDIA GPU. There is no usual MPI or Infiniband; instead, there's some Cray-specific system.

Here is an example submission script for a non-replica exchange simulation:

```bash
#!/bin/bash
module add gromacs/5.0.2

cd $PBS_O_WORKDIR

# important - allow the GPU to be shared between MPI ranks
export CRAY_CUDA_MPS=1

mpirun=`which aprun`
application=`which mdrun_mpi`
options="-v -maxh 0.2 -s tpr/topol0.tpr"

gpu_id=000000000000 # only 12, discard last '0000'

$mpirun -n 32 -N 16 $application -gpu_id $gpu_id $options
```

Submit with:

```bash
$ qsub -l walltime=1:00:00 -l nodes=2 submit.sh
```

Requesting 2 boxes, start 32 MPI processes/ranks, 16 per box. Implicitly, this will result in 1 OpenMP thread per 1 MPI process. From single-node simulations, let me explain this choice:

```plaintext
1,16,2,5.346 ns/day
1,16,4,10.590 ns/day
1,16,8,17.402 ns/day
1,16,16,33.137 ns/day
```

The first column is nodes=1, the second column is -n 16 MPI ranks requested, and the third column is -N MPI ranks per node. At -N 2, we get 8 OpenMP threads per 1 MPI process, which is known to be non-ideal.


Keeping -N 16 constant, let's add more nodes:


```plaintext
#setup,performance
nodes-1__n-16_N-16,33.137
nodes-2__n-32_N-16,49.975
nodes-4__n-64_N-16,78.244
```