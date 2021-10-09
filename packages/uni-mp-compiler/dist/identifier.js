"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IdentifierGenerator {
    constructor() {
        this._chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this._nextIds = [0];
    }
    next() {
        const r = [];
        for (const char of this._nextIds) {
            r.unshift(this._chars[char]);
        }
        this._increment();
        return r.join('');
    }
    _increment() {
        for (let i = 0; i < this._nextIds.length; i++) {
            const val = ++this._nextIds[i];
            if (val >= this._chars.length) {
                this._nextIds[i] = 0;
            }
            else {
                return;
            }
        }
        this._nextIds.push(0);
    }
    *[Symbol.iterator]() {
        while (true) {
            yield this.next();
        }
    }
}
exports.default = IdentifierGenerator;