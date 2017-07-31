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
var appEnv = cfenv.getAppEnv();
var readCredentials = require('./readCredentials');

router.get('*', (req, res) => {
  var output = { 'hasCredentials': false };
  var credentials = readCredentials();
  if (credentials.username && credentials.password) {
    output = { 'hasCredentials': true };
  }
  res.send(JSON.stringify(output));
});

module.exports = router;