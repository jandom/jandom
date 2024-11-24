---
layout: post
title: Acetylated lysine and negatively charged cysteine for CHARMM protein force-field
date: '2014-08-02T03:32:00.000-07:00'
author: jandom
tags: 
modified_time: '2015-11-13T08:22:17.751-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1750192106587751094
blogger_orig_url: https://jandomanski.blogspot.com/2014/08/acetylated-lysine-and-negatively.html
---

The CHARMM protein force-fields in gromacs provides topologies for many commonly found protein residues. However, when one wants to include a slightly more exotic residue - say a modified amino acid - the process can be a little tedious.

Below, two example topologies are shown: the acetylated lysine (ALY) and negatively charged Cys (CYN); treat those as an extension to CHARMM protein force-field. ALY is can be used to model modifications on histone proteins, while CYN is supposed to model Cys in zinc-finger motifs where it coordinates Zn2+ ions.

The two topologies below are simple hacks. At no point am I claiming that they are 'correct' in any way -- but they provide a starting point for any improvements one wishes to make.

**Edit:** I recently bumped into a paper called [Force field parameters for the simulation of modified histone tails](http://www.ncbi.nlm.nih.gov/pubmed/20652987) where quantum calculations are done to obtain CHARMM parameters for the modified aminoacid residues. This could be a more reliable set of parameters than what I give here for acetylated-lysine; however, the aren't any parameter files in the SI of the paper or anywhere else I looked...

Acetylated lysine (resname ALY)
```
# edit aminoacids.rtp and add the following lines
[ ALY ]  ; acetylated lysine
 [ atoms ]
        N       NH1     -0.47   0
        HN      H       0.31    1
        CA      CT1     0.07    2
        HA      HB      0.09    3
        CB      CT2     -0.18   4
        HB1     HA      0.09    5
        HB2     HA      0.09    6
        CG      CT2     -0.18   7
        HG1     HA      0.09    8
        HG2     HA      0.09    9
        CD      CT2     -0.18   10
        HD1     HA      0.09    11
        HD2     HA      0.09    12
        CE      CT2     0.07    13 ; charge as per the CA atom
        HE1     HA      0.09    14
        HE2     HA      0.09    15
        NZ      NH1     -0.47   16 ; type changed from NH2 to NH1
        HZ      H       0.31    17 ; charge as per peptide bond
        C       C       0.51    18
        O       O       -0.51   19
       CH3     CT3      -0.270  20
       HH31    HA       0.090   21
       HH32    HA       0.090   22
       HH33    HA       0.090   23
       CH      C        0.510   24
       OH      O        -0.510  25    
 [ bonds ]
        CB      CA
        CG      CB
        CD      CG
        CE      CD
        NZ      CE
        N       HN
        N       CA
        C       CA
        C       +N
        CA      HA
        CB      HB1
        CB      HB2
        CG      HG1
        CG      HG2
        CD      HD1
        CD      HD2
        CE      HE1
        CE      HE2
        O       C
        NZ      HZ
        CH      CH3
        CH      NZ
        CH3     HH31
        CH3     HH32
        CH3     HH33
        OH      CH     
 [ impropers ]
        N       -C      CA      HN
        C       CA      +N      O
;[ cmap ]
;        -C      N       CA      C       +N
```

For aminoacids.hdb:
```
ALY     8
1   1   HN  N   -C  CA
1   5   HA  CA  N   C   CB
2   6   HB  CB  CG  CA
2   6   HG  CG  CD  CB
2   6   HD  CD  CE  CG
2   6   HE  CE  NZ  CD
1   1   HZ  NZ  CE  CD
3   4   HH3 CH3 CH OH
```

Edit residuetypes.dat and add:
```
ALY Protein
```

### Negatively charged cysteine (resname CYN)

Edit aminoacids.rtp and add:
```
[ CYN ]; negative cysteine, JD: the partial charge on SG is completely made up
  [ atoms ]
        N    NH1   -0.470  1   ;      |      
       HN      H    0.310  2   ;   HN-N      
       CA    CT1    0.070  3   ;      |   HB1
       HA     HB    0.090  4   ;      |   | 
       CB    CT2   -0.280  5   ;   HA-CA--CB--SG-
      HB1     HA    0.050  6   ;      |   |    
      HB2     HA    0.050  7   ;      |   HB2  
       SG      S   -0.820  8   ;    O=C               
        C      C    0.510  9
        O      O   -0.510 10
  [ bonds ]
       CB    CA
       SG    CB
        N    HN
        N    CA
        C    CA
        C    +N
       CA    HA
       CB   HB1
       CB   HB2
       SG   HG1
        O     C
  [ impropers ]
        N    -C    CA    HN
        C    CA    +N    O
```

For aminoacids.hdb:
```
CYN     3      
1    1    HN    N    -C    CA
1    5    HA    CA    N    C    CB
2    6    HB    CB    SG   CA
```

Edit residuetypes.dat and add:
```
CYN Protein
```