BLINK UI TESTS
==========================

UI are aimed to automate manual UI testing as much as possible.
Each UI test should run e2e scenario and take browser content
screenshots at some points in test. All screenshots will be
collected under ./screenshots/ folder along with textual descriptions.
./screenshots/ folder may be then analysed manually or
exported to other systems for further processing.

UI tests are using Protractor (https://angular.github.io/protractor/#/),
which is a Selenium based e2e testing framework for using with AngularJS apps.

Installation
--------------------------
1. Install nodejs >=4.4.0 (using nvm: ```nvm install 4```)
2. Install protractor: ```npm install -g protractor```
3. Install/update webdriver binaries: ```webdriver-manager update```
4. ```sudo apt-get install imagemagick```
5. ```sugo apt-get install graphicsmagick```

How to run UI tests
--------------------------
1. Start nodejs using nvm: ```nvm use 4.2.3``` (or whatever node version you stalled )
2. (If using ssh session only) Export a display variable ```export DISPLAY=:0```
3. Start webdriver manager: ```webdriver-manager start```
4. Start app server: from thoughspot/blink run ```grunt web [params]```
5. Run ui-tests: ```protractor conf.js```

Options
-------------------------
1. Log in using specific url and port
    --params.baseUrl='http://<cluster ip>:<port>'
2. Log in with specific user with:
    --params.user=<username> --params.password=<password>
3. Selenium server address:
    --seleniumAddress=http://localhost:4444/wd/hub
4. Browser name:
    --browser="internet explorer"
