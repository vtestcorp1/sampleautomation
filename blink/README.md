# Blink build system

1. `package.json` file holds the list of dependencies for blink.
2. `npm install` command needs to be run when dependencies change or when building from scratch.
	a. This command gets the dependencies and installs them into `node_modules` directory under blink.
	b. Also, more commands maybe run via the `postinstall` key in the json file.
3. `typings.json` holds the list of third party typescript definitions. `typings install` a postinstall
   command installs these definitions inside `typings/` directory.
4. git-scripts/post-checkout is responsible for running the `npm install` command for new checkouts. It also
   runs the install whenever it detects that `package.json` or `typings.json` have changed.
	a. If one needs to add a new trigger file, just add a symlink to the file inside git_scripts/setup/3.npm/
   	   directory.

