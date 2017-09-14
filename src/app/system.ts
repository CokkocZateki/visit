export class System {
    id: number;
    name: string;
    region: string;

    constructor(params) {
        return Object.assign(this, params);
    }
}
