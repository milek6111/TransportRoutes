import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { SearchComponent } from './components/search/search.component';
import { AddCityComponent } from './components/add-city/add-city.component';
import { AddConnectionComponent } from './components/add-connection/add-connection.component';
import { StatsComponent } from './components/stats/stats.component';
import { DeleteNodeComponent } from './components/delete-node/delete-node.component';
import { DeleteConnectionComponent } from './components/delete-connection/delete-connection.component';

export const appRoutes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'search', component: SearchComponent },
  { path: 'add-city', component: AddCityComponent },
  { path: 'add-connection', component: AddConnectionComponent },
  { path: 'delete-node', component: DeleteNodeComponent },
  { path: 'delete-connection', component: DeleteConnectionComponent },
  { path: 'stats', component: StatsComponent },
  { path: '', redirectTo: '/map', pathMatch: 'full' } // domyślnie ładowana mapa
];
