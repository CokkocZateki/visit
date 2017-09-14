import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentComponent: any;
  fullscreen: boolean;
  settings: any;
  constructor(public electronService: ElectronService, private router: Router) {

    if (electronService.isElectron()) {
      console.log('Mode electron');
      // Check if electron is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.ipcRenderer);
      // Check if nodeJs childProcess is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
    this.fullscreen = false;
  }

  onActivate(component) {
    this.currentComponent = component;
  }

  toggleFullscreen() {
    if (this.fullscreen) {
      document.webkitCancelFullScreen();
    } else {
      document.body.webkitRequestFullscreen();
    }
    this.fullscreen = !this.fullscreen;
  }

  focusOnCharacter() {
    this.currentComponent.focusOn();
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  currentPath(path: string) {
    return this.router.url === path;
  }
}
