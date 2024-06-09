---
layout: post
title: Adding a simple cuda library to RDKit
date: '2014-09-18T09:27:00.000-07:00'
author: jandom
tags: 
modified_time: '2014-09-30T14:36:46.278-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-5241979955551301818
blogger_orig_url: https://jandomanski.blogspot.com/2014/09/adding-simple-cuda-library-to-rdkit.html
---


There are many interesting things a chemist can do with a GPU. Think <a href="http://www.eyesopen.com/fastrocs">FastROCS</a> as an example where GPU has greatly speed-up aligning two conformers.

A chemist, in addition to learning how to code on a GPU a little bit, has to distribute the code. One strategy would be to include the code in another software package that's widely used by the target audience. This can be a very tedious task... and so the task of this post will be to cover this 'boiler plate' part. The code presented here does nothing meaningful, it just shows you how to do the piping.

For the ubuntu users in the house, visit <a href="https://developer.nvidia.com/cuda-downloads">https://developer.nvidia.com/cuda-downloads</a>. In my setup ubuntu 14.04 64bit DEB was the choice, then 'sudo apt-get install nvidia-cuda-toolkit'

Here is a simple 'hello world' program that truly does some work on the GPU. 
 
```cpp
#include <stdio.h>
const int N = 16;
const int blocksize = 16;

namespace RDCuda {
    __global__
    void hello(char *a, int *b) {
        a[threadIdx.x] += b[threadIdx.x];
    }

    void helloworld() {
        char a[N] = "Hello \0\0\0\0\0\0";
        int b[N] = {15, 10, 6, 0, -11, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

        char *ad;
        int *bd;
        const int csize = N * sizeof(char);
        const int isize = N * sizeof(int);

        printf("%s", a);

        cudaMalloc((void**)&ad, csize);
        cudaMalloc((void**)&bd, isize);
        cudaMemcpy(ad, a, csize, cudaMemcpyHostToDevice);
        cudaMemcpy(bd, b, isize, cudaMemcpyHostToDevice);

        dim3 dimBlock(blocksize, 1);
        dim3 dimGrid(1, 1);
        hello<<<dimGrid, dimBlock>>>(ad, bd);
        cudaMemcpy(a, ad, csize, cudaMemcpyDeviceToHost);
        cudaFree(ad);
        cudaFree(bd);

        printf("%s\n", a);
    }
}

int main() {
    RDCuda::helloworld();
    return EXIT_SUCCESS;
}
```

Let's save that as a `hello-world.cu` file. It can be anywhere – this will be independent of rdkit for now.   

```bash
nvcc hello-world.cu -L /usr/local/cuda/lib -lcudart -o hello-world.o
./hello-world.o
Hello World!
```

That's all good. Now let's make that part of rdkit. First step: in `rdkit/CMakeList.txt` find the CUDA package to be able to compile .cu files 
 
```cmake
# extra boost versions
if(MSVC)
  SET(Boost_ADDITIONAL_VERSIONS "1.48" "1.48.0" "1.45" "1.45.0" "1.44" "1.44.0" "1.43" "1.43.0" "1.42" "1.42.0" "1.41" "1.41.0" "1.40" "1.40.0")
endif(MSVC)

find_package(CUDA)
```

Then, create 'rdkit/Code/RDCuda' directory and put the hello-world.cu there. Create also a rdkit/Code/RDCuda/hello-world.h. 
 
```cpp
// modified rdkit/Code/RDCuda/hello-world.cu
#include <stdio.h>
#include "hello-world.h"
```

```
// new file rdkit/Code/RDCuda/hello-world.h
#include <stdio.h>

namespace RDCuda {
    void helloworld();
}
```

You should be able to call 'nvcc hello-world.cu ...' as before on hello-world.cu file, and everything should still work with ./hello-world.o   Finally, let's create rdkit/Code/RDCuda/CMakeFile.txt - by putting things in this file we'll let cmake cover this directory.

```cmake
rdkit_cuda_library(RDCudaLib hello-world.cu SHARED)
set_target_properties(RDCudaLib PROPERTIES COMPILE_FLAGS "-fPIC")
rdkit_headers(hello-world.h DEST RDCuda)
```

There is one gotcha here: rdkit_cuta_library is a new macro. It is the same as rdkit_library, with 'add_library' cmake command replaced with 'cuda_add_library'. Here is how it should look inside rdkit/Code/cmake/Modules/RDKitUtils.cmake  
 
```cmake
macro(rdkit_cuda_library)
  PARSE_ARGUMENTS(RDKLIB
    "LINK_LIBRARIES;DEST"
    "SHARED"
    ${ARGN})
  CAR(RDKLIB_NAME ${RDKLIB_DEFAULT_ARGS})
  CDR(RDKLIB_SOURCES ${RDKLIB_DEFAULT_ARGS})
  if(MSVC)
    cuda_add_library(${RDKLIB_NAME} ${RDKLIB_SOURCES})
    target_link_libraries(${RDKLIB_NAME} ${Boost_SYSTEM_LIBRARY})
    INSTALL(TARGETS ${RDKLIB_NAME} EXPORT ${RDKit_EXPORTED_TARGETS}
            DESTINATION ${RDKit_LibDir}/${RDKLIB_DEST}
            COMPONENT dev)
  else(MSVC)
    # we're going to always build in shared mode since we
    # need exceptions to be (correctly) catchable across
    # boundaries. As of now (June 2010), this doesn't work
    # with g++ unless libraries are shared.
    cuda_add_library(${RDKLIB_NAME} SHARED ${RDKLIB_SOURCES})
    INSTALL(TARGETS ${RDKLIB_NAME} EXPORT ${RDKit_EXPORTED_TARGETS}
            DESTINATION ${RDKit_LibDir}/${RDKLIB_DEST}
            COMPONENT runtime)
    if(RDK_INSTALL_STATIC_LIBS)
      cuda_add_library(${RDKLIB_NAME}_static ${RDKLIB_SOURCES})
      INSTALL(TARGETS ${RDKLIB_NAME}_static EXPORT ${RDKit_EXPORTED_TARGETS}
              DESTINATION ${RDKit_LibDir}/${RDKLIB_DEST}
              COMPONENT dev)
    endif(RDK_INSTALL_STATIC_LIBS)
    IF(RDKLIB_LINK_LIBRARIES)
      target_link_libraries(${RDKLIB_NAME} ${RDKLIB_LINK_LIBRARIES})
    ENDIF(RDKLIB_LINK_LIBRARIES)
  endif(MSVC)
  if(WIN32)
    set_target_properties(${RDKLIB_NAME} PROPERTIES
                          OUTPUT_NAME "${RDKLIB_NAME}"
                          VERSION "${RDKit_ABI}.${RDKit_Year}.${RDKit_Month}")
  else(WIN32)
    set_target_properties(${RDKLIB_NAME} PROPERTIES
                          OUTPUT_NAME ${RDKLIB_NAME}
                          VERSION ${RDKit_VERSION}
                          SOVERSION ${RDKit_ABI})
  endif(WIN32)
  set_target_properties(${RDKLIB_NAME} PROPERTIES
                        ARCHIVE_OUTPUT_DIRECTORY ${RDK_ARCHIVE_OUTPUT_DIRECTORY}
                        RUNTIME_OUTPUT_DIRECTORY ${RDK_RUNTIME_OUTPUT_DIRECTORY}
                        LIBRARY_OUTPUT_DIRECTORY ${RDK_LIBRARY_OUTPUT_DIRECTORY})
endmacro(rdkit_cuda_library)
```

Finally, now we can compile this creature! Go to $RDBASE/build and compile-  
 
```bash
cmake ..
make -j6
make install
```

Hopefully, nothing blew in your face: location of CUDA should be correctly picked up by the cmake command. Make should compile without problems. The .so file should be compiled in $RDBASE/lib/libRDCudaLib.so. Let's play with it a little bit  
 
```bash
$ nm --dynamic $RDBASE/lib/libRDCudaLib.so
                 w _Jv_RegisterClasses
0000000000000bf0 T _Z35__device_stub__ZN6RDCuda5helloEPcPiPcPi
0000000000000c60 T _ZN6RDCuda10helloworldEv
0000000000000c50 T _ZN6RDCuda5helloEPcPi
00000000000030b8 A __bss_start
                 U __cudaRegisterFatBinary
                 U __cudaRegisterFunction
                 U __cudaUnregisterFatBinary
                 U __cxa_atexit
                 w __cxa_finalize
                 w __gmon_start__
                 U __printf_chk
                 U __stack_chk_fail
00000000000030b8 A _edata
00000000000030e8 A _end
0000000000000f38 T _fini
00000000000009c0 T _init
                 U cudaConfigureCall
                 U cudaFree
                 U cudaLaunch
                 U cudaMalloc
                 U cudaMemcpy
                 U cudaSetupArgument
0000000000000e50 T main
                 U puts
$ ldd $RDBASE/lib/libRDCudaLib.so
  linux-vdso.so.1 =>  (0x00007fffb2c8c000)
  libcudart.so.5.5 => /usr/lib/x86_64-linux-gnu/libcudart.so.5.5 (0x00007f40035bc000)
  libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f40031f6000)
  libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f4002ff1000)
  libstdc++.so.6 => /usr/lib/x86_64-linux-gnu/libstdc++.so.6 (0x00007f4002ced000)
  libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f4002acf000)
  librt.so.1 => /lib/x86_64-linux-gnu/librt.so.1 (0x00007f40028c6000)
  /lib64/ld-linux-x86-64.so.2 (0x00007f400383e000)
  libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007f40025c0000)
  libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007f40023aa000)

```

That all looks good: from the output of nm command. '_ZN6RDCuda10helloworldEv' is the helloworld() function, it's defined (it has T rather than U in the second column); from ldd the libcudart points to a correct file on my machine.

 Let's make it all accessibly via python. One of the strengths of rdkit is the easily programmable python interface that wraps around fast c++ code. 

Create rdkit/Code/RDCuda/Wrap and put the following python wrapper there, called cuda.cpp.   
 
```cpp
#include <RDBoost/Wrap.h>
#include <boost/python.hpp>
#include <RDCuda/hello-world.h>

namespace python = boost::python;

namespace RDKit {
    bool doHelloWorld() {
        printf("%s\n", "Before");
        RDCuda::helloworld();
        printf("%s\n", "After");
    };
}

BOOST_PYTHON_MODULE(cuda) {
    python::scope().attr("__doc__") =
        "Some docs";
    std::string docString;
    docString = "Some docs\n";
    python::def("helloworld", RDKit::doHelloWorld, docString.c_str());
}
```

Also, create `rdkit/Code/RDCuda/Wrap/CMakeList.txt` 
 
```cmake
rdkit_python_extension(cuda
                      cuda.cpp
                      DEST CUDA
                      LINK_LIBRARIES RDCudaLib)
```


Now, the rdkit/Code/RDCuda/CMakeList.txt has to become aware of the 'Wrap' directory, so append the following line to it 

```cmake
add_subdirectory(Wrap)
```

 In `rdkit/rdkit/CUDA/__init__.py` should have the following: 
 
```python
from rdkit.CUDA.cuda import *
```

Finally, go to $RDBASE/build and  
 
```bash
make -j6
make install
```

Just a few checks now 
 
```bash
$ ldd $RDBASE/rdkit/CUDA/cuda.so
  linux-vdso.so.1 =>  (0x00007fff9f8ef000)
  libRDCudaLib.so.1 => /home/jandom/workspace/rdkit/rdkit/lib/libRDCudaLib.so.1 (0x00007fd9ba64b000)
  libpython2.7.so.1.0 => /usr/lib/x86_64-linux-gnu/libpython2.7.so.1.0 (0x00007fd9ba0b5000)
  libboost_python.so.1.54.0 => /usr/local/lib/libboost_python.so.1.54.0 (0x00007fd9ba066000)
  libstdc++.so.6 => /usr/lib/x86_64-linux-gnu/libstdc++.so.6 (0x00007fd9b9d62000)
  libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007fd9b9b4c000)
  libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007fd9b9785000)
  libcudart.so.5.5 => /usr/lib/x86_64-linux-gnu/libcudart.so.5.5 (0x00007fd9b9538000)
  libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007fd9b931a000)
  libz.so.1 => /lib/x86_64-linux-gnu/libz.so.1 (0x00007fd9b9100000)
  libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007fd9b8efc000)
  libutil.so.1 => /lib/x86_64-linux-gnu/libutil.so.1 (0x00007fd9b8cf9000)
  libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007fd9b89f2000)
  /lib64/ld-linux-x86-64.so.2 (0x00007fd9ba657000)
  librt.so.1 => /lib/x86_64-linux-gnu/librt.so.1 (0x00007fd9b87ea000)
```

The so file 'libRDCudaLib' is pointing in the right direction, let's fire up ipython and perform the final test.

```python
import rdkit.CUDA
rdkit.CUDA.helloworld()
Before
Hello World!
After
Out[2]: True
```
 
Finally, let's do something more 'real', and pass an RDKit mol into the guts of the cuda file. We're going to pass the molecule and print the number of atoms. rdkit/Code/RDCuda/hellocuda.h 
 

```cpp
#include <stdio.h>
#include <GraphMol/GraphMol.h>

namespace RDCuda {
    void helloworld();
    void hellomol(RDKit::ROMol &mol);
}
```

And in rdkit/Code/RDCuda/hellocuda.cu we create a function that doesn't use the GPU all, it's merely stored as a .cu file.  
 
```cpp
#include <GraphMol/GraphMol.h>
//...

void hellomol(RDKit::ROMol &mol) {
    printf("mol.GetNumAtoms %d\n", mol.getNumAtoms());
}
```

That's easy, now modify the rdkit/Code/RDCuda/CMakeLists.txt 

```cmake
rdkit_cuda_library(RDCudaLib hello-world.cu LINK_LIBRARIES GraphMol)
```

We've got all the business end setup, let's complete by editing the python wrapper in rdkit/Code/RDCuda/Wrap/cuda.cpp  
 
```cpp
#include <GraphMol/GraphMol.h>
//...

bool doHelloMol(RDKit::ROMol &mol) {
    printf("%s\n", "Before");
    RDCuda::hellomol(mol);
    printf("%s\n", "After");
};
//...
docString = "empty";
python::def("hellomol", RDKit::doHelloMol, python::arg("mol"), docString.c_str());
```

And rdkit/Code/RDCuda/Wrap/CMakeLists.txt  
 
```cmake
rdkit_python_extension(cuda
                      cuda.cpp
                      DEST CUDA
                      LINK_LIBRARIES RDCudaLib GraphMol)
```

And again all should be good, the following example should work 

```python
from rdkit import Chem
from rdkit import CUDA

mol = Chem.MolFromMol2File("crystal_ligand.mol2")
print(CUDA.hellomol(mol))
Before
mol.GetNumAtoms 41
After
```

Next post will cover how to do something chemically useful with this code. For now, checkout <a href="https://github.com/jandom/rdkit/tree/cuda">my github fork of rdkit</a> for details. 
