//import * as _ from './lodash';

class SignalItem {
    constructor(timestamp: any, value: boolean = undefined) {
        if (timestamp instanceof SignalItem) {
            this.timestamp = timestamp.timestamp;
            this.value = timestamp.value;
        }
        else if (timestamp instanceof Array) {
            if (timestamp.length >= 2) {
                this.timestamp = timestamp[0];
                this.value = timestamp[1];
            }
        }
        else {
            this.timestamp = timestamp;
            this.value = value;
        }
    }

    timestamp: number;
    value: boolean;

    get clone(): SignalItem {
        return new SignalItem(this.timestamp, this.value);
    }

    toString(): string {
        return "[" + this.timestamp + ", " + this.value + "]";
    }
}

export class Signal {
    constructor(items: any[]) {
        this.items = [];
        for (let i in items) {
            this.items.push(new SignalItem(items[i]));
        }
    }

    items: SignalItem[];

    get clone(): Signal {
        let res = new Signal([]);
        for (let i = 0; i < this.items.length; i++)
            res.items.push(this.items[i].clone);
        return res;
    }

    get not(): Signal {
        let res = this.clone;
        for (let i = 0; i < res.items.length; i++)
            res.items[i].value = !res.items[i].value;
        return res;
    }

    valueAt(t: number): boolean {
        for (let i = this.items.length-1; i >= 0; i--) {
            let m = this.items[i];
            if (t >= m.timestamp)
                return m.value;
        }
        return undefined;
    }

    unionTimestamps(s2: Signal): number[] {
        let s1 = this;
        if (s1.items.length == 0)
            return s2.items.map(d => d.timestamp);
        let res: number[] = [];
        let n2 = 0;
        let t1 = s1.items[0].timestamp;
        while (true) {
            if (n2 >= s2.items.length)
                break;
            let t2 = s2.items[n2].timestamp;
            if (t2 > t1)
                break;
            n2++;
        }
        for (let n1 = 0; n1 < s1.items.length; n1++) {
            let t1 = s1.items[n1].timestamp;
            while (true) {
                if (n2 >= s2.items.length)
                    break;
                let t2 = s2.items[n2].timestamp;
                if (t2 >= t1)
                    break;
                res.push(t2);
                n2++;
            }    
            res.push(t1);          
        }
        return res;
    }

    private binaryOperator(s2: Signal, oper: (d1: boolean, d2: boolean) => boolean): any {
        let s1 = this;
        let ts = s1.unionTimestamps(s2);
        let v1s = ts.map(d => s1.valueAt(d));
        let v2s = ts.map(d => s2.valueAt(d));
        let vs: SignalItem[] = [];
        let v: boolean = undefined;
        for (let i = 0; i < ts.length; i++) {
            let t = ts[i];
            let vn = oper(s1.valueAt(t), s2.valueAt(t));
            if ((v === undefined) && (vn === undefined))
                continue;
            if (vn === undefined)
                continue;
            if (v == vn)
                continue;
            v = vn;
            vs.push(new SignalItem(t, v));
        }
        return new Signal(vs);
    }

    and(s2: Signal): any {
        return this.binaryOperator(s2, (d1: boolean, d2: boolean) => (d1 && d2));
    }

    or(s2: Signal): any {
        return this.binaryOperator(s2, (d1: boolean, d2: boolean) => (d1 || d2));
    }

    toString(): string {
        return "[" + this.items.map(d => d.toString()).join(", ") + "]";
    }
}