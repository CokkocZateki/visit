import { MapComponent } from './map/map.component';
import { SettingsComponent } from './settings/settings.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'settings',
        component: SettingsComponent
    },
    {
        path: 'map',
        component: MapComponent
    },
    {
        path: '',
        redirectTo: '/map',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
