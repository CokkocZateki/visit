import { Platform } from './platform';
import { Channel } from './channel';
import { System } from './system';
import { Message } from './message';

export class Character {
    platform: Platform;
    name: string;
    logs: string;
    portrait: string;
    system: System;
    local: Channel;
    channels: Channel[];
    intel: Message[];
    private _watched: Channel;

    constructor(params) {
        this.name = params.name;
        this.portrait = './assets/default_avatar.jpg';
        this.intel = [];
        this.platform = new Platform();
        this.logs = this.platform.logs;
        this.local = this.getLocal();
        this.system = new System({});
        this.updateSystem();
        this.channels = this.getChannels();
    }

    saveSettings() {
        localStorage.removeItem('character');
        const _settings = {
            name: this.name,
            log: this.logs,
            portrait: this.portrait,
            watched: this.watched.name
        };
        localStorage.setItem('character', JSON.stringify(_settings));
    }

    set watched(channel: Channel) {
        this._watched = channel;
    }

    get watched(): Channel {
        return this._watched;
    }

    getChannelName(filename: string) {
        const rChannelName = new RegExp(`(.*)_${(new Date).getFullYear()}`);
        const match = filename.match(rChannelName);
        return match ? match[1] : '';
    }

    getCharacterName(file: string): string {
        const rName = /Listener: +([^ ].*)/i;
        const match = file.match(rName);
        return match ? match[1] : '';
    }
    getChannels() {
        const result = [];
        this.platform.fs.readdir(this.platform.logs, (err, chatFiles) => {
            if (err) {
                console.log(err);
            }
            chatFiles.forEach(chatFileName => {
                this.platform.fs.readFile(`${this.platform.logs}/${chatFileName}`, this.platform.charset, (_err, fileContent) => {
                    if (this.name === this.getCharacterName(fileContent)) {
                        const channelName = this.getChannelName(chatFileName);
                        if (!result.find(c => c.name === channelName)) {
                            result.push(new Channel(channelName));
                        }
                    }
                });
            });
        });
        return result;
    }

    getLocal() {
        // FIXME: Файл с русскоязычным именем всегда последний.
        const rChannelName = /Lo[ck]al|Локальный/i;
        let local: Channel;
        const files = this.platform.fs.readdirSync(this.logs).map(file => {
            return {
                name: file,
                time: this.platform.fs.statSync(`${this.logs}/${file}`).mtime.getTime()
            };
        })
            .sort((a, b) => {
                return a.time - b.time;
            })
            .map(v => {
                return v.name;
            });

        files.reverse().forEach(channel => {
            if (!local) {
                if (rChannelName.test(channel)) {
                    const filePath = `${this.logs}/${channel}`;
                    const file = this.platform.fs.readFileSync(filePath, this.platform.charset);
                    if (this.getOwner(file) === this.name) {
                        local = new Channel(this.getChannelName(channel));
                    }
                }
            }
        });
        return local;
    }

    getOwner(file) {
        const rName = /Listener: +([^ ].*)/i;
        return file.match(rName)[1];
    }

    getSystem() {
        const rChannelID = /Channel ID: .*, ([0-9]+)/i;
        const file = this.platform.fs.readFileSync(this.local.file, this.platform.charset);
        const _id = file.match(rChannelID)[1];
        return new System({
            id: Number(_id)
        });
    }

    updateLocal() {
        this.local = this.getLocal();
    }

    updateSystem() {
        let system: System;
        const rSystemName = /Ch.*Lo[ck]al ?: ([\w\-]+)|Ка.*Локальный ?: ([\w\-]+)/g;
        const file = this.platform.fs.readFileSync(this.local.file, this.platform.charset);

        let _match = file.match(rSystemName);

        if (_match) {
            const last = _match[_match.length - 1];
            _match = rSystemName.exec(last);
            this.system.name = _match.filter(Boolean)[1];
        } else {
            system = this.getSystem();
            this.system = system;
        }
    }

    watch() {
        this.platform.fs.watch(this.logs, (event, file) => {
            if (event === 'rename') {
                if (this.getChannelName(file) === this.local.name) {
                    this.updateLocal();
                }
            } else if (event === 'change') {
                if (this.getChannelName(file) === this.local.name) {
                    this.updateSystem();
                } else if (this.getChannelName(file) === this.watched.name) {
                    this.readIntel();
                }
            }
        });
    }

    checkFiles() {
        this.platform.fs.readFileSync(this.local.file);
        this.platform.fs.readFileSync(this.watched.file);
    }

    readIntel() {
        const regexp = /(\w+\-\w+)/;
        this.platform.fs.readFile(this.watched.file, this.platform.charset, (err, content) => {
            const _file = content.split('\n');
            const message = _file[_file.length - 2];
            if (regexp.test(message)) {
                this.makeMessage(message);
            }
        });
    }

    makeMessage(message: string) {
        const regexp = /(\w+\-\w+)/;
        const rAuthor = /] (.+) >/;
        const system = message.match(regexp)[0];
        const author = message.match(rAuthor)[1];
        // Status request
        if (/status/i.test(message)) {
            // skip
        } else {
            let clear: Boolean;
            if (/clear|clr|clean|blue/i.test(message)) {
                clear = true;
            } else {
                clear = false;
            }
            this.intel.push(new Message({
                system: system,
                author: author,
                clear: clear,
                text: message.match(/.*> (.*)/)[1].replace(system, '').trim()
            }));
        }
    }

}
