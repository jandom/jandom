---
layout: post
title: Deposit Silicos-it Shape-it as an Ubuntu 12.04 package in a personal PPA
date: '2013-06-16T07:26:00.002-07:00'
author: jandom
tags: 
modified_time: '2013-06-16T16:51:15.556-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-1690609143718399004
blogger_orig_url: https://jandomanski.blogspot.com/2013/06/deposit-silicos-it-shape-it-as-ubuntu.html
---

See, I've never made a package for ubuntu repos, so I didn't know how much fun I was in...

Shape-it is an open and free software package that's using the same underlying theory as OpenEye's ROCS. Both codes perform a Gaussian-overlap of groups of atoms. But free stuff is good and so to make the free stuff even more free I've decided to put it in the Ubuntu repos. Now, I don't know how the Silicios-it and OpenEye implementations compare in either speed or getting the "right" answer (data for getting the right answer is known for ROCS from benchmarks on the DUD set, for example), so no guarantees folks!

Piecing together bits from various tutorials, I've come up with the package.sh script below that will download the original source and configure the package for you. Replace jandom-gmail and other details with your data, setup a PPA on launchpad, generate a GPG public-private keypair and register it with the PPA - you should be ready to go.

Before we jump in, the package is in the repos ready to be installed:

```bash
sudo add-apt-repository ppa:jandom-gmail/shape-it
sudo apt-get update
sudo apt-get install shape-it
shape-it -v
```

Here are the contents of package.sh

```bash
#!/usr/bin/env bash

wget http://silicos-it.com/_php/download.php?file=shape-it-1.0.1.tar.gz -O shape-it-1.0.1.tar.gz
tar xvf shape-it-1.0.1.tar.gz
cd shape-it-1.0.1/

# dh_make -e jandom@gmail.com -f ../shape-it_1.0.1.tar.gz
dh_make -e jandom@gmail.com -f ../shape-it-1.0.1.tar.gz --single << EOF
EOF

# debian/copyright
cat << EOF > debian/copyright
Format: http://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: Shape-it
Source: http://silicos-it.com/_php/download.php?file=shape-it-1.0.1.tar.gz

Files: *
Copyright: 2012 by Silicos-it, a division of Imacosi BVBA
License: GPL-2+

This program is free software; you can redistribute it
and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation; either
version 2 of the License, or (at your option) any later
version.
.
This program is distributed in the hope that it will be
useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE.
See the GNU General Public License for more
details.
.
You should have received a copy of the GNU General Public
License along with this package; if not, write to the Free
Software Foundation, Inc., 51 Franklin St, Fifth Floor,
Boston, MA  02110-1301 USA
.
On Debian systems, the full text of the GNU General Public
License version 2 can be found in the file
`/usr/share/common-licenses/GPL-2`.
EOF

# debian/changelog
cat << EOF > debian/changelog
shape-it (1.0.1-1) precise; urgency=low

  * Initial release

 -- Jan Domański <jandom@gmail.com>  Sat, 15 Jun 2013 16:36:37 -0400
EOF

# debian/control
cat << EOF > debian/control
Source: shape-it
Section: science
Priority: extra
Maintainer: Jan Domanski <jandom@gmail.com>
Build-Depends: debhelper (>= 8.0.0), cmake, libopenbabel4, libopenbabel-dev
Standards-Version: 3.9.2
Homepage: http://silicos-it.com/software/shape-it
#Vcs-Git: git://git.debian.org/collab-maint/shape-it.git
#Vcs-Browser: http://git.debian.org/?p=collab-maint/shape-it.git;a=summary

Package: shape-it
Architecture: any
Depends: \${shlibs:Depends}, \${misc:Depends}, libopenbabel4, libopenbabel-dev
Description: Program for shape-matching molecules
 Tool that aligns a reference molecule against a set of database molecules using
 the shape of the molecules as the align criterion. It is based on the use of
 Gaussian volumes as descriptor for molecular shape as it was introduced by
 Grant and Pickup.
EOF

# dpkg-buildpackage -rfakeroot
debuild -S

# use -sa for new packages, -sd for updates
# https://help.launchpad.net/Packaging/PPA/BuildingASourcePackage

# Ignore - it's part of the debuild -S any way
#
# lintian -Ivi ../shape-it_1.0.1-1_amd64.changes
# lintian ../shape-it_1.0.1-1_amd64.changes
cd ..

echo "Done, upload by using:"; echo
echo "  dput ppa:jandom-gmail/shape-it shape-it_1.0.1-1_source.changes"
``` 

See also <a href="https://docs.google.com/file/d/0BzI3NK6qw0lJNGNzTGpqTDUxOFU/edit?usp=sharing">package.sh for align-it</a> a similar tool to shape-it.