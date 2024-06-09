---
layout: post
title: Wrapping openbabel in python - accessing C++ via boost with setup.py
date: '2013-05-12T20:13:00.001-07:00'
author: jandom
tags: 
modified_time: '2013-06-02T20:15:34.767-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-3305469451616389550
blogger_orig_url: https://jandomanski.blogspot.com/2013/05/wrapping-openbabel-in-python-accessing.html
---

**Update** I have de-contrived the example below.

After some struggle, I've managed to accomplish this seemingly simple task: wrap a friendly open-source library inside Python and make it a Python module. Such wrapping is handy because it retains the speed of C++ inside of Python.

If you want to check out how to do more or less the same thing with Cython instead of Boost, see [this](http://jandomanski.blogspot.com/2013/05/openbable-wrapping-in-boost-and-cython.html).

So here is the `setup.py`:

```python
#! /usr/bin/python

from ez_setup import use_setuptools
use_setuptools()
from setuptools import setup, Extension

import sys, os
import glob

include_dirs = []

if __name__ == '__main__':
    extensions = [Extension('_boostbabel',['src/boostbabel.cpp'],
                            include_dirs+['src/boostbabel/', '/usr/include/openbabel-2.0/'],
                            language="c++", libraries=['boost_python', 'openbabel']),
                  ]
    setup(name              = 'boostbabel',
          ext_package       = 'boostbabel',
          ext_modules       = extensions,
          zip_safe = False,     # as a zipped egg the *.so files are not found (at least in Ubuntu/Linux)
          )
``` 

Relative to setup.py we have the actual source: `src/boostbabel.cpp`

```cpp
#include <Python.h>
#include <boost/python.hpp>
#include <openbabel/mol.h>
#include <openbabel/atom.h>
#include <openbabel/bond.h>

using namespace boost::python;
using namespace OpenBabel;

BOOST_PYTHON_MODULE(boostbabel) {
    // boostbabel has to match filename, here boostbabel.cpp
    class_<OpenBabel::OBAtom>("OBAtom");
    class_<OpenBabel::OBMol>("OBMol");
}
```

<strike>Now I know nothing about building/linking/including, so getting to that stage was pretty hard. Being the lazy one, I wonder if there isn't a way to guess all of the includes and libs used to init the Extension object by being clever in parsing the actual boostbabel.cpp?</strike>

Nooope, there isn't for the general case. 