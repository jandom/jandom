---
layout: post
title: Scripting paramchem.org access
date: '2015-12-06T08:20:00.002-08:00'
author: jandom
tags: 
modified_time: '2015-12-07T14:07:28.755-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-4678877205600983944
blogger_orig_url: https://jandomanski.blogspot.com/2015/12/scripting-paramchemorg-access.html
---

Below is a simple python script that allows one to programatically access paramchem.org, a small-molecule parametrization service. Autocorrect said "problematic" instead of "programatic", maybe I'm not getting the hint...

The script has minimal dependencies and is very "light-weight", meaning no error handling or error messages. A full working example for a benzene (duh!) is attached.

Long time ago, I had to implement something similar to this script, so this was a fairly easy job. It relies on mechanize and beautiful soup to do it's thing.

```bash
python paramchem.py -u "YOUR USERNAME" -p "YOUR PASSWORD" -c benzene.pdb

# manually correct the "RESI" line in benzene.str to be 
# RESI BNZ 0.000 ! param...

python cgenff_charmm2gmx.py BNZ benzene.mol2 benzene.str charmm36-jun2015.ff/
```

Source code and examples:
- git clone https://github.com/jandom/paramchem
- [Example on google drive](https://drive.google.com/folderview?id=0BzI3NK6qw0lJODBDVHN2bGpuUjQ&usp=sharing)

Edited: note on errors, link to github repo