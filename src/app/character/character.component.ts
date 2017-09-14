import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '../platform';
import { Character } from '../character';
import { Channel } from '../channel';
import { CharacterService } from '../character.service';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent implements OnInit {

  platform: Platform;
  characters: Character[];
  character: Character;
  channel: Channel;
  constructor(public user: CharacterService, private router: Router) { }


  ngOnInit() {
    this.platform = new Platform();
    this.characters = this.findCharacters();
  }

  updateSettings() {
    // this.character.watched = new Channel({ name: this.channel.name })
    this.character.watched = new Channel(this.channel.name);
    this.user.data = this.character;
    this.character.saveSettings();
  }

  findCharacters(): Character[] {
    const result = [];
    this.platform.fs.readdir(this.platform.logs, (err, chatFiles) => {
      chatFiles.forEach(chatFileName => {
        this.platform.fs.readFile(`${this.platform.logs}/${chatFileName}`, this.platform.charset, (_err, fileContent) => {
          const name = this.getCharacterName(fileContent);
          if (name && !result.find(c => c.name === name)) {
            result.push(new Character({ name: name }));
          }
        });
      });
    });
    return result;
  }

  getCharacterName(file: string): string {
    const rName = /Listener: +([^ ].*)/i;
    const match = file.match(rName);
    return match ? match[1] : '';
  }

}
