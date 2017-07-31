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
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

const watson = require('./watson');
const credentials = require('./credentials');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '')));

app.use('/conversation', watson);
app.use('/credentials', credentials);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

var port = appEnv.port || '3000';

app.listen(port, appEnv.bind, function () {
  console.log('listening on port ' + appEnv.port);
});