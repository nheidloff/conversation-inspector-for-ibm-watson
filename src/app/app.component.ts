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

import { Component, ViewChild, ViewContainerRef, OnInit, AfterViewChecked, ViewEncapsulation, ChangeDetectorRef} from '@angular/core';

import { SkillEditorOverviewComponent } from './skill-editor-overview.component';

import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { NgRedux, select, DevToolsExtension } from '@angular-redux/store';
import { IAppState, rootReducer, enhancers } from './store/index';
import { Observable } from 'rxjs/Observable';
const createLogger = require('redux-logger');

import 'jquery';
import 'bootstrap';
import 'metismenu';
import 'jszip';
import 'html2canvas';

declare var $: any;

@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styles: [
    require('../assets/less/app.component.less'),
    require('../assets/less/panel.less')
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewChecked {

  private sub: Subscription;
  
  private menuInstantiated = false;
  private showApplicationLoader: boolean = true;
  currentSkillId: string;
  @select(['skill', 'sdl', 'info', 'id']) currentSkillId$: Observable<string>;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private ngRedux: NgRedux<IAppState>,
    private changeDetectorRef: ChangeDetectorRef,
    private devTool: DevToolsExtension) {

    this.ngRedux.configureStore(
      rootReducer,
      {},
      [createLogger({ diff: true, collapsed: true })],
      [...enhancers, devTool.isEnabled() ? devTool.enhancer() : f => f]);

    this.currentSkillId$.subscribe(
      message => {
        this.currentSkillId = message;
      });

  }

  ngOnInit(): void {
    
    //Loads the correct sidebar on window load, collapses the sidebar on window resize. Sets the min-height of #page-wrapper to window size
    this.formatPage();
  }

  ngAfterViewChecked(): void {
    if ($('#side-menu').length && !this.menuInstantiated) {  //test if element exists at this point
      this.menuInstantiated = true;
      $('#side-menu').metisMenu();
    }
    this.hideProgressLoader();
  }

  private logout(): void {
    
  }

  private nonChromeBrowser(): boolean {
    var w:any = window;
    return !(w.chrome);
  }

  private isLoggedIn(): boolean {
    return true;
  }

  private getParameterByName(name): string {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  formatPage(): void {
    $(window).bind("load resize", function () {
      var topOffset = 50;
      var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;

      //removing code, bootstrap should take care of the collapse of menus
      /*if (width < 768) {
          $('div.navbar-collapse').addClass('collapse');
         
          topOffset = 100; // 2-row-menu
      } else {
          $('div.navbar-collapse').removeClass('collapse');
      }*/

      var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
      height = height - topOffset;
      if (height < 1) height = 1;
      if (height > topOffset) {
        $("#page-wrapper").css("min-height", (height) + "px");
      }

      //boostrap only seems to expand the menu from the hamburger button, does not collapses it
      $('button.navbar-toggle').on('click', function () {
        if ($('div.navbar-collapse').hasClass('in')) {
          setTimeout(function () {
            $('div.navbar-collapse').removeClass('in');
          }, 400);
        }
      });
    });
    

  }


  dashboardCurrentPage(): boolean {
    let output: boolean = false;    
    if (this.route.firstChild) {
      if (this.route.firstChild.component) {
        if (this.route.firstChild.component['name']) {
          if (this.route.firstChild.component['name'] == "DashboardComponent") {
            output = true;
          }
        }
      }
    }
    return output;
  }

  hideProgressLoader(): void {
    let path = document.location.pathname;

    this.showApplicationLoader = path === '/' || (path.indexOf('login')  === -1 && path.indexOf('dashboard') >= 0);
    this.changeDetectorRef.detectChanges();
  }
}
