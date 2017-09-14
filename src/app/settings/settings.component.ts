import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [CharacterService]
})
export class SettingsComponent implements OnInit {

  settings: any;

  constructor(private router: Router, private user: CharacterService) { }

  ngOnInit() {
    const _tmp = localStorage.getItem('settings');
    let _settings: any;
    if (_tmp) {
      _settings = JSON.parse(_tmp);
    } else {
      _settings = {
        voice: {
          enable: true,
          range: 4
        }
      };
    }
    this.settings = _settings;

  }

  saveSettings() {
    this.user.settings = this.settings;
    localStorage.setItem('settings', JSON.stringify(this.settings));
    this.router.navigate(['/map']);
  }

  playSample() {
    const speech = speechSynthesis;
    const jumps = this.settings.voice.range;
    let text = 'A hostile is in ';

    if (jumps === 0) {
      text += 'current system';
    } else {
      text += `${jumps} jump${jumps > 1 ? 's' : ''}`;
    }

    const message = new SpeechSynthesisUtterance(text);
    speech.speak(message);
  }
}
