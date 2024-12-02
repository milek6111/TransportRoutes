import { Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Router } from '@angular/router';

import {MatToolbarModule} from '@angular/material/toolbar'
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav'
import {MatListModule} from '@angular/material/list'


// Routing
import { appRoutes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatSidenavContainer, MatSidenav, MatSidenav, MatListModule, MatSidenavContent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'transport-routes-app';
}
