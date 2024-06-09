---
layout: post
title: Wrapping openbabel in python - using cython
date: '2013-05-27T16:20:00.002-07:00'
author: jandom
tags: 
modified_time: '2013-05-28T15:58:01.125-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-9055846307572622098
blogger_orig_url: https://jandomanski.blogspot.com/2013/05/openbable-wrapping-in-boost-and-cython.html
---

The [previous post](./2013-05-12-wrapping-openbabel-in-python-accessing.md) showed a contrived example of how one could access the openbabel functionality in python using the boost libraries. There is alternative to boost to wrap around c/c++ code, it's called cython. Here is an example openbabel wrapper, exposing some very simple functionality.   Just before diving in, you should know that there already exists a wrapper around openbabel in python (it is called pybel). What I'm showing here doesn't even come close to pybel in terms of usefulness, the idea here is to show a demo of how easy wrapping things in python is.  

```python
#! /usr/bin/python

from ez_setup import use_setuptools
use_setuptools()

from setuptools import setup, Extension, find_packages
from Cython.Distutils import build_ext

import sys, os
import glob

import subprocess as sub

def get_include(name="openbabel"):
    p = sub.Popen('locate %s' % name, stdout=sub.PIPE, stderr=sub.PIPE, shell=True)
    output, errors = p.communicate()
    include = [str.split("%s%s%s"  %(os.sep, name, os.sep))[0] for str in output.split("\n") if str.endswith(".h")]

    include = set(include)
    assert len(include) == 1

    return list(include)[0]

def main():
    extensions = [
                  Extension('_pyopenbabel',
                            glob.glob('src/*.pyx'),
                            [get_include('openbabel')],
                            language="c++", libraries=['openbabel'])
                  ,
                 ]

    setup(name              = 'pyopenbabel',
          ext_package       = 'pyopenbabel',
          cmdclass          = {'build_ext': build_ext},
          ext_modules       = extensions,
          packages          = find_packages()
          )

if __name__ == '__main__':
    main()
```

The actual wrapper is in `src/openbabel.pxd`. In it you register which things from the openbabel headers you're going to use/wrap. Note that all the "cdef extern from openbabel/..." statements will fail if the inculudes defined in setup.py are not actually pointing to a place where a openbabel headers live. If you want to find out what a header file is, or how to find it - for openbabel or any other piece of code - google will provide a fast soultion.

```python
# distutils: language = c++

from libcpp.string cimport string

from libcpp cimport bool

cdef extern from "openbabel/base.h" namespace "OpenBabel":
    cdef cppclass OBBase:
        pass

cdef extern from "openbabel/mol.h" namespace "OpenBabel":
    cdef cppclass OBMol(OBBase):
        OBMol() except +
        const char  *GetTitle(bool replaceNewlines = true)
        unsigned int NumAtoms()
        OBAtom      *GetAtom(int idx)

cdef extern from "openbabel/atom.h" namespace "OpenBabel":
    cdef cppclass OBAtom(OBBase):
        double      GetX()
        double      GetY()
        double      GetZ()

cdef extern from "openbabel/obconversion.h" namespace "OpenBabel":
    cdef cppclass OBConversion:
        OBConversion() except +
        bool SetInAndOutFormats(const char* inID, const char* outID)
        bool SetInFormat(const char* inID)
        bool ReadString(OBBase* pOb, string input)
        bool ReadFile(OBBase* pOb, string filePath)
```


We register it's use in `src/pyopenbabel.pyx`   

```python
cimport openbabel

def HandlePyOBMol(pyMol):
    # https://groups.google.com/forum/?fromgroups#!topic/cython-users/YPzCqO4jxlA
    cdef long ptr1 = long(pyMol.this)
    cdef openbabel.OBMol* optr1 = <openbabel.OBMol*> ptr1
    cdef openbabel.OBMol obMol = deref(optr1) # this is the c++ OBMol object
    # ... handle further, get/set atoms, bonds, etc
```

Finally, in `pyopenbabel/__init__.py` put 
 
```python
from _pyopenbabel import *
```
 
This will magically import everything from the wrapper (registered as cython extension in setup.py).  Why do I think this is important? Because it's fast, easy and may allow interesting chemistry to happen.  