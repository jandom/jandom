---
layout: post
title: "Example slurm cluster on your laptop (multiple VMs via vagrant)"
date: '2016-11-06T13:41:00.002-08:00'
author: jandom
tags: []
modified_time: '2016-12-05T06:09:41.798-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-6305777439038617277
blogger_orig_url: https://jandomanski.blogspot.com/2016/11/experimental-slurm-cluster-on-vagrant.html
---

To anybody who's considering a switch to modern queuing systems, like slurm, this will be a useful guide. Rather than doing a roll out on production nodes, we'll try things out in vagrant. This text assumes you have vagrant installed on your local machine (it's very easy).

The ultimate aim will be to set up 2 servers (worker nodes) and one master/controller, and run a simple job on them.

There are multiple great guides out there: most of them are out of date and won't work without some tweaking on Ubuntu 16.04 Xenial.

The entirety of the code is hosted at [https://github.com/jandom/gromacs-slurm-openmpi-vagrant](https://github.com/jandom/gromacs-slurm-openmpi-vagrant)

The README.md file will show you how to set it up, with checks on every step.

### References
- [https://mussolblog.wordpress.com/2013/07/17/setting-up-a-testing-slurm-cluster/](https://mussolblog.wordpress.com/2013/07/17/setting-up-a-testing-slurm-cluster/)
- [https://github.com/gabrieleiannetti/slurm_cluster_wiki/wiki/Installing-a-Slurm-Cluster](https://github.com/gabrieleiannetti/slurm_cluster_wiki/wiki/Installing-a-Slurm-Cluster)
- [http://philipwfowler.me/2016/04/14/how-to-setup-a-gramble/](http://philipwfowler.me/2016/04/14/how-to-setup-a-gramble/)
- [https://github.com/dakl/slurm-cluster-vagrant/blob/master/slurm_vagrant_cluster/slurm.conf](https://github.com/dakl/slurm-cluster-vagrant/blob/master/slurm_vagrant_cluster/slurm.conf)
- [https://github.com/mrahtz/mpi-vagrant](https://github.com/mrahtz/mpi-vagrant)
