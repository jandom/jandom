---
layout: post
title: 'Publication-quality matplotlib figures'
date: '2015-08-14T10:54:00.004-07:00'
author: jandom
tags: 
modified_time: '2015-08-15T08:25:33.448-07:00'
thumbnail: http://1.bp.blogspot.com/-nEEXUwAkYtE/Vc4VM3lxm7I/AAAAAAAAGo4/SvUUswnDQ_Y/s72-c/dummy.png
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-5902046935142891640
blogger_orig_url: https://jandomanski.blogspot.com/2015/08/smashing-matplotlib-figures.html
---

We're going to go from this...

![Initial Plot](http://1.bp.blogspot.com/-nEEXUwAkYtE/Vc4VM3lxm7I/AAAAAAAAGo4/SvUUswnDQ_Y/s320/dummy.png)

... to this

![Final Plot](http://1.bp.blogspot.com/-t3SZRQ4NY4M/Vc4m15AR7RI/AAAAAAAAGpQ/uRjIWP7DaVc/s320/reduction_2.png)

Install [prettyplotlib](https://github.com/olgabot/prettyplotlib), a useful tool for graph styling:

```bash
sudo pip install prettyplotlib
```

Add a new method to style the axes to prettyplotlib/util.py:

```python
def styling(ax, xpad=10.0, ypad=10.0, axiswidth=2.0, axistickwidth=2.0, axiscolor="#333333"):
    for axis in ['bottom','left']:
        ax.spines[axis].set_linewidth(axiswidth)

    for tick in ax.get_xaxis().get_major_ticks():
        tick.set_pad(xpad)
        tick.label1 = tick._get_text1()

    for tick in ax.get_yaxis().get_major_ticks():
        tick.set_pad(ypad)
        tick.label1 = tick._get_text1()

    ax.get_yaxis().set_tick_params(direction='out', width=axistickwidth)
    ax.get_xaxis().set_tick_params(direction='out', width=axistickwidth)

    ax.spines['bottom'].set_color(axiscolor)
    ax.spines['left'].set_color(axiscolor)

    ax.tick_params(axis='x', colors=axiscolor)
    ax.tick_params(axis='y', colors=axiscolor)
```

Set figure size to be smaller, load a color-brewer set from prettyplotlib:

```python
from prettyplotlib.colors import set2
fig = plt.figure(figsize=[4.35,4.35],dpi=300)
```

Plot the curves with more color:

```python
ax.errorbar(XA, YA, yerr=YAerr,fmt='o', color='black', ecolor='black', capthick=2, elinewidth=3, capsize=2)
X2 = np.linspace(300, 900, 100)
ax.plot(X2, zwanzig(X2, poptA[0], poptA[1]), color=set2[0], lw=2, alpha=0.66, label="Zwanzig")
ax.plot(X2, boring(X2, poptB[0], poptB[1]), color=set2[3], lw=2, alpha=0.66, label="Boltzman", ls='--')
```

Equations could use more color, larger fonts too:

```python
ax.text(350, 1e-0, r'$D_{0}= 5.5 \times  10^{-5} cm^2 / s$', fontsize=15, color=set2[3])
ax.text(350, 0.5e-0, r'$\epsilon_{RT}= 6.1$', fontsize=15, color=set2[3])

ax.text(600, 1e-1, r'$D_{0}= 0.8 \times  10^{-5} cm^2 / s$', fontsize=15, color=set2[0])
ax.text(600, 0.5e-1, r'$\epsilon_{RT}= 2.2$', fontsize=15, color=set2[0])
```

Clean-up and style the figure:

```python
ppl.utils.remove_chartjunk(ax,['top', 'right' ])
ppl.utils.styling(ax)
```

Install Calabri-like fonts on ubuntu:

```bash
sudo apt-get install fonts-crosextra-caladea fonts-crosextra-carlito
```

Clear matplotlib font cache:

```python
import matplotlib
matplotlib.get_cachedir()
```

Load the new fonts at the top of your script:

```python
import matplotlib.font_manager as fm
prop = fm.FontProperties(fname='/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf')
matplotlib.rcParams['font.family'] = prop.get_name()
matplotlib.rcParams['mathtext.fontset'] = 'custom'
matplotlib.rcParams['mathtext.rm'] = 'Carlito'
matplotlib.rcParams['mathtext.it'] = 'Carlito'
matplotlib.rcParams['mathtext.bf'] = 'Carlito:bold'
```