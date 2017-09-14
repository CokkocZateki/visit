import { Platform } from './platform';
const path = require('path');

export class Channel {
    name: string;
    platform: Platform;
    private _file: string;

    constructor(name: string) {
        this.name = name;
        this.platform = new Platform();
    }

    get file(): string {
        const rName = new RegExp(`${this.name}`, 'i');
        let _tmp = [];
        _tmp = this.platform.fs.readdirSync(this.platform.logs).map(file => {
            if (rName.test(file)) {
                return file;
            }
        });
        _tmp = _tmp.filter(Boolean);
        return path.join(this.platform.logs, _tmp[_tmp.length - 1]);
    }
}
