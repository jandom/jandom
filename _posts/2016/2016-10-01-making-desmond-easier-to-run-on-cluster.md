---
layout: post
title: 'Making DESMOND easier to run on a cluster'
date: '2016-10-01T06:12:00.002-07:00'
author: jandom
tags: 
modified_time: '2016-10-02T02:21:21.987-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-7147661896674860516
blogger_orig_url: https://jandomanski.blogspot.com/2016/10/making-desmond-easier-to-run-on-cluster.html
---

So, some of you probably wanted to try out this DESMOND code from DESRES. It's shipped with the Maestro suite by Schrodinger, which is free for academics and a little annoying to use if you wanna *just* use the binary.

This tutorial essentially describes how to run DESMOND without any of the annoying wrappers shipped by Schrodinger. It's making the code possible to run in a sane fashion - similar to how you launch your any other MD codes on the cluster. We'll cover both the CPU DESMOND and the GPU GDESMOND.

Required package can be downloaded from https://www.deshawresearch.com/downloads/download_desmond.cgi/

Desmond_Maestro_2016.3.tar  
Desmond-3.6.1.1.tar.gz

The 'Desmond-3.6.1.1.tar.gz' is just the source code and some sample systems - we won't be compiling that just gonna use the sample system to see if the code runs.

Install 'Desmond_Maestro_2016.3.tar' following their instructions.

Here is an example module file, to accompany the installation:

```bash
#%Module1.0##################################################################### 
## 
## pymol Modulefile 
## 
proc ModulesHelp { } { 
    global version 
    puts stderr "\tAdds 64-bit schrodinger to your environment." 
    puts stderr "\tDirectory: $root" 
} 

module-whatis "adds schrodinger to your environment"

# for Tcl script use only
set version 2016-3  
set root /sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/  

setenv SCHRODINGER $root 
setenv SCHROD_LICENSE_FILE /data/domanski/workspace/desmond/Desmond_Maestro_2016.3/license.lic 
setenv SCHRODINGER_PYTHONPATH " " 
setenv PYTHONNOUSERSITE " "  

prepend-path PATH $root
```

Then the standard:


```
module purge; module add my.modules; module add schrodinger/2016-3/64 
$ desmond -v Desmond-v%DESMOND_VERSION%
```

Okay so this works but 'desmond' is not actually the desmond binary, it's some python wrapper that then calls another wrapper that then calls the desmond binary.


```
$SCHRODINGER/desmond # python wrapper 
$SCHRODINGER/desmond-v4.7/bin/Linux-x86_64/desmond # actual binary
```

We wanna use the desmond binary directly without all the crap. Let's start by understanding what the wrapper runs and what's the env it uses : edit $SCHRODINGER/desmond-v4.7/bin/Linux-x86_64/drivermodel.py and add some print statements

```
def fork(self, is_backend, args):
    logging.debug("launch command:\n %s" % subprocess.list2cmdline(args))
    try:
        print("args=", args)
        for env in os.environ: print("export {}='{}'".format(env, os.environ[env]))
        self.process = subprocess.Popen(args)
```

Then let's run desmond again to understand what's going on:

```
cd Desmond-3.6.1.1
desmond -LOCAL -DEBUG -WAIT -HOST localhost:4 -c ./share/samples/dhfr.cfg -in ./share/samples/dhfr.cms
```

Some output should appear that looks like this

```
name:            localhost 
host:            localhost 
processors:      1 
processors_per_node: 1 
schrodinger:     /sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3 
tmpdir:          /tmp 
161001-13:57:10 [Use local *_EXEC values for local jobs] 
161001-13:57:10 Job will be launched on local host allkir 
161001-13:57:10 Job will NOT use jserver 
161001-13:57:10 Job will NOT use jproxy 
161001-13:57:10 [Multiple hosts specified on command line.] 
161001-13:57:10 Writing nodefile /sansom/s103/domanski/.schrodinger/.jobdb2/files/allkir-57efb/allkir-0-57efb2a6.nodes 
161001-13:57:10   localhost x 4 
161001-13:57:10 Wrote job record for job allkir-0-57efb2a6 to database 
161001-13:57:10 Writing local copy of job record for job allkir-0-57efb2a6 
161001-13:57:10 open2: perl "/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/mmshare-v3.5/bin/Linux-x86_64/jmonitor.pl" 
161001-13:57:10 [jmonitor output saved in /sansom/s103/domanski/.schrodinger/.jobdb2/files/allkir-57efb/allkir-0-57efb2a6.jlog] 
161001-13:57:10 jmonitor OUT: unix, perlio, utf8 
161001-13:57:10 [initial job record is in /sansom/s103/domanski/.schrodinger/.jobdb2/files/allkir-57efb/allkir-0-57efb2a6.copy ] 
161001-13:57:10 jmonitor IN: unix, perlio, utf8 
161001-13:57:10 Waiting for jmonitor PID+host+port 
161001-13:57:10 jmonitor pid = 9521 
161001-13:57:10 jmonitor host = allkir, port = 43154 
161001-13:57:10 Launched jmonitor in child 9520 JobId: allkir-0-57efb2a6 
161001-13:57:10 Jlaunch parent successful
```

Checkout dhfr.log file, it should contain a line like this (note also the lines printing all the ENV variables)


```
('args=',  ['/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3//mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/orterun',  '-hostfile', '/sansom/s103/domanski/.schrodinger/.jobdb2/files/allkir-57ee8/allkir-0-57ee82c9.nodes',  '-np', '4',  '--prefix', '/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3//mmshare-v3.5/lib/Linux-x86_64/openmpi',  '-x', 'JOBNAME', '-x', 'SCHRODINGER', '-x', 'DESMOND_EXEC',  '-x', 'MMSHARE_EXEC', '-x', 'DESMOND_PLUGIN_PATH', '-x', 'LD_LIBRARY_PATH',  '-x', 'PATH', '-x', 'OPLS_DIR', '-x', 'DESMOND_PLUGIN_PATH',  '-x', 'OPAL_PREFIX', '-x', 'LD_RUN_PATH', '-x', 'LD_LIBRARY_PATH', '-x', 'LDFLAGS',  '/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/desmond-v4.7/bin/Linux-x86_64/desmond',  '--destrier', 'mpi',  '--include', 'dhfr-out.cfg'])
```

Cool so there is some magical 'orterun' that's acting as 'mpirun' and calling desmond. Easy, let's try to run that

```
$SCHRODINGER/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/orterun -V 
error while loading shared libraries: libopen-rte.so.4: cannot open shared object file: No such file or directory
```

Well that sucks, let's setup the environment a bit more carefully:

```
export LD_RUN_PATH='/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/mmshare-v3.5/lib/Linux-x86_64/openmpi/lib/openmpi:/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/mmshare-v3.5/lib/Linux-x86_64/openmpi/lib'  
export LD_LIBRARY_PATH='/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/mmshare-v3.

$ $SCHRODINGER/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/orterun -V  
--------------------------------------------------------------------------
Sorry!  You were supposed to get help about:     
orterun:usage But I couldn't open the help file:     
/software/lib/Linux-x86_64/openmpi-1.6.5-build3/share/openmpi/help-orterun.txt: No such file or directory.  
Sorry! 
--------------------------------------------------------------------------

```

Still crap but better, final change to the env:

```
export OPAL_PREFIX='/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/mmshare-v3.5/lib/Linux-x86_64/openmpi'  
$SCHRODINGER/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/orterun -V

orterun (OpenRTE) 1.6.5  
Report bugs to http://www.open-mpi.org/community/help/
```

Awesome, or at least "good enough for government work"...

All those hacky export statements we'll get clean-up later, let's punch through this thing first. It should now be possible to call the desmond directly

```
$SCHRODINGER/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/mpirun -np 1 \ 
$SCHRODINGER/desmond-v4.7/bin/Linux-x86_64/desmond -h
Bad flag: -h Usage:     
/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/desmond-v4.7/bin/Linux-x86_64/desmond [--tpp x] [--destrier y] [Arg options]     
/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/desmond-v4.7/bin/Linux-x86_64/desmond [--tpp x] [--destrier y] --restore checkpoint_file [Arg options] is any combination of --include config_file and --cfg options Other options allowed are: --tpp x: x threads per processor --destrier y: use the y message passing method --python s: launch python interpreter and eval(s) 
--------------------------------------------------------------------------
mpirun noticed that the job aborted, but has no info as to the process that caused that situation. 
--------------------------------------------------------------------------
```

Sweet, this looks like it's working, let's try and run the example system directly.

```
$SCHRODINGER/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/mpirun -np 8 $SCHRODINGER/desmond-v4.7/bin/Linux-x86_64/desmond --destrier mpi --include ./share/samples/dhfr.cfg --cfg boot.file=./share/samples/dhfr.dms --cfg mdsim.plugin.eneseq.name=dhfr.eneseq

Context 
-------
Selected destrier 'mpi' not found (options: serial)! @other/destrier/base/destrier/destrier.cxx:56 in (unknown)
```

Nope still not working, lastly let's add all the bits together

```
export DESMOND_PLUGIN_PATH='/sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3/desmond-v4.7/lib/Linux-x86_64/plugin'
```

And voila!

```
$SCHRODINGER/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin/mpirun -np 8 $SCHRODINGER/desmond-v4.7/bin/Linux-x86_64/desmond --destrier mpi --include ./share/samples/dhfr.cfg --cfg boot.file=./share/samples/dhfr.dms --cfg mdsim.plugin.eneseq.name=dhfr.eneseq
-------------------------------------------------------------------                
DESMOND Build: Aug 30 2016 19:34:53                
provenance:  3.6.0.0                
precision:   single 
-------------------------------------------------------------------  

platform: Linux 4.4.0-38-generic (#57-Ubuntu SMP Tue Sep 6 15:42:33 UTC 2016) 
user: 9838:domanski:Jan Domanski 
start time: Sat Oct  1 14:09:51 2016 
working directory: /data/domanski/workspace/desmond/Desmond-3.6.1.1/. 
boot timestamp (@B in file names): 20161001140951 
number of processes: 8 
threads per process: 1 (0 background) 
destrier: mpi 
...   
Starting mdsim 
[0] user has set estimated particle density (est_pdens) to 0.1. 
[0] Setting global cell to     
/ 6.2230000e+01 0.0000000e+00 0.0000000e+00 \     
| 0.0000000e+00 6.2230000e+01 0.0000000e+00 |     
\ 0.0000000e+00 0.0000000e+00 6.2230000e+01 / 
[0] Partition of the cell by processes (global_cell.partition) =  [2 2 2] 
[0] Creating home box 
[0] Creating particle array 
[0] Injected 23558 particles 
[0] Constraint terms: 
constraint_ah1 
constraint_ah2 
constraint_ah3 
constraint_hoh  
Will not use reshake in the constraints 
[0] 458 constraint_ah1 
Will not use reshake in the constraints 
[0] 233 constraint_ah2 
Will not use reshake in the constraints 
[0] 99 constraint_ah3 
Will not use reshake in the constraints 
[0] 7023 constraint_hoh constraints 
[0] Bonded terms: 
angle_harm 
dihedral_trig 
improper_harm 
pair_12_6_es 
stretch_harm  
[0] 4561 harmonic angle terms 
[0] 5327 dihedral terms (skipped 1374) 
[0] 408 harmonic improper terms (skipped 10) 
[0] 6556 pair terms 
[0] 3419 harmonic stretch terms 
[0] NOTE: user has set the n_zone for this Nonbonded instance to 1024. 
[0] 34709 full exclusions 
35 VdW types with 2 coefficients 
Using average_dispersion = 82.7907 
[0] integrator selected: V_NVE 
Title: 5dhfr production parameters 
Starting chemical time (ps): 0.000 
opened output file: /data/domanski/workspace/desmond/Desmond-3.6.1.1/dhfr.eneseq 
::::::::::::::::::::::::::::: started ::::::::::::::::::::::::::::: 
Chemical time: 0.0000 ps, Step: 0 
Chemical time: 0.0400 ps, Step: 8, ns/day: 15.53594 
Chemical time: 0.0800 ps, Step: 16, ns/day: 15.88710 
Chemical time: 0.1200 ps, Step: 24, ns/day: 16.07763 
Chemical time: 0.1600 ps, Step: 32, ns/day: 15.93220 
Chemical time: 0.2000 ps, Step: 40, ns/day: 15.94156 
Chemical time: 0.2400 ps, Step: 48, ns/day: 15.95377 
Chemical time: 0.2800 ps, Step: 56, ns/day: 15.88497 
Chemical time: 0.3200 ps, Step: 64, ns/day: 16.02091 
Chemical time: 0.3600 ps, Step: 72, ns/day: 15.92259 
Chemical time: 0.4000 ps, Step: 80, ns/day: 15.95356
```

Now that was not easy... next up how to cleanup the modules file to re-use this more systematically and gdesmond.

## Cleanup and gdesmond

Let's cleanup all those ugly exports we've done into a nice module file

```
#%Module1.0##################################################################### 
## 
## pymol Modulefile 
## 
proc ModulesHelp { } { 
    global version 
    puts stderr "\tAdds 64-bit schrodinger to your environment." 
    puts stderr "\tDirectory: $root" 
} 

module-whatis "adds schrodinger to your environment"

# for Tcl script use only
set version 2016-3  
set root /sansom/s103/domanski/privateopt/Linux_x86_64/schrodinger/schrodinger2016-3  

setenv SCHRODINGER $root 
setenv SCHROD_LICENSE_FILE /data/domanski/workspace/desmond/Desmond_Maestro_2016.3/license.lic 
setenv SCHRODINGER_PYTHONPATH " " 
setenv PYTHONNOUSERSITE " "  

setenv DESMOND_PLUGIN_PATH $root/desmond-v4.7/lib/Linux-x86_64/plugin 
setenv OPAL_PREFIX $root/mmshare-v3.5/lib/Linux-x86_64/openmpi 

prepend-path PATH $root/desmond-v4.7/bin/Linux-x86_64 
prepend-path PATH $root/mmshare-v3.5/lib/Linux-x86_64/openmpi/bin 

prepend-path LD_LIBRARY_PATH $root/mmshare-v3.5/lib/Linux-x86_64/openmpi/lib 
prepend-path LD_LIBRARY_PATH $root/mmshare-v3.5/lib/Linux-x86_64 
prepend-path LD_LIBRARY_PATH $root/mmshare-v3.5/lib/Linux-x86_64/lib/python2.7/site-packages 
prepend-path LD_LIBRARY_PATH $root/desmond-v4.7/lib/Linux-x86_64 

prepend-path LD_RUN_PATH $root/mmshare-v3.5/lib/Linux-x86_64/openmpi/lib/openmpi 
prepend-path LD_RUN_PATH $root/mmshare-v3.5/lib/Linux-x86_64/openmpi/lib
```

This now finally looks and works like a reasonable way to launch an MD code...

```
module purge; module add my.modules; module add schrodinger/2016-3/desmond-64  
mpirun -np 8 desmond --destrier mpi  --include ./share/samples/dhfr.cfg --cfg boot.file=./share/samples/dhfr.dms --cfg mdsim.plugin.eneseq.name=dhfr.eneseq
```

In the modules files, switch up the plugins directory to the gdesmond-specific

```
setenv DESMOND_PLUGIN_PATH $root/desmond-v4.7/lib/Linux-x86_64/plugin
```

With

```
setenv DESMOND_PLUGIN_PATH $root/desmond-v4.7/lib/Linux-x86_64/plugin_gpu
```

And now, time to edit the `dhfr.cfg`:

```
# Replace 
near = {   
  type = force-only   
  r_tap = 9.0   
  taper = none 
} 
far = {   
  type = pme   
  order = [4 4 4]   
  n_k = [64 64 64]   
  transform = r2c-3round 
}  

# With 
far = {    
  n_k = [48 48 48 ]    
  order = [4 4 4 ]    
  r_spread = 4.0    
  sigma_s = 0.85    
  type = "pme" 
} 
near = {    
  r_tap = 9.0    
  taper = "none"    
  type = "default" 
}  

# And replace 
integrator = {   
  type = V_NVE    
  dt = 0.0025        
  respa = {      
    near_timesteps = 1     
    far_timesteps = 2     
    outer_timesteps = 2   
  }   
  V_NVE = {}  
}  

# With 
integrator = {   
  type = Multigrator    
  dt = 0.0025        
  respa = {      
    near_timesteps = 1     
    far_timesteps = 2     
    outer_timesteps = 2   
  }   
  Multigrator = { nve.type = Verlet } 
}
```

Then run the gdesmond with

```
module add schrodinger/2016-3/gdesmond-64  
mpirun -np 1 gdesmond --include ./share/samples/dhfr-gpu.cfg --cfg boot.file=./share/samples/dhfr.dms  --gpu-verbose
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 
Bonded terms:    
injecting group angle_harm with 4561 elements   
injecting group dihedral_trig with 5327 elements   
injecting group improper_harm with 408 elements   
injecting group pair_12_6_es with 6556 elements   
injecting group stretch_harm with 3419 elements 
Exclusion distance before optimization: 26 
Exclusion distance after optimization: 30 
Reverting to original exclusion mapping. 
Inserted 128b vector exclusion clusters. 
Virtual terms:  none   
injecting group exclusion with 69418 elements 
Using nonbonded.average_dispersion = 82.7907 
Constraint terms:   
[FUSED] Overriding constraint parameters with force.constraint.maxit=32 force.constraint.tol=1.000000e-08   
injecting group constraint_hoh with 7023 elements   
injecting group constraint_ah1 with 458 elements   
injecting group constraint_ah2 with 233 elements   
injecting group constraint_ah3 with 99 elements 
Title: 5dhfr production parameters 
Starting chemical time (ps): 0.000 
opened output file: /data/domanski/workspace/desmond/Desmond-3.6.1.1/eneseq 
::::::::::::::::::::::::::::: started ::::::::::::::::::::::::::::: 
Chemical time: 0.0000 ps, Step: 0 
Chemical time: 0.0400 ps, Step: 8, ns/day: 180.638 
Chemical time: 0.0800 ps, Step: 16, ns/day: 200.430 
Chemical time: 0.1200 ps, Step: 24, ns/day: 199.919 
Chemical time: 0.1600 ps, Step: 32, ns/day: 200.569 
Chemical time: 0.2000 ps, Step: 40, ns/day: 199.941 
Chemical time: 0.2400 ps, Step: 48, ns/day: 199.517 
Chemical time: 0.2800 ps, Step: 56, ns/day: 191.658 
Chemical time: 0.3200 ps, Step: 64, ns/day: 198.552 
Chemical time: 0.3600 ps, Step: 72, ns/day: 199.298 
Chemical time: 0.4000 ps, Step: 80, ns/day: 200.905 
Chemical time: 0.4400 ps, Step: 88, ns/day: 198.506 
Chemical time: 0.4800 ps, Step: 96, ns/day: 198.827 
Chemical time: 0.5200 ps, Step: 104, ns/day: 199.619 
Chemical time: 0.5600 ps, Step: 112, ns/day: 201.165 
Chemical time: 0.6000 ps, Step: 120, ns/day: 219.483 
Chemical time: 0.6400 ps, Step: 128, ns/day: 220.760 
Chemical time: 0.6800 ps, Step: 136, ns/day: 220.016 
Chemical time: 0.7200 ps, Step: 144, ns/day: 218.322 
Chemical time: 0.7600 ps, Step: 152, ns/day: 219.483 
writing checkpoint at 0.800000 to 'checkpt' 
Chemical time: 0.8000 ps, Step: 160, ns/day: 25.430 
Chemical time: 0.8400 ps, Step: 168, ns/day: 214.380 
Chemical time: 0.8800 ps, Step: 176, ns/day: 221.752 
Chemical time: 0.9200 ps, Step: 184, ns/day: 217.605 
Chemical time: 0.9600 ps, Step: 192, ns/day: 217.879 
Chemical time: 1.0000 ps, Step: 200, ns/day: 217.974 
Total rate per step: 158.972 ns/day  
::::::::::::::::::::::::::::: finished :::::::::::::::::::::::::::::  
stop time: Sat Oct  1 23:38:28 2016 (normal exit)

```

Considerably faster!

## U-Series to replace PME

    
Lastly, we're going to pickup useries.cfg from the technical report supplementary information available on their website https://www.deshawresearch.com/publications.html
    
At the bottom there is a link to <a href="https://www.deshawresearch.com/publications/Desmond-GPU-performance-1.6.2-October-2015.tgz">supplemental     information</a>, which contains a config for a "new" feature called U-series that's a replacement for PME in calculating long-range electrostatics. It results in 50% speedup for DHFR, as shown below

```
Starting chemical time (ps): 0.000 
opened output file: /data/domanski/workspace/desmond/Desmond-3.6.1.1/eneseq 
::::::::::::::::::::::::::::: started ::::::::::::::::::::::::::::: 
Chemical time: 0.0000 ps, Step: 0 
Chemical time: 2.5000 ps, Step: 125, ns/day: 307.955 
Chemical time: 5.0000 ps, Step: 250, ns/day: 332.216 
Chemical time:
```
