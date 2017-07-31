# Conversation Inspector for IBM Watson

The [Conversation Inspector for IBM Watson](https://github.com/nheidloff/conversation-inspector-for-ibm-watson) is a tool for developers to build conversational user experiences with [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html). The purpose of the tool is to display and manipulate the JSON that is sent between applications and Watson Conversation services. This is useful when, for example, you use [context variables](https://console.bluemix.net/docs/services/conversation/dialog-build.html#context) extensively to manage state information.

Main functionality:

* Displays JSON data of incoming messages [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help1.png) and provides filters, for example only context variables [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help3.png)
* Displays JSON data of outgoing messages [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help5.png)
* Allows sending outgoing messages via text or JSON [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help2.png)
* Displays history of conversation steps [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help4.png)
* Allows developers to navigate back to previous steps [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help6.png)
* Supports developers to download and copy all data to the clipboard [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help7.png)
* Displays Watson Conversation workspace status [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help9.png)
* Provides auto-complete textbox for previous text messages [(sample)](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/help8.png)

Try out the [online](https://conversation-inspector-for-ibm-watson.mybluemix.net) version yourself.

Screenshot of a sample conversation:

![alt text](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/raw/master/screenshots/conversation.png "Conversation Inspector for IBM Watson")

Authors: 

* Niklas Heidloff [@nheidloff](http://twitter.com/nheidloff)
* Ansgar Schmidt [@ansi](https://twitter.com/ansi)


# Setup on Bluemix

You can deploy the Conversation Inspector either via 'Deploy to Bluemix' button or by pushing it from your local environment.


### Deploy to Bluemix Button

The easiest way to deploy the Conversation Inspector to Bluemix is to press this button.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/nheidloff/conversation-inspector-for-ibm-watson)

You can bind a Watson Conversation service to the Cloud Foundry application. In this case the Watson user name and password are read from the VCAP environment variable and don't have to be entered manually. You can bind the service to the application either in the [Bluemix user interface](https://console.bluemix.net/dashboard/apps) or via the following commands.

```bash
cf login
cf services
cf bind-service conversation-inspector-for-ibm-watson my-conversation-service-name
```


### Deploy from local Environment

> Edit manifest.yml to point to your own application

```bash
git clone https://github.com/nheidloff/conversation-inspector-for-ibm-watson.git
cd conversation-inspector-for-ibm-watson
npm install
typings install
npm run build:prod
cf login
cd node
cf push
```


# Local Setup

You can run the Conversation Inspector either via Webpack or Node.

Rather than defining the Watson Conversation credentials and workspace ID every time when the application is started, you can define this information in src/assets/config.json when running locally.


### Run locally via Webpack Dev Server

```bash
git clone https://github.com/nheidloff/conversation-inspector-for-ibm-watson.git
cd conversation-inspector-for-ibm-watson
npm install
typings install
npm start
```
Go to [http://localhost:3000](http://localhost:3000) in your browser


### Run locally via Node Express

```bash
git clone https://github.com/nheidloff/conversation-inspector-for-ibm-watson.git
cd conversation-inspector-for-ibm-watson
npm install
typings install
npm run build:prod
cd node
npm install
node server-local.js
```
Go to [http://localhost:6023](http://localhost:6023) in your browser


# Next Steps and Contributions

We have a lot of ideas how to further improve the tool. Check out the [issues](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/issues) for details. 

Create [issues](https://github.com/nheidloff/conversation-inspector-for-ibm-watson/issues) or pull requests with your desired changes.