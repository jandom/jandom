---
layout: post
title: Modeller - quick start, filling loops in the DUDE protein receptor structures
date: '2016-03-02T10:43:00.002-08:00'
author: jandom
tags: 
modified_time: '2016-03-02T10:43:50.094-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-5579484365295001969
blogger_orig_url: https://jandomanski.blogspot.com/2016/03/modeller-quick-start-filling-loops-in.html
---

The aim here was getting simulations of the DUDE receptor proteins up and running. The main challenge is a large number of missing sidechains and loops in these structures - this is not a problem for docking codes perhaps, but certainly is for MD simulation codes.

Modeller from the Sali lab seemed like the tool for the job, so let's grab that

```bash
wget https://salilab.org/modeller/9.16/modeller_9.16-1_amd64.deb
sudo env KEY_MODELLER=MODELIRANJE dpkg -i modeller_9.16-1_amd64.deb
```

The only useful reference I was able to find on filling loops and missing sidechains was:

https://salilab.org/modeller/wiki/Missing%20residues

However, it assumes the aligment.ali file is constructed by hand. Maybe that's pleasurable to some but when I have ~20 receptor structures to complete, there is no time for this. Let's automate how alignment.ali file is generated:

```python
# alignment.py file
from MDAnalysis import Universe 
from MDAnalysis.lib.util import convert_aa_code
import textwrap, glob

u = Universe("receptor.pdb")
ca = u.select_atoms("protein and name CA")
residues = [(at.resid, at.residue.name) for at in ca]
sequence = []
for i, (resid, resname) in enumerate(residues):
    if i: 
        prev_resid = residues[i-1][0]
        gaps = ["-"]*(resid - prev_resid - 1)
        sequence.append("".join(gaps))
    sequence.append(convert_aa_code(resname))
seq_gap = "".join(sequence)

f = glob.glob("*.fasta.txt")[0]
fasta = "".join([l.strip()  for l in open(f).readlines() if not l.startswith(">")])
seq_filled = fasta[residues[0][0]+2: residues[-1][0]+residues[0][0]+1]

print """
>P1;receptor
structureX:receptor:  {0} : :+{1} : :::-1.00:-1.00
{2}*
>P1;receptor_fill
sequence:::::::::
{3}*
""".format(residues[0][0], len(residues), "\n".join(textwrap.wrap(seq_gap, 73)), "\n".join(textwrap.wrap(seq_filled, 73)))
```

```python
# modeller.py
from modeller import *
from modeller.automodel import *    # Load the automodel class

log.verbose()
env = environ()

# directories for input atom files
env.io.atom_files_directory = ['.', '../atom_files']

a = loopmodel(env, alnfile = 'alignment.ali',
              knowns = 'receptor', sequence = 'receptor_fill')
a.starting_model= 1
a.ending_model  = 1

a.loop.starting_model = 1
a.loop.ending_model   = 2
a.loop.md_level      = refine.fast

a.make()
```

Lastly, that's how it all fits together

```bash
python alignment.py > alignment.ali
python modeller.py
```