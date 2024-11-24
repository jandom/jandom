---
layout: post
title: How close are the quaterly reported results to the yearly ones (for KGHM)
date: '2012-09-30T13:19:00.001-07:00'
author: jandom
tags: 
modified_time: '2012-09-30T20:55:21.240-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-8770330460964875942
blogger_orig_url: https://jandomanski.blogspot.com/2012/09/how-close-are-quaterly-reported-results.html
---

Companies publish their results every quarter. These results are often a good indication how a company will perform in the year (if Q'1 data for 2012 are better than the Q'1 from 2011, that's generally a good sign). The Q'4 report is also published much earlier that the yearly report for a company, at least in Poland the gap can be a few months. So the question is do the combined Q'1-Q'4 results represent in essence the same information, as results published in the yearly report for which one has to wait, could one use the information in the summed Q'1-Q'4 reports to derive at least a good estimate of the yearly results?

So here is a data for KGHM

Table 1. Income (after tax) for KGHM with quarterly report data summed up for each year (YR and QT are the consolidated yearly and quarterly results; both are given in thousands of PLN)

| Year | YR | Q'1-Q'4 (sum) | Fractional difference |
|------|-------|---------------|---------------------|
| 2001 | -838,625 | -830,943 | 0.009 |
| 2002 | -214,734 | -216,299 | -0.007 |
| 2003 | 673,043 | 661,316 | 0.017 |
| 2004 | 1,376,715 | 1,357,892 | 0.014 |
| 2005 | 2,102,332 | 2,117,130 | -0.007 |
| 2006 | 3,479,183 | 3,532,132 | -0.015 |
| 2007 | 3,934,559 | 3,961,014 | -0.007 |
| 2008 | 2,766,179 | 2,766,179 | 0.000 |
| 2009 | 2,327,993 | 2,327,993 | 0.000 |
| 2010 | 4,724,507 | 4,714,221 | 0.002 |
| 2011 | 11,063,456 | 11,078,034 | -0.001 |
| **Average (of absolute value of fractional difference)** | | | **0.007** |

In other words, the sum of quarterly reports seems to be a good proxy for the yearly result (as it should be!), at least in the case of KGHM. The next question could be to see if that's the case for all the companies on WIG. KGHM is admittedly one of the largest/most prominent players (part of the WIG20) so it was unlikely that it would fail this check. Also, is the agreement between yearly and quarterly data true for measures other than income (discrepancies in which would attract most attention)?

The second part of the story was looking at the whole WIG20 index

| Company code | Percentage difference of YT to sum(Q1-Q4) |
|-------------|------------------------------------------|
| PLTAURN00011 | 108.5 |
| PLDWORY00019 | 9.1 |
| PLBH00000012 | 0.8 |
| LU0327357389 | 130.9 |
| PLTLKPL00017 | 0.6 |
| PLPZU0000011 | 0.0 |
| PLPKO0000016 | 17.7 |
| PLPEKAO00016 | 0.1 |
| PLGTC0000037 | 1.1 |
| PLSOFTB00016 | -0.8 |
| PLBRSZW00011 | -3.6 |
| PLPKN0000018 | -3.3 |
| PLPGNIG00014 | 5.5 |
| PLLOTOS00025 | 5.3 |
| PLKGHM000017 | 0.1 |
| PLBRE0000012 | 2.0 |
| PLLWBGD00016 | 12.5 |
| PLTVN0000017 | 33.7 |
| PLPGER000010 | 23.6 |
| PLJSW0000015 | 0.0 |

The meaning of the percentage difference is the following: if it's zero (or close to) than the quarterly results and the yearly results are identical (or almost). If it's above zero, the quarterly reports under-reported the earnings; conversely and vice-versa.

The source code and how to reproduce this example are in
Part 1: https://github.com/jandom/FinAnalysis/commit/37fb8673c3651298a120627fc0a5c2705027066f