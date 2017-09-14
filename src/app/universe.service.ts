import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UniverseService {

  _data: any;

  constructor(private http: Http) { this._data = './assets/universe.json'; }

  getUniverse() {
    return this.http
      .get(this._data)
      .map(data => data.json())
      .toPromise();
  }

  getJumps(origin: number, dest: number) {
    const API = 'https://esi.tech.ccp.is/latest/route';
    return this.http
      .get(`${API}/${origin}/${dest}/?datasource=tranquility&flag=shortest`)
      .map(data => data.json().length)
      .toPromise();
  }

}
