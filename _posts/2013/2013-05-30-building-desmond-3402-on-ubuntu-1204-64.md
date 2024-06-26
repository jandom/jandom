---
layout: post
title: Build Desmond-3.4.0.2 on Ubuntu 12.04 64-bit
date: '2013-05-30T17:51:00.000-07:00'
author: jandom
tags: 
modified_time: '2013-06-02T18:40:14.345-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1236982956578132482
blogger_orig_url: https://jandomanski.blogspot.com/2013/05/building-desmond-3402-on-ubuntu-1204-64.html
---

Desmond is probably the best MD engine out there, especially if you have an InfiniBand cluster. In addition to Desmond itself, it comes with a bunch of goodies such as viparr and msys, which are top-notch modeling tools. Desmond build problem is solved by using SCONS, a python-based build tool. To my surprise, the build process went super-smooth! That said, I don't have the necessary sequence of "sudo apt-get install packageA packageB". Please check out the `share/user-conf.sample.py` to get a feel for what Ubuntu packages you might need; frequently a '-dev' package will be needed. 

Here is what I did:

```bash
tar xvf Desmond-3.4.0.2.tar.gz
cd Desmond-3.4.0.2
scons --user-conf=build/user-conf.ubuntu1204_64.py -j 4 # -j 4 uses 4 cores to compile the code
```

The `build/user-conf.ubuntu1204_64.py` config is shown below  

```python
import sys
import os

if EXTRA_C_FLAGS == None: EXTRA_C_FLAGS = ''
if EXTRA_CC_FLAGS == None: EXTRA_CC_FLAGS = ''
if EXTRA_LINK_FLAGS == None: EXTRA_LINK_FLAGS = ''
if EXTRA_LIBS == None: EXTRA_LIBS = ''

if EXTRA_INCLUDE_PATH == None: EXTRA_INCLUDE_PATH = ''
if EXTRA_LIBRARY_PATH == None: EXTRA_LIBRARY_PATH = ''

# extra flags for desmond compatibility
EXTRA_C_FLAGS += ' -ffast-math -fno-unsafe-math-optimizations -fno-finite-math-only'
EXTRA_CC_FLAGS += ' -ffast-math -fno-unsafe-math-optimizations -fno-finite-math-only'

USE_BFD = False
THREADS = 'POSIX'

if USE_BFD:
    EXTRA_INCLUDE_PATH += ' /proj/desres/root/Linux/x86_64/binutils/2.20-09A/include'
    EXTRA_LIBRARY_PATH += ' /proj/desres/root/Linux/x86_64/binutils/2.20-09A/lib'
    EXTRA_LINK_FLAGS += ' -L/proj/desres/root/Linux/x86_64/binutils/2.20-09A/lib'
    EXTRA_LINK_FLAGS += ' -Wl,-rpath=/proj/desres/root/Linux/x86_64/binutils/2.20-09A/lib'

# Boost
boost_prefix =  '/usr/include/boost/'
EXTRA_INCLUDE_PATH += ' %s' % boost_prefix
EXTRA_LIBRARY_PATH += ' /usr/lib'

EXTRA_LINK_FLAGS += ' -Wl,-rpath,%s/lib' % boost_prefix
EXTRA_LIBS += ' -lboost_iostreams -lboost_program_options -lboost_thread'

# ANTLR, used in MSYS
EXTRA_INCLUDE_PATH += ' /usr/include'
EXTRA_LIBRARY_PATH += ' /usr/lib/x86_64-linux-gnu'
EXTRA_LINK_FLAGS   += ' -Wl,-rpath,/usr/lib/x86_64-linux-gnu'
EXTRA_LIBS += ' -lantlr3c'

# PCRE, used in MSYS
EXTRA_INCLUDE_PATH += ' /usr/include'
EXTRA_LIBRARY_PATH += ' /usr/lib'
EXTRA_LINK_FLAGS   += ' -Wl,-rpath,/usr/lib'
EXTRA_LIBS += ' -lpcre'

# LPSOLVE *can* be used in MSYS
# MSYS_WITHOUT_LPSOLVE = False
# EXTRA_INCLUDE_PATH += ' /proj/desres/root/Linux/x86_64/lp_solve/5.5.2.0-03A/include'
# EXTRA_LIBRARY_PATH += ' /proj/desres/root/Linux/x86_64/lp_solve/5.5.2.0-03A/lib'
# EXTRA_LINK_FLAGS   += ' -Wl,-rpath,/proj/desres/root/Linux/x86_64/lp_solve/5.5.2.0-03A/lib'
# EXTRA_LIBS += ' -llpsolve55'

# SQLITE - used in MSYS
EXTRA_INCLUDE_PATH += ' /usr/include'
EXTRA_LIBRARY_PATH += ' /usr/lib/x86_64-linux-gnu/'
EXTRA_LINK_FLAGS += ' -Wl,-rpath,/usr/lib/x86_64-linux-gnu/'
EXTRA_LIBS += ' -lsqlite3'

# MPI
WITH_MPI = 1
mpi_prefix = '/usr/lib/openmpi'
MPI_CPPFLAGS = "-I%s/include -pthread -DOMPI_SKIP_MPICXX" % mpi_prefix
MPI_LDFLAGS = "-L%s/lib -Wl,-rpath,%s/lib" % (mpi_prefix, mpi_prefix)

# If you want to use the DESRES RDMA library, enable WITH_INFINIBAND
# and give the location of the ofed 1.4.1 libraries.
WITH_INFINIBAND = 0
# JD: initially this was set to 1, since the compilation was on a lab workstation (not a cluster) I disabled it.
ofed_prefix = '/proj/desres/root/Linux/x86_64/ofed-lib/1.4.1-03'
IB_CPPFLAGS = "-I%s/include" % ofed_prefix
IB_LDFLAGS = "-L%s/lib64 -Wl,-rpath,%s/lib64 -libverbs" %(ofed_prefix, ofed_prefix)

# Python
# DESRES installs Python and numpy in separate path locations; your installation
# will likely install numpy somewhere in the Python path hierarchy
python_prefix = '/usr'
numpy_prefix = "/usr/lib/python2.7/dist-packages"

EXTRA_INCLUDE_PATH += ' %s/include/python2.7' % python_prefix
EXTRA_LIBRARY_PATH += ' %s/lib' % python_prefix
EXTRA_LINK_FLAGS   += ' -Wl,-rpath,%s/lib' % python_prefix

EXTRA_INCLUDE_PATH += ' %s/numpy/core/include' % numpy_prefix
EXTRA_LIBRARY_PATH += ' %s/numpy/core' % numpy_prefix
EXTRA_LINK_FLAGS   += ' -Wl,-rpath,%s/numpy/core' % numpy_prefix
EXTRA_LIBS += ' -lboost_python -lpython2.7'
```

Then testing the build to check if the random number is generating the expected random number ;) 
 
```bash
export DESMOND_PLUGIN_PATH=./objs/Linux/x86_64/gcc-4.6/Release/lib/plugin/
echo $DESMOND_PLUGIN_PATH
./objs/Linux/x86_64/gcc-4.6/Release/bin/desmond --include ./share/samples/dhfr.cfg --cfg boot.file=./share/samples/dhfr.dms --cfg mdsim.plugin.eneseq.name=dhfr.eneseq
diff dhfr.eneseq ./share/samples/dhfr.eneseq.reference
cp dhfr.eneseq dhfr.eneseq.original
```

Test restoring the checkpoint capacity; the files 'dhfr.eneseq' and 'dhfr.eneseq.original' should be identical.  

```bash 
./objs/Linux/x86_64/gcc-4.6/Release/bin/desmond --restore checkpt
tail dhfr.eneseq
tail dhfr.eneseq.original
```

Finally, test the parallel part. Here there should be a good match of energies dhfr.eneseq.2 with the previous two runs: 
 
```bash
export DESMOND_PLUGIN_PATH=./objs/Linux/x86_64/gcc-4.5.2/Release/lib/plugin
orterun -np 2 -- \
      ./objs/Linux/x86_64/gcc-4.5.2/Release/bin/desmond \
      --include ./share/samples/dhfr.cfg \
      --cfg boot.file=./share/samples/dhfr.dms \
      --cfg mdsim.plugin.eneseq.name=dhfr.eneseq.2 \
      --destrier mpi
sdiff dhfr.eneseq.original dhfr.eneseq.2
```
