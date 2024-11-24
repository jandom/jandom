---
layout: post
title: Compile plumed 2 with gromacs 4.6 on ubuntu 14.04
date: '2015-02-05T11:47:00.002-08:00'
author: jandom
tags: 
modified_time: '2015-07-16T07:42:30.719-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-634364746602876682
blogger_orig_url: https://jandomanski.blogspot.com/2015/02/complie-plumed-2-with-gromacs-46-on.html
---

Should be simple right? Just you wait... Because I do it for the 5th time now, this will deserve a blog entry, if anything for my own sanity.

```bash
sudo apt-get install libblas-dev liblapack-dev
tar xvf plumed-2.1.1.tgz
cd plumed-2.1.1
export PLUMED_PREFIX=~/Programs/plumed/2.1.1/
./configure.sh << EOF
1
EOF
make
make install
```

[**Edit**] For OpenMPI plumed installation do the following:

```bash
sudo apt-get install libcr-dev mpich2 mpich2-doc

./configure.sh << EOF
3
EOF

sed -i  s#'-lblas'#'-lblas -L/usr/lib/openmpi/lib'#g Makefile.conf
sed -i  s#'PLUMED_INCLUDE)'#'PLUMED_INCLUDE)  -I/usr/lib/openmpi/include'#g Makefile.conf
```

The default ./configure command doesn't do the job for me. So let's ignore that for now.

```bash
cmake .. -DCMAKE_INSTALL_PREFIX=/path/ -DGMX_MPI=OFF -DGMX_GPU=OFF
make
make install
```

And then if all goes well:

```bash
source /path/
mdrun -h 2>&1 >/dev/null | grep plumed
-plumed  plumed.dat  Input, Opt.  Generic data file
```

Sadly, this is just a serial version of plumed but that should be enough for some local checks.