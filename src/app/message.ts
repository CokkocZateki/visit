export class Message {
    system: string;
    author: string;
    clear: boolean;
    text: string;
    timestamp: number;
    private _color: string;
    constructor(params) {
        this.timestamp = Date.now();
        return Object.assign(this, params);
    }

    get color(): string {
        const difference = Date.now() - this.timestamp;
        if (!this.clear) {
            if (difference < 600000) {
                this._color = '#C0392B';
            }
            if (difference > 600000 && difference < 1200000) {
                this._color = '#922B21';
            }
            if (difference > 1200000 && difference < 1800000) {
                this._color = '#641E16';
            }
            if (difference > 1800000) {
                this._color = 'black';
            }
        } else {
            if (difference < 600000) {
                this._color = '#2ECC71';
            }
            if (difference > 600000 && difference < 1200000) {
                this._color = '#239B56';
            }
            if (difference > 1200000 && difference < 1800000) {
                this._color = '#186A3B';
            }
            if (difference > 1800000) {
                this._color = 'black';
            }
        }
        return this._color;
    }
}
