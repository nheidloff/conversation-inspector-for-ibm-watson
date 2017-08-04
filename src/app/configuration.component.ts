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

import { ChangeDetectionStrategy, Component, Output, ContentChildren, EventEmitter, ChangeDetectorRef, ViewEncapsulation, AfterContentInit, ElementRef, QueryList, NgZone, ApplicationRef, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './store';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ToolAction } from './store/tool.reducer';
import { ValidationError } from './store/validation-error';
import { Common } from './common';
import { Tool } from './store/tool';

declare var $: any;

@Component({
	selector: 'configuration',
	templateUrl: 'configuration.component.html',
	styles: [
		require('../assets/less/loading-icon.less'),
		require('../assets/less/panel.less')
	],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConfigurationComponent {
	skillOverviewForm: FormGroup;

	@select(['tool', 'watsonUserName']) watsonUserName$: Observable<boolean>;
	@select(['tool', 'watsonPassword']) watsonPassword$: Observable<boolean>;
	@select(['tool', 'watsonWorkspace']) watsonWorkspace$: Observable<boolean>;
	@select(['tool', 'workspaces']) workspaces$: Observable<any>;

	validationErrorsUserName$: Observable<ValidationError[]>;
	validationErrorsPassword$: Observable<ValidationError[]>;
	validationErrorsWorkspace$: Observable<ValidationError[]>;

	constructor(private formBuilder: FormBuilder,
		private route: ActivatedRoute, private router: Router,
		private ngRedux: NgRedux<IAppState>, private http: Http) {
	}

	onKeyUpWatsonUserName(event) {
		let value: string;
		let element: any;
		element = document.getElementById('watsonUserName');
		if (element) {
			value = element.value;
			this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_USER_NAME, payload: value });
		}
	}

	onKeyUpWatsonPassword(event) {
		let value: string;
		let element: any;
		element = document.getElementById('watsonPassword');
		if (element) {
			value = element.value;
			this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_USER_PASSWORD, payload: value });
		}
	}

	onKeyUpWatsonWorkspace(event) {
		let value: string;
		let element: any;
		element = document.getElementById('watsonWorkspace');
		if (element) {
			value = element.value;
			this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE, payload: value });
		}
	}

	isSelectedOption(workspaceId: string): any {
		let output: any = null;
		if (this.ngRedux.getState().tool.watsonWorkspace) {
			if (this.ngRedux.getState().tool.watsonWorkspace == workspaceId) {
				output = true;
			}
		}
		return output;
	}

	ngOnInit(): void {
		this.skillOverviewForm = this.formBuilder.group({});

		Common.loadConfigFile(this.ngRedux);

		this.validationErrorsUserName$ = this.ngRedux.select((state) => {
			let errors: ValidationError[] = [];
			state.tool.validationErrors.forEach((validationError) => {
				if (validationError.itemName == 'watsonUserName') errors.push(validationError);
			});
			return errors;
		});
		this.validationErrorsPassword$ = this.ngRedux.select((state) => {
			let errors: ValidationError[] = [];
			state.tool.validationErrors.forEach((validationError) => {
				if (validationError.itemName == 'watsonPassword') errors.push(validationError);
			});
			return errors;
		});
		this.validationErrorsWorkspace$ = this.ngRedux.select((state) => {
			let errors: ValidationError[] = [];
			state.tool.validationErrors.forEach((validationError) => {
				if (validationError.itemName == 'watsonWorkspace') errors.push(validationError);
			});
			return errors;
		});

		Common.readVCAPCredentials(this.ngRedux, this.http);		
	}

	openWatsonServices() {
		let url = 'https://console.bluemix.net/dashboard/watson';
		window.open(url, '_blank');
	}

	getWatsonConfigurationStatus(): string {
		return this.ngRedux.getState().tool.watsonConfigStatus;
	}

	openInspectButtonPressed() {
		this.router.navigate(['/inspector/']);
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

	readWorkspaces(): void {
		let workspacesInStore = this.ngRedux.getState().tool.workspaces;
		if (workspacesInStore.length < 1) {
			this.getWorkspaceList((err, workspaces) => {
				if (err) {
					console.log(err);
					this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_CREDENTIALS_INVALID, payload: {} });
				}
				else {
					this.ngRedux.dispatch({ type: ToolAction.SET_WORKSPACES, payload: workspaces });
					let workspaceId: string = '';
					if (workspaces.length > 0) {
						workspaceId = workspaces[0].workspace_id;
					}					
					this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE, payload: workspaceId });	
					this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_CREDENTIALS_VALID, payload: {} });				
				}
			});
		}
	}

	getWorkspaceList(callback: { (err: Error, workspaces?: any): void; }) {
		let username: string = this.ngRedux.getState().tool.watsonUserName;
		let password: string = this.ngRedux.getState().tool.watsonPassword;
		let watsonUrl = '/conversation/api/v1/workspaces?version=2017-05-26';
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
						let workspaces = body.workspaces;
						callback(null, workspaces);
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
			}
		);
	}

	onBlurWatsonUserName(event) {
		this.onBlurWatsonPassword(event);
	}

	onBlurWatsonPassword(event) {
		if ((this.ngRedux.getState().tool.watsonConfigStatus == Tool.WATSON_CONFIG_STATUS_CREDENTIALS_SYNTAX_CORRECT) ||
			(this.ngRedux.getState().tool.watsonConfigStatus == Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT)) {
			this.readWorkspaces();
		}
	}

	onChangeWorkspace(event) {
		let element: any = document.getElementById("workspaces");
		if (element) {
			let workspaceId = element.options[element.selectedIndex].value;
			console.log(workspaceId)
			this.ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE, payload: workspaceId });
		}
	}

	onFocusWorkspace(event) {
		this.onBlurWatsonPassword(event);
	}

	vcapCredentialsExist(): boolean {
		return this.ngRedux.getState().tool.vcapCredentialsExist;
	}
}