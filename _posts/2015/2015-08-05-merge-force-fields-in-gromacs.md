---
layout: post
title: Merge force-fields in gromacs
date: '2015-08-05T13:49:00.001-07:00'
author: jandom
tags: 
modified_time: '2016-02-04T13:03:34.498-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1725196667811284420
blogger_orig_url: https://jandomanski.blogspot.com/2015/08/merge-force-fields-in-gromacs.html
---

Using gromacs with two force-fields are for ligand one for protein? Wanting to do that but not knowing how? Look no further.

The technical problem is as follows: let's say you have your favourite custom force-field. For me it resides in charmm.ff and it's my hybrid charmm36+charmm22* set of parameters.

To simulate a ligand inside of a system parametrized using the ff-above, I went to paramchem.org and obtained small molecule parameters for my ligand. These were in CHARMM format, so (courtesy of [Alex Mackerell](http://mackerell.umaryland.edu/)) I converted those to gromacs itp files. That left me with a dependency on [charmm36-jun2015.ff.tgz](http://mackerell.umaryland.edu/download.php?filename=CHARMM_ff_params_files/charmm36-jun2015.ff.tgz)

There is only a handful of lines I want from charmm36-jun2015.ff, the ligand is very simple. There is no easy way to get those out, or to merge my custom charmm with Alex's.

### Prerequisites

Install networkx, a python package for dealing with graphs:
```bash
pip install networkx
```

Let's take some example ligand molecules, such as the TPP - the ligand for EmrE drug transporter. Attached [here](https://drive.google.com/file/d/0BzI3NK6qw0lJUF9fOWxKajk3TTQ/view?usp=sharing), after protonating it in maestro.

### First iteration, the fast way

On paramchem.org, select the checkbox "Include parameters that are already in CGenFF" in paramchem to include copies of the parameters in the paramchem output. This removes the dependency on charmm36-jun2015 - everything needed is explicitly copied into the .str and then the .prm files. Then directly include the .prm into your force-filed and done.

### Second iteration, the clever way

Instead of downloading an .str with all the parameters explicitly included, we'll take it the default way. Then we're going to use our own code to extract the parameters for the isolated component in the system. The end result is the same: a stand-alone itp with all the parameters for a given molecule of interest.

```bash
python cgenff_charmm2gmx.py Ligand Ligand.mol2 Ligand.str charmm36-jun2015.ff
grompp -pp -p ligand.top
# exctract only the parameters needed from processed.top
python forcefield.py processed.top processed.itp
```

The script [forcefield.py](https://github.com/jandom/GromacsWrapper/blob/develop/scripts/gw-forcefield.py) can be downloaded from github.

processed.itp contains only the parameters needed to run this ligand molecule: append all the [ *types ] sections to your ffbonded.itp and ffnonbond.itp, then #include the reminder of processed.itp in your topol.top and fly off with your simulations. With any force-field.

### Advantages of the slow way - separation of parameters

Using forcefield.py you could obtain molecule.itp file for your lipid, protein and small molecule parameters - potentially using 3 different force-fields. These can then be sanely combined together and used in simulation. How to combine will be the topic of the next entry.