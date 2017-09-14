import * as OS from 'os';
import * as FS from 'fs';
const path = require('path');

export class Platform {
    charset: string;
    name: string;
    logs: string;
    fs: any;
    constructor() {
        this.charset = 'ucs2';
        this.fs = FS;
        this.name = OS.platform();
        const user = OS.userInfo();
        switch (this.name) {
            case 'linux':
                this.logs = `${user.homedir}/.eve/wineenv/drive_c/users/${user.username}/My\ Documents/EVE/logs/Chatlogs`;
                break;
            case 'darwin':
                this.logs = `${user.homedir}/Documents/EVE/logs/Chatlogs`;
                break;
            default:
                // this.logs = `${user.homedir}\\Documents\\EVE\\logs\\Chatlogs`;
                this.logs = path.join(path.resolve(user.homedir), '/Documents/EVE/logs/Chatlogs');
                break;
        }
    }
}
