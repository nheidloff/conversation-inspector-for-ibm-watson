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
var readCredentials = require('./readCredentials');

router.post('*', (req, res) => {
  var vcapCredentials = readCredentials();
  var credentials = req.get('Authorization');
  if (vcapCredentials.username && vcapCredentials.password) {
    credentials = "Basic " + new Buffer(vcapCredentials.username + ':' + vcapCredentials.password).toString('base64');
  }
  var url = 'https://gateway.watsonplatform.net/conversation' + req.url;
  var newRequest = request.post({
    uri: url,
    json: req.body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': credentials
    }
  });
  newRequest.pipe(res);
});

router.get('*', (req, res) => {
  var vcapCredentials = readCredentials();
  var credentials = req.get('Authorization');
  if (vcapCredentials.username && vcapCredentials.password) {
    credentials = "Basic " + new Buffer(vcapCredentials.username + ':' + vcapCredentials.password).toString('base64');
  }
  var url = 'https://gateway.watsonplatform.net/conversation' + req.url;
  var newRequest = request.get({
    uri: url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': credentials
    }
  });
  newRequest.pipe(res);
});

module.exports = router;