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

import { combineReducers  } from 'redux';
import { toolReducer } from './tool.reducer';
import { Tool } from './tool';

export class IAppState {
  tool?: Tool;
};

export const rootReducer = combineReducers<IAppState>({
  tool: toolReducer
});

export const enhancers = [  
];
