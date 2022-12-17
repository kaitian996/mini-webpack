export class SyncHook {
    private taps: { name: string; callback: Function }[]
    constructor() {
        this.taps = []
    }
    public tap(name: string, callback: Function) {
        this.taps.push({
            name,
            callback
        })
    }
    public call(...args: any[]) {
        this.taps.forEach(tap => {
            tap.callback.call(this, ...args)
        })
    }
}