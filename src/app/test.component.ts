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

import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SkillEditorStatusComponent } from './skill-editor-status.component';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './store';
import { ToolAction } from './store/tool.reducer';
import { Tool } from './store/tool';
import { Common } from './common';
import { ValidationError } from './store/validation-error';

declare var $: any;
declare var html2canvas: any;

@Component({
  selector: 'inspector',
  templateUrl: 'test.component.html'
  //, changeDetection: ChangeDetectionStrategy.OnPush
})

export class TestComponent {

  scrollToBottom: boolean = false;
  waitingForResponse: boolean = false;
  whiteSpace: string = 'pre';
  hideButtons: boolean = false;
  updateMetaData: boolean = false;
  @select(['tool', 'workspaceStatus']) training$: Observable<string>;
  messages$: Observable<ChatMessage[]>;
  displayOutgoingMessage: boolean = false;
  showJSONInputDialog: boolean = false;
  controlJSONInput: FormControl;
  form: FormGroup;
  validationErrorsOverwrittenPayload$: Observable<ValidationError[]>;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute, private router: Router,
    private changeDetectorRef: ChangeDetectorRef, private http: Http,
    private ngRedux: NgRedux<IAppState>) {
    this.messages$ = this.ngRedux.select((state) => {
      return state.tool.chatSession.messages;
    });
  }

  ngOnInit(): void {
    this.messages$.subscribe(messages => {
      this.updateMetaData = true;
    });

    this.form = this.formBuilder.group({});
    this.controlJSONInput = new FormControl('json-input');
    this.form.addControl('json-input', this.controlJSONInput);

    this.validationErrorsOverwrittenPayload$ = this.ngRedux.select((state) => {
      let errors: ValidationError[] = [];
      state.tool.validationErrors.forEach((validationError) => {
        if (validationError.itemName == 'overwrittenPayload') errors.push(validationError);
      });
      return errors;
    });

    Common.loadConfigFile(this.ngRedux);
    Common.readVCAPCredentials(this.ngRedux, this.http);
  }

  onJSONInputCanceled() {
    this.showJSONInputDialog = false;
  }

  private modifyJson() {
    let message: string = document.getElementById('conversationInput')['value'];
    let payload: any = this.buildPayload(message);
    this.controlJSONInput.setValue(JSON.stringify(payload, null, 2));
    this.showJSONInputDialog = true;
    this.ngRedux.dispatch({ type: ToolAction.SET_OVERWRITTEN_PAYLOAD, payload: JSON.stringify(payload, null, 2) });
  }

  onKeyUpOverwrittenJson(event) {
    let value: string;
    let element: any;
    element = document.getElementById('json-input');
    if (element) {
      value = element.value;
      this.ngRedux.dispatch({ type: ToolAction.SET_OVERWRITTEN_PAYLOAD, payload: value });
    }
  }

  onFormat(): void {
    let value: string = this.ngRedux.getState().tool.overwrittenPayload;
    try {
      let json = JSON.parse(value);
      this.ngRedux.dispatch({ type: ToolAction.SET_OVERWRITTEN_PAYLOAD, payload: JSON.stringify(json, null, 2) });
      this.controlJSONInput.setValue(this.ngRedux.getState().tool.overwrittenPayload);
    } catch (error) {
    }
  }

  onJSONDefined() {
    let chatMessage: ChatMessage = new ChatMessage();
    chatMessage.actorName = this.getUserName();
    chatMessage.incoming = false;
    chatMessage.date = new Date();
    let jsonString: string = this.ngRedux.getState().tool.overwrittenPayload;
    let json: any = JSON.parse(jsonString);
    let input = json.input;
    chatMessage.text = input.text;
    this.showJSONInputDialog = false;
    this.waitingForResponse = true;
    this.sendMessage(chatMessage);
    document.getElementById('conversationInput')['value'] = '';
  }

  private send(message: string) {
    this.waitingForResponse = true;
    if (message == '') {
      message = document.getElementById('conversationInput')['value'];
      document.getElementById('conversationInput')['value'] = '';
    }
    let chatMessage: ChatMessage = new ChatMessage();
    chatMessage.actorName = this.getUserName();
    chatMessage.text = message;
    chatMessage.incoming = false;
    chatMessage.date = new Date();

    let clearState: boolean = false;
    if (message.toUpperCase() === 'Clear state'.toUpperCase()) {
      this.ngRedux.dispatch({ type: ToolAction.RESET_SESSION, payload: { message: chatMessage } });
      this.waitingForResponse = false;
    }
    else {
      this.sendMessage(chatMessage);
    }
    this.scrollToBottom = true;
    this.scrollChatWindowToBottom();
  }

  addToTextbox(message: string) {
    let element = document.getElementById('conversationInput');
    if (element) {
      element['value'] = element['value'] + ' ' + message + ' ';
    }
  }

  scrollChatWindowToBottom() {
    let chatWindowElement = document.getElementById('chatWindow');
    if (chatWindowElement) {
      chatWindowElement.scrollTop = chatWindowElement.scrollHeight;
    }
  }

  ngAfterViewChecked() {
    if (this.updateMetaData == true) {
      this.displayMetaData();
      this.updateMetaData = false;
    }

    if (this.scrollToBottom == true) {
      window.scrollTo(0, document.body.scrollHeight);
    }
    this.scrollChatWindowToBottom();
    if (this.getColumnWidth() > 445) {
      this.hideButtons = false;
    }
    else {
      this.hideButtons = true;
    }
  }

  getColumnWidth(): number {
    let output: number = 0;
    let elementButtonsConversation = document.getElementById('buttonsConversation');
    if (elementButtonsConversation) {
      output = elementButtonsConversation.scrollWidth;
    }
    return output;
  }

  sendMessageToWatson(username: string, password: string, workspaceId: string, payload: any,
    callback: { (err: Error, response?: any): void; }) {
    let watsonUrl = '/conversation/api/v1/workspaces/' + workspaceId + '/message?version=2017-05-26';
    let errorMessage = 'Unexpected response from ' + watsonUrl;
    let watsonCredentials = "Basic " + new Buffer(username + ':' + password).toString('base64');
    let headers: Headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': watsonCredentials });
    let watsonOptions = new RequestOptions({ headers: headers });

    this.http.post(watsonUrl, payload, watsonOptions).subscribe(
      response => {
        try {
          let bodyString = response['_body'];
          let body = JSON.parse(bodyString);
          if (response.status == 200) {
            callback(null, body);
          }
          else {
            callback(new Error(errorMessage));
          }
        } catch (error) {
          callback(new Error(errorMessage));
        }
      },
      error => {
        callback(new Error(errorMessage));
      });
  }

  buildPayload(messageText: string): any {
    let workspaceId: string = this.ngRedux.getState().tool.watsonWorkspace;
    let context: any = {};
    let messages: ChatMessage[] = this.getMessages();
    if (messages) {
      if (messages.length > 0) {
        context = messages[messages.length - 1].state.context;
      }
    }

    let payload: any = {
      "workspace_id": workspaceId,
      "input": { 'text': messageText },
      "context": context
    };

    return payload;
  }

  private sendMessage(message: ChatMessage): void {
    let username: string = this.ngRedux.getState().tool.watsonUserName;
    let password: string = this.ngRedux.getState().tool.watsonPassword;
    let workspaceId: string = this.ngRedux.getState().tool.watsonWorkspace;

    if (!message.jsonPayload) {
      message.jsonPayload = this.buildPayload(message.text);
    }

    this.ngRedux.dispatch({ type: ToolAction.ADD_MESSAGE, payload: { message: message } });

    this.sendMessageToWatson(username, password, workspaceId, message.jsonPayload, (err, response) => {
      if (err) {
        this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_CONFIG_INVALID, payload: {} });
        console.log(err);
      }
      else {
        let chatMessage: ChatMessage = new ChatMessage();
        chatMessage.actorName = 'Watson';
        chatMessage.text = response.output.text[0];
        chatMessage.textArray = response.output.text;
        chatMessage.incoming = true;
        chatMessage.state = response;
        chatMessage.date = new Date();
        this.ngRedux.dispatch({ type: ToolAction.ADD_MESSAGE, payload: { message: chatMessage } });
      }
      this.waitingForResponse = false;
      this.scrollToBottom = true;
      this.scrollChatWindowToBottom();
    });
  }

  onKeyUp(event) {
    if (event.key == 'Enter') {
      if (this.waitingForResponse == false) {
        let configStatus: string = this.ngRedux.getState().tool.watsonConfigStatus;
        if ((configStatus == Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_VALID) || (configStatus == Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_VALID)) {
          this.send('');
        }
      }
    }
  }

  getUserName(): string {
    let output: string = "My Input"
    return output;
  }

  downloadConversation() {
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(this.getConversation());
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "conversation.txt");
    exportElement.click();
  }

  downloadState() {
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(this.getState());
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "state.txt");
    exportElement.click();
  }

  downloadPayload() {
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.ngRedux.getState().tool.selectedMessage.jsonPayload, null, 2));
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "payload.json");
    exportElement.click();
  }

  copyConversationToClipboard() {
    this.copyToClipboard(this.getConversation());
  }

  getConversation(): string {
    let content: string = '';
    let messages: ChatMessage[] = this.getMessages();
    messages.forEach((message) => {
      content = content + message.actorName + ': ' + message.text + '\n';
    })
    return content;
  }

  copyStateToClipboard() {
    this.copyToClipboard(this.getState());
  }

  copyPayloadToClipboard() {
    this.copyToClipboard(JSON.stringify(this.ngRedux.getState().tool.selectedMessage.jsonPayload, null, 2));
  }

  getState(): string {
    let content: string = 'No state information available yet';
    let messages: ChatMessage[] = this.getMessages();
    if (messages) {
      if (messages.length > 0) {
        let message = messages[messages.length - 1];
        content = JSON.stringify(message.state, null, 2);
      }
    }
    return content;
  }

  copyToClipboard(content: string) {
    let tempTextArea: HTMLTextAreaElement = document.createElement("textarea");
    tempTextArea.value = content;
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.top = '0';
    tempTextArea.style.left = '0';
    tempTextArea.style.width = '1em';
    tempTextArea.style.height = '2em';
    tempTextArea.style.padding = '0';
    tempTextArea.style.border = 'none';
    tempTextArea.style.outline = 'none';
    tempTextArea.style.boxShadow = 'none';
    tempTextArea.style.background = 'transparent';
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
    }
    document.body.removeChild(tempTextArea);
  }

  takeScreenshot(): void {
    let element = document.getElementById('chatWindow');

    html2canvas(element, {
      onrendered: function (canvas) {
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var exportElement = document.getElementById('exportElementHidden');
        exportElement.setAttribute("href", image);
        exportElement.setAttribute("download", "chat.png");
        exportElement.click();
      }
    });
  }

  getPayload(message: ChatMessage): string {
    let output: string = 'The body will be displayed here.';
    if (message) {
      if (message.incoming == false) {
        output = JSON.stringify(message.jsonPayload, null, 2);
      }
      output = output.trim();
    }
    return output;
  }

  getStateAll(message: ChatMessage): string {
    let output: string = 'Session state will be displayed here.';
    if (message) {
      if (message.incoming == true) {
        let state = message.state;
        output = JSON.stringify(state, null, 2);
      }
      output = output.trim();
    }
    return output;
  }

  getStateIntent(message: ChatMessage): string {
    let output: string = 'Intent information will be displayed here.';

    let intents: any = '[]'
    if (message) {
      if (message.incoming == true) {
        if (message.state) {
          if (message.state.intents) {
            intents = message.state.intents;
          }
        }
        output = JSON.stringify(intents, null, 2);
      }
    }
    return output;
  }

  getStateEntities(message: ChatMessage): string {
    let output: string = 'Entity information will be displayed here.';

    let entities: any = '[]'
    if (message) {
      if (message.incoming == true) {
        if (message.state) {
          if (message.state.entities) {
            entities = message.state.entities;
          }
        }
        output = JSON.stringify(entities, null, 2);
      }
    }
    return output;
  }

  getStateOutput(message: ChatMessage): string {
    let output: string = 'The text output will be displayed here.';

    let entities: any = '[]'
    if (message) {
      if (message.incoming == true) {
        if (message.state) {
          if (message.state.output) {
            entities = message.state.output.text;
          }
        }
        output = JSON.stringify(entities, null, 2);
      }
    }
    return output;
  }

  getStateContext(message: ChatMessage): string {
    let output: string = 'The context will be displayed here.';
    let context: any = '{}'
    if (message) {

      if (message.state) {
        if (message.state.context) {
          context = message.state.context;
          if (context.conversation_id) delete context.conversation_id;
          if (context.system) delete context.system;
        }
      }
      output = JSON.stringify(context, null, 2);
    }
    return output;
  }

  deleteVariable(name: string, variables: StateVariable[]): StateVariable[] {
    let index = -1;
    variables.forEach((variab, i) => {
      if (variab.name == name) index = i;
    })
    if (index >= 0) {
      variables.splice(index, 1);
    }
    return variables;
  }

  displayPayload(message: ChatMessage) {
    this.displayOutgoingMessage = true;
    this.displayMetaData(message);
  }

  displayMetaData(message?: ChatMessage) {
    let stateElement = document.getElementById('metaData');
    if (stateElement) {
      if (message) {
        this.ngRedux.dispatch({ type: ToolAction.SET_SELECTED_MESSAGE, payload: { message: message } });
      }
      let selectedMessage;
      if (this.ngRedux.getState().tool) {
        selectedMessage = this.ngRedux.getState().tool.selectedMessage;
      }
      if (selectedMessage) {
        if (selectedMessage.incoming == false) {
          this.displayOutgoingMessage = true;
          stateElement.innerHTML = this.getPayload(selectedMessage);
        }
        else {
          this.displayOutgoingMessage = false;
          let stateType = 'All';
          if (this.ngRedux.getState().tool) {
            stateType = this.ngRedux.getState().tool.stateType;
          }
          if (stateType === 'All') {
            stateElement.innerHTML = this.getStateAll(selectedMessage);
          }
          if (stateType === 'Text Output') {
            stateElement.innerHTML = this.getStateOutput(selectedMessage);
          }
          if (stateType === 'Intent') {
            stateElement.innerHTML = this.getStateIntent(selectedMessage);
          }
          if (stateType === 'Entities') {
            stateElement.innerHTML = this.getStateEntities(selectedMessage);
          }
          if (stateType === 'Context') {
            stateElement.innerHTML = this.getStateContext(selectedMessage);
          }
        }
      }
      else {
        stateElement.innerHTML = this.getStateAll(selectedMessage);
      }
      stateElement.scrollTop = 0;
    }
  }

  getAllMetaData(): string {
    let output: string = '';
    let messages: ChatMessage[] = this.getMessages();
    messages.forEach((message) => {
      if (message.incoming == true) {
        output += JSON.stringify(message.state, null, 2);
      }
    })
    output = output.trim();
    return output;
  }

  getMessages(): ChatMessage[] {
    let output: ChatMessage[] = [];
    if (this.ngRedux.getState().tool) {
      if (this.ngRedux.getState().tool.chatSession) {
        if (this.ngRedux.getState().tool.chatSession.messages) {
          output = this.ngRedux.getState().tool.chatSession.messages;
        }
      }
    }
    return output;
  }

  getUtterances(): string[] {
    let output: string[] = [];
    if (this.ngRedux.getState().tool) {
      if (this.ngRedux.getState().tool.utterances) {
        output = this.ngRedux.getState().tool.utterances;
      }
    }
    return output;
  }

  readUtterances(): string[] {
    let output: string[] = [];

    return output;
  }


  setWhiteSpace() {
    let stateType = 'All';
    if (this.ngRedux.getState().tool) {
      stateType = this.ngRedux.getState().tool.stateType;
    }
    this.whiteSpace = 'pre';
    if (stateType == 'Output Text') {
      this.whiteSpace = 'pre-wrap';
    }
  }

  getStateTypes(): string[] {
    let output = ['All', 'Intent', 'Entities', 'Context', 'Text Output'];
    let stateType = 'All';
    if (this.ngRedux.getState().tool) {
      stateType = this.ngRedux.getState().tool.stateType;
    }
    if (stateType == 'Output Text') {
      output = ['Output Text', 'All', 'Intent', 'Entities', 'Context'];
    }
    if (stateType == 'Entities') {
      output = ['Entities', 'All', 'Intent', 'Context', 'Text Output'];
    }
    if (stateType == 'All') {
      output = ['All', 'Intent', 'Entities', 'Context', 'Text Output'];
    }
    if (stateType == 'Context') {
      output = ['Context', 'All', 'Intent', 'Entities', 'Text Output'];
    }
    return output;
  }

  stateTypeChanged(value) {
    this.ngRedux.dispatch({ type: ToolAction.SET_STATE_TYPE, payload: value });
    this.setWhiteSpace();
  }

  openWatsonServices() {
    let url = 'https://console.bluemix.net/dashboard/watson';
    window.open(url, '_blank');
  }

  deleteConversation(message: ChatMessage): void {
    this.ngRedux.dispatch({ type: ToolAction.DELETE_CHAT, payload: message });
  }

  getWatsonConfigurationStatus(): string {
    return this.ngRedux.getState().tool.watsonConfigStatus;
  }

  isWatsonConfigurationValid(): boolean {
    if ((this.ngRedux.getState().tool.watsonConfigStatus == Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT) ||
      (this.ngRedux.getState().tool.watsonConfigStatus == Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT_AND_VALID)) {
      return true;
    }
    else {
      return false;
    }
  }

  getWorkspaceInformation(callback: { (err: Error, status?: string): void; }) {
    if (this.isWatsonConfigurationValid() == false) {
      callback(new Error('Watson Configuration not valid'));
    }
    else {
      let username: string = this.ngRedux.getState().tool.watsonUserName;
      let password: string = this.ngRedux.getState().tool.watsonPassword;
      let workspaceId: string = this.ngRedux.getState().tool.watsonWorkspace;
      let watsonUrl = '/conversation/api/v1/workspaces/' + workspaceId + '?version=2017-02-03';
      let errorMessage = 'Unexpected response from ' + watsonUrl;
      let watsonCredentials = "Basic " + new Buffer(username + ':' + password).toString('base64');
      let headers: Headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': watsonCredentials });
      let watsonOptions = new RequestOptions({ headers: headers });

      this.http.get(watsonUrl, watsonOptions).subscribe(
        response => {
          try {
            let bodyString = response['_body'];
            let body = JSON.parse(bodyString);
            if (response.status == 200) {
              let status = body.status;
              callback(null, status);
            }
            else {
              callback(new Error(errorMessage));
            }
          } catch (error) {
            callback(new Error(errorMessage));
          }
        },
        error => {
          callback(new Error(errorMessage));
        });
    }
  }

  readWorkspaceStatus(): void {
    this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE_STATUS, payload: Tool.WORKSPACE_STATUS_CHECKING });
    this.getWorkspaceInformation((err, status) => {
      if (!err) {
        this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE_STATUS, payload: status });
        this.readWorkspaceStatusAgain();
      }
      else {
        console.log(err);
        this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE_STATUS, payload: Tool.WORKSPACE_STATUS_TRAINING_NON_EXISTENT });
      }
    });
  }

  readWorkspaceStatusAgain() {
    let currentStatus: string = this.ngRedux.getState().tool.workspaceStatus;
    if ((currentStatus == Tool.WORKSPACE_STATUS_TRAINING_IN_PROGRESS) || (currentStatus == Tool.WORKSPACE_STATUS_CHECKING)) {
      setTimeout(() => {
        this.getWorkspaceInformation((err, status) => {
          if (!err) {
            console.log(status)
            this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE_STATUS, payload: status });
            this.readWorkspaceStatusAgain();
          }
          else {
            console.log(err);
            this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE_STATUS, payload: Tool.WORKSPACE_STATUS_UNKNOWN });
          }
        });
      }, 10000);
    }
  }

  isValidPayload(): boolean {
    let output: boolean = true;
    if (this.ngRedux.getState().tool.validationErrors.length > 0) {
      this.ngRedux.getState().tool.validationErrors.forEach((error) => {
        if (error.itemName == 'overwrittenPayload') output = false;
      });
    }
    return output;
  }
}

export class ChatSession {
  constructor() {
    this.messages = [];
  }
  messages: ChatMessage[];
}

export class ChatMessage {
  constructor() {
  }
  incoming: boolean;
  text: string;
  textArray: string[];
  actorName: string;
  date: Date;
  state: any;
  jsonPayload: any;
}

export class StateVariable {
  constructor() {
  }
  name: string;
  value: string;
  type: string;
  mandatory: boolean;
}