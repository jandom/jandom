---
layout: post
title: Using gdb with gromacs
date: '2015-07-22T15:15:00.000-07:00'
author: jandom
tags: 
modified_time: '2015-07-22T15:15:08.399-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-6624349593702105012
blogger_orig_url: https://jandomanski.blogspot.com/2015/07/using-gdb-with-gromacs.html
---

Download and compile gromacs 5.x:

```bash
cd gromacs; mkdir build ; cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug
```

Then, go to the methanol example:

```bash
cd share/gromacs/tutor/methanol/
grompp
```

Then enter gdb console and issue some commands:

```bash
$ gdb
# that's where the gmx command lives
exec ../../build/bin/gmx
# read in the symbol table
file ../../build/bin/gmx
# break on errors
break _gmx_error
# break on do_force function
break do_force
run mdrun -debug 1 -v -s
```

This is not very practical - you can put the gdb commands into a file, gdb_cmds, and execute:

```bash
$ gdb -x gdb_cmds
```

**Note** gdb has a ton of useful commands, google around

References:

- add pretty command to gdb
http://stackoverflow.com/questions/23578312/gdb-pretty-printing-with-python-a-recursive-structure

- gdb tutorial handout
http://www.cs.umd.edu/~srhuang/teaching/cmsc212/gdb-tutorial-handout.pdf