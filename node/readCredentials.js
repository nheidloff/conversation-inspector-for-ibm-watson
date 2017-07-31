//------------------------------------------------------------------------------
// Copyright IBM Corp. 2017
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const request = require('request');
var cfenv = require("cfenv")
var appEnv = cfenv.getAppEnv()

function getServiceCredentials() {
  var output = {};
  var servicesJson = appEnv.getServices();
  //var servicesJson = { "Conversation-cg": { "name": "Conversation-cg", "label": "conversation", "tags": ["watson", "ibm_created", "ibm_dedicated_public", "lite"], "plan": "free", "credentials": { "url": "https://gateway.watsonplatform.net/conversation/api", "username": "8f4f1ad2-323b-41cd-9951-0da8fa0d3158", "password": "abd" } } };  
  var services = [];
  var userName;
  var password
  if (servicesJson) {
    for (var service in servicesJson) {
      services.push(servicesJson[service]);
    }
    services.forEach((ser) => {
      if (ser.label == 'conversation') {
        userName = ser.credentials.username;
        password = ser.credentials.password;        
      }
    })
  }
  if (userName && password) {
    output = { 'username': userName, 'password': password }
  }
  return output;
}

module.exports = getServiceCredentials;