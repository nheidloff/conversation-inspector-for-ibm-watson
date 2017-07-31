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

import { SDL } from '../sdl/sdl';
import { SkillsStatus } from '../status/status';
import { ChatSession, ChatMessage } from '../test.component';
import { ValidationError } from './validation-error';

export class Tool {
  chatSession: ChatSession;
  utterances: string[];
  stateType: string;
  selectedMessage: ChatMessage;
  watsonUserName: string;
  watsonPassword: string;
  workspaceStatus: string;
  watsonWorkspace: string;
  validationErrors: ValidationError[];
  configReadFromFile: boolean;
  watsonConfigStatus: string;
  overwrittenPayload: string;
  workspaces: any;  
  vcapCredentialsRead: boolean;
  vcapCredentialsExist: boolean;

static NOT_READ = 'Not read';
  static WORKSPACE_NON_EXISTENT: string = 'Non Existent';  

  static WORKSPACE_STATUS_UNKNOWN: string = 'unknown';
  static WORKSPACE_STATUS_CHECKING: string = 'checking';
  static WORKSPACE_STATUS_TRAINING_IN_PROGRESS: string = 'Training';
  static WORKSPACE_STATUS_TRAINING_NON_EXISTENT: string = 'Non Existent';
  static WORKSPACE_STATUS_TRAINING_FAILED: string = 'Failed';
  static WORKSPACE_STATUS_TRAINING_DONE: string = 'Available';

  static WATSON_CONFIG_STATUS_CREDENTIALS_SYNTAX_CORRECT: string = 'credentialssyntaxvalid';
  static WATSON_CONFIG_STATUS_CREDENTIALS_NOT_CORRECT: string = 'credentialsnocorrect';
  static WATSON_CONFIG_STATUS_SYNTAX_CORRECT: string = 'syntaxcorrect';
  static WATSON_CONFIG_STATUS_SYNTAX_NOT_CORRECT: string = 'syntaxnotcorrect';
  static WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_VALID: string = 'valid';
  static WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_INVALID: string = 'invalid';

  constructor() {
    this.chatSession = new ChatSession();
    this.utterances = []; 
    this.stateType = 'All';
    this.selectedMessage = null;
    this.watsonUserName = null;
    this.watsonPassword = null;
    this.workspaceStatus = Tool.WORKSPACE_STATUS_UNKNOWN;
    this.validationErrors = [];
    this.configReadFromFile = false;
    this.watsonConfigStatus = null;
    this.watsonWorkspace = null;
    this.overwrittenPayload = '{}';
    this.workspaces = [];
    this.vcapCredentialsRead = false;
    this.vcapCredentialsExist = false;
  }
}