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

@Component({
	selector: 'home',
	templateUrl: 'home.component.html',
	styles: [
		require('../assets/less/loading-icon.less'),
		require('../assets/less/panel.less')
	],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class HomeComponent {
	skillOverviewForm: FormGroup;

	constructor(private formBuilder: FormBuilder,
		private route: ActivatedRoute, private router: Router,
		private ngRedux: NgRedux<IAppState>, private http: Http) {
	}

	ngOnInit(): void {
		Common.loadConfigFile(this.ngRedux);
		Common.readVCAPCredentials(this.ngRedux, this.http);
	}

	openConfigureButtonPressed() {
		this.router.navigate(['/configuration/']);
	}
}