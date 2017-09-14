import { Injectable } from '@angular/core';
import { Character } from './character';
import { Channel } from './channel';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CharacterService {

  public data: Character;
  public settings: any;

  constructor(private http: Http) {
    this.getCharacterData();
  }

  getCharacterData() {
    const tmp = localStorage.getItem('character');
    if (tmp) {
      this.data = new Character(JSON.parse(tmp));
      this.data.watched = new Channel(JSON.parse(tmp).watched);
      this.settings = JSON.parse(localStorage.getItem('settings'));
      this.getCharacterPortrait();
    }
  }

  getCharacterPortrait() {
    const API = 'https://esi.tech.ccp.is/latest';
    return this.http
      .get(`${API}/search/?categories=character&datasource=tranquility&search=${this.data.name}`)
      .map(data => data.json())
      .map(data => {
        this.http
          .get(`${API}/characters/${data.character}/portrait/?datasource=tranquility`)
          .map(_data => _data.json())
          .map(_data => {
            this.data.portrait = _data.px512x512;
            this.data.saveSettings();
          })
          .toPromise();
      })
      .toPromise();
  }

}
