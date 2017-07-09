INCLUDE_DIR_EMSCRIPTEN=lib/icu4c-emscripten-built/include
LIB_DIR_EMSCRIPTEN=lib/icu4c-emscripten-built/lib/

INCLUDE_DIR_HOST=lib/icu4c-host-built/include
LIB_DIR_HOST=lib/icu4c-host-built/lib/

ALL_LIBS=-licui18n -licuio -licuuc -licudata -licule -liculx -licutest -licutu

ifdef DEBUG
DEBUG_FLAGS=-O2 -s DISABLE_EXCEPTION_CATCHING=0 -s DEMANGLE_SUPPORT=1  -s ASSERTIONS=2
else
DEBUG_FLAGS=-Oz
endif

all:


icu4js.bc:
	em++ -std=c++11 -Werror $(DEBUG_FLAGS) -o build/icu4js.bc -I$(INCLUDE_DIR_EMSCRIPTEN) -L$(LIB_DIR_EMSCRIPTEN)  src/cpp/*.cpp

icu4js.min.js:
	mkdir -p build/dist
	em++ --bind -Werror $(DEBUG_FLAGS)  build/icu4js.bc  -o build/dist/icu4js.min.js --memory-init-file 0 -I$(INCLUDE_DIR_EMSCRIPTEN) -L$(LIB_DIR_EMSCRIPTEN) $(ALL_LIBS) --post-js src/js/util.js --post-js src/js/icu4js.js --post-js src/js/loader.js --post-js src/js/number-format.js --post-js src/js/date-format.js

icu4js.src.js:
	mkdir -p build/src
	em++ --bind  -Werror $(DEBUG_FLAGS)  build/icu4js.bc  -o build/src/icu4js.src.js --memory-init-file 0 -I$(INCLUDE_DIR_EMSCRIPTEN) -L$(LIB_DIR_EMSCRIPTEN) $(ALL_LIBS)
	cp src/js/*.js build/src/

icu4js-min: icu4js.bc icu4js.min.js
icu4js-src: icu4js.bc icu4js.src.js

data-packager:
	g++ -std=c++11 -o bin/data-packager -I$(INCLUDE_DIR_HOST) -Ilib/cpp-optparse -L$(LIB_DIR_HOST) $(ALL_LIBS) -D BUILD_PACKAGE_SCRIPT=1 src/cpp/data_packager.cpp src/cpp/error.cpp src/cpp/util.cpp lib/cpp-optparse/OptionParser.cpp

.PHONY: icu4js.bc icu4js.min.js data-packager	
