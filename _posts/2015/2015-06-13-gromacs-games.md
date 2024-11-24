---
layout: post
title: Gromacs games
date: '2015-06-13T12:00:00.006-07:00'
author: jandom
tags: 
modified_time: '2015-06-13T12:01:17.793-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1351891523484182067
blogger_orig_url: https://jandomanski.blogspot.com/2015/06/gromacs-games.html
---

### Additional energy terms in custom Hamiltonians, exchanges

The standard energy function in looks something like this:

```
E = E_bonds + E_angles + E_dihedrals + E_LJ + E_Culombic
```

This energy term, at some temperature T then becomes:

```
U = exp(-E/kb*T)
```

Let's say one has a n such Hamiltonians, U1...Un. These can then exchange, if the energies overlap. The details of the exchange scheme are skipped here, for gromacs implementation if the exchange see src/kernel/repl_ex.c

In temperature replica exchange one uses a ladder of T values, hoping that U1...Un overlap. In solute tampering replica exchange, one modifies the energy function E, keeping the T constant, hoping again to see exchange.

In deciding if a pair of replicas on a ladder will exchange, one compares their potential energy (Epot).

When including extra energy terms into the hamiltonian (custom biases, for example) one has to make sure they will be included in the Epot.

For instance, let's see if the gromacs pull code adds its energy to epot (such that it can be exchanged)

pull_potential_wrapper defined in src/mdlib/sim_util.c will call the pull_potential function and and save the energy to an enerd object:

```c
enerd->term[F_COM_PULL] += pull_potential(...);
```

pull_potential_wrapper is called both in do_force_cutsGROUP and do_force_cutsVERLET (all inside of src/mdlib/sim_util.c).

Immediately after computing the pull potential, the code calls sum_epot function, let's have a look at that:

```c
void sum_epot(t_grpopts *opts, gmx_grppairener_t *grpp, real *epot)
{
    int i;

    /* Accumulate energies */
    epot[F_COUL_SR]  = sum_v(grpp->nener, grpp->ener[egCOULSR]);
    epot[F_LJ]       = sum_v(grpp->nener, grpp->ener[egLJSR]);
    epot[F_LJ14]     = sum_v(grpp->nener, grpp->ener[egLJ14]);
    epot[F_COUL14]   = sum_v(grpp->nener, grpp->ener[egCOUL14]);
    epot[F_COUL_LR]  = sum_v(grpp->nener, grpp->ener[egCOULLR]);
    epot[F_LJ_LR]    = sum_v(grpp->nener, grpp->ener[egLJLR]);
    /* We have already added 1-2,1-3, and 1-4 terms to F_GBPOL */
    epot[F_GBPOL]   += sum_v(grpp->nener, grpp->ener[egGB]);

    /* lattice part of LR doesnt belong to any group and has been added earlier */
    epot[F_BHAM]     = sum_v(grpp->nener, grpp->ener[egBHAMSR]);
    epot[F_BHAM_LR]  = sum_v(grpp->nener, grpp->ener[egBHAMLR]);

    /* Sum all the values in the epot (list of floats) to a value at F_EPOT index */
    epot[F_EPOT] = 0;
    for (i = 0; (i < F_EPOT); i++)
    {
        if (i != F_DISRESVIOL && i != F_ORIRESDEV)
        {
            epot[F_EPOT] += epot[i];
        }
    }
}
```

In the first half of this function call, nothing useful happens. The second half where epot is iterated over (epot is the same as `enerd->term` earlier on), and accumulated.

Because F_COM_PULL comes before F_EPOT in include/types/idef.h, it will be included in the epot summation.

### Multiple input files

This is a minor, utility hack. Normally, mdrun uses a single input file - for example:

```bash
mdrun -s topol.tpr -o traj.xtc
```

For replica exchange simulations however, these become mulitple files - the command:

```bash
mdrun -multi 2 -s topol.tpr -o traj.xtc
```

Will initialize from 2 .tpr files topol0.tpr and topol1.tpr, it will also write two traj output files.

How to add additional files that will be read in with replica exchange simulations? Modify the following file:

```c
# src/gmxlib/main.c
     else if (bParFn)
    {
        /* Patch output and tpx, cpt and rerun input file names */
        for (i = 0; (i < nfile); i++)
        {
            /* Because of possible multiple extensions per type we must look
             * at the actual file name
             */
            if (is_output(&fnm[i]) ||
                fnm[i].ftp == efTPX || fnm[i].ftp == efCPT ||
                strcmp(fnm[i].opt, "-rerun") == 0)
            {
                ftp = fn2ftp(fnm[i].fns[0]);
                par_fn(fnm[i].fns[0], ftp, cr, TRUE, FALSE, buf, 255);
                sfree(fnm[i].fns[0]);
                fnm[i].fns[0] = gmx_strdup(buf);
            }
        }
    }
```

Which should become:

```c
fnm[i].ftp == efTPX || fnm[i].ftp == efCPT || fnm[i].ftp == efCUSTOM ||
```