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

import { SkillAction } from './action-types-skill';
import { DeepClone } from './deep-clone';
import { Skills } from './skills';
import { SkillsStatus } from '../status/status';
import { ChatMessage, ChatSession } from '../test.component';
import { Tool } from './tool';
import { Validations } from './validations';

const INITIAL_TOOL_STATE: Tool = new Tool();

export function toolReducer(state: Tool = INITIAL_TOOL_STATE, action: any) {
    let newTool: Tool;
    let oldChatMessages: ChatMessage[] = state.chatSession.messages;
    newTool = DeepClone.cloneTool(state); // for some reason this doesn't work for the array
    let newChatMessages: ChatMessage[] = [];
    if (oldChatMessages) {
        oldChatMessages.forEach((message) => {
            newChatMessages.push(message);
        })
    }
    newTool.chatSession.messages = newChatMessages;    

    switch (action.type) {
        case ToolAction.ADD_MESSAGE:
            newTool.chatSession.messages.push(action.payload.message);
            if (action.payload.message.incoming == false) {
                newTool.utterances = addUtterances(newTool.utterances, [action.payload.message.text]);
            }
            else {
                newTool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_VALID;
            }
            newTool.selectedMessage = action.payload.message;
            return newTool;

        case ToolAction.DELETE_CHAT:
            let messageToBeDeleted: ChatMessage = action.payload;
            let messages: ChatMessage[] = newTool.chatSession.messages;
            newTool.chatSession = new ChatSession();
            newTool.chatSession.messages = [];
            let lastMessageIndex: number = -1;
            messages.forEach((message: ChatMessage, index: number) => {
                if (message.date == messageToBeDeleted.date) {
                    lastMessageIndex = index;
                }
            });
            if (lastMessageIndex > -1) {
                messages.forEach((message: ChatMessage, index: number) => {
                if (index < lastMessageIndex) {
                    newTool.chatSession.messages.push(message);
                    newTool.selectedMessage = message;
                }
            });
            }            
            return newTool;

        case ToolAction.RESET_SESSION:
            newTool.chatSession = new ChatSession();
            newTool.selectedMessage = null;
            return newTool;

        case ToolAction.ADD_UTTERANCES:
            newTool.utterances = addUtterances(newTool.utterances, action.payload.utterances);
            return newTool;

        case ToolAction.SET_SELECTED_MESSAGE:
            newTool.selectedMessage = action.payload.message;
            if (newTool.selectedMessage.incoming == false) {
                newTool.stateType = 'All';
            }
            return newTool;        

        case ToolAction.SET_STATE_TYPE:
            newTool.stateType = action.payload;
            return newTool;

        case ToolAction.SET_WATSON_USER_NAME:
            newTool.watsonUserName = action.payload;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_WATSON_USER_PASSWORD:
            newTool.watsonPassword = action.payload;            
            Validations.validate(newTool);
            return newTool;     
            
        case ToolAction.SET_WATSON_WORKSPACE:
            newTool.watsonWorkspace = action.payload;
            newTool.chatSession = new ChatSession();
            newTool.selectedMessage = null;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.CONFIG_READ_FROM_FILE:
            newTool.configReadFromFile = true;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_WATSON_CONFIG_INVALID:
            newTool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_INVALID;
            return newTool;

        case ToolAction.SET_WATSON_CREDENTIALS_VALID:
            newTool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_VALID;
            return newTool;

        case ToolAction.SET_WATSON_CREDENTIALS_INVALID:
            newTool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_CREDENTIALS_NOT_CORRECT;
            return newTool;

        case ToolAction.SET_WATSON_WORKSPACE_STATUS:
            newTool.workspaceStatus = action.payload;
            return newTool;

        case ToolAction.SET_OVERWRITTEN_PAYLOAD:  
            newTool.overwrittenPayload = action.payload;                   
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_WORKSPACES:
            newTool.workspaces = action.payload;
            return newTool;

        case ToolAction.SET_VCAP_CREDENTIALS_READ:
            newTool.vcapCredentialsRead = true;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_VCAP_CREDENTIALS_EXIST:
            newTool.vcapCredentialsExist = action.payload;
            Validations.validate(newTool);
            return newTool;

        default:
            return state;
    }
}

function addUtterances(previousUtterances: string[], newUtterances: string[]): string[] {
    previousUtterances.forEach((utterance) => {
        if (newUtterances.indexOf(utterance) < 0) {
            newUtterances.push(utterance);
        }
    })
    return newUtterances;
}

export class ToolAction {
    static SET_WATSON_USER_NAME: string = 'SET_WATSON_USER_NAME';
    static SET_WATSON_USER_PASSWORD: string = 'SET_WATSON_USER_PASSWORD';
    static SET_WATSON_WORKSPACE: string = 'SET_WATSON_WORKSPACE';
    static ADD_MESSAGE: string = 'ADD_CHAT_MESSAGE';
    static SET_SELECTED_MESSAGE: string = 'SET_SELECTED_CHAT_MESSAGE';
    static RESET_SESSION: string = 'RESET_SESSION';
    static ADD_UTTERANCES: string = 'ADD_UTTERANCES';
    static SET_CLIENT: string = 'SET_CLIENT';
    static SET_STATE_TYPE: string = 'SET_STATE_TYPE';
    static DELETE_CHAT: string = 'DELETE_CHAT';
    static CONFIG_READ_FROM_FILE: string = 'CONFIG_READ_FROM_FILE';
    static SET_WATSON_CONFIG_INVALID: string = 'SET_WATSON_CONFIG_INVALID';
    static SET_WATSON_CREDENTIALS_INVALID: string = 'SET_WATSON_CREDENTIALS_INVALID';
    static SET_WATSON_CREDENTIALS_VALID: string = 'SET_WATSON_CREDENTIALS_VALID';
    static SET_WATSON_WORKSPACE_STATUS: string = 'SET_WATSON_WORKSPACE_STATUS';
    static SET_OVERWRITTEN_PAYLOAD: string = 'SET_OVERWRITTEN_PAYLOAD';
    static SET_WORKSPACES: string = 'SET_WORKSPACES';
    static SET_VCAP_CREDENTIALS_READ: string = 'SET_VCAP_CREDENTIALS_READ';
    static SET_VCAP_CREDENTIALS_EXIST: string = 'SET_VCAP_CREDENTIALS_EXIST';
}