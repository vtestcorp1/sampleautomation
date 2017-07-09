GENCCODE_ASSEMBLY_TYPE=-a gcc-darwin
SO=dylib
SOBJ=dylib
A=a
LIBPREFIX=lib
LIB_EXT_ORDER=.57.1.dylib
COMPILE=/Users/shashank/dev/sdk/emsdk_portable/emscripten/1.35.0/emcc -DU_ATTRIBUTE_DEPRECATED=   -DU_HAVE_ELF_H=1 -DU_ENABLE_DYLOAD=0 -DU_HAVE_ATOMIC=0 -DU_HAVE_POPEN=0 -DU_HAVE_TIMEZONE=0  -O2 -std=c99 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -fno-common -c
LIBFLAGS=-I/Users/shashank/temp/icu4c/icu57/icu-emscripten/source/install-emscripten/include  -dynamic
GENLIB=/Users/shashank/dev/sdk/emsdk_portable/emscripten/1.35.0/emcc -dynamiclib -dynamic -O2 -std=c99 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings    
LDICUDTFLAGS=
LD_SONAME=-Wl,-compatibility_version -Wl,57 -Wl,-current_version -Wl,57.1 -install_name
RPATH_FLAGS=
BIR_LDFLAGS=
AR=/Users/shashank/dev/sdk/emsdk_portable/emscripten/1.35.0/emar
ARFLAGS=r
RANLIB=/Users/shashank/dev/sdk/emsdk_portable/emscripten/1.35.0/emranlib
INSTALL_CMD=/usr/bin/install -c
