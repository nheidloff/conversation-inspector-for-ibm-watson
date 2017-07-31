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

import { NgModule, ErrorHandler }      	from '@angular/core';
import { BrowserModule } 	from '@angular/platform-browser';
import { ConfigurationComponent } from './configuration.component';
import {  
  FormsModule,  
  ReactiveFormsModule 
} from '@angular/forms';
import { AppComponent }  from './app.component';
import { routing,
         appRoutingProviders } from './app.routing'; 
import { HttpModule, JsonpModule, ConnectionBackend } from '@angular/http';
import { TestComponent } from './test.component';
import { HomeComponent } from './home.component';
import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { GlobalErrorHandler } from './global-error-handler';

@NgModule({
  imports: [ BrowserModule, HttpModule, routing, FormsModule, ReactiveFormsModule, NgReduxModule ],
  declarations: [ TestComponent, AppComponent, HomeComponent, ConfigurationComponent],
  providers: [appRoutingProviders, {provide: ErrorHandler, useClass: GlobalErrorHandler} ],
  bootstrap: [AppComponent]
})

export class AppModule { 
}

