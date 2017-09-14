import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';
import { CharacterComponent } from './character/character.component';
import { MapComponent } from './map/map.component';
import { CharacterService } from './character.service';
import { SettingsComponent } from './settings/settings.component';
import { SystemNamePipe } from './system-name.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CharacterComponent,
    MapComponent,
    SettingsComponent,
    SystemNamePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [ElectronService, CharacterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
