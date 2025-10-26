// exports
export const objects = [];

export class rect {
    #private = {};
    constructor(x,y,w,h) {
        Object.assign(this.#private,{x,y,w,h});
        objects.push(this);
    }

    get x() { return this.#private.x }
    draw() {
        context.fillRect(this.#private.x,this.#private.y,this.#private.w,this.#private.h);
    }

    static {
        Object.assign(this,{

        })
    }
}

function locker(...params) {
    return class {
        #private = {};
        static conditionals = {};
        constructor(...args) {
            for (let [index,key] of Object.entries(params)) {
                this[key] = args[index]
            }
        }
        static { // fuck proxies, this looks cooler
            for (let [index,key] of Object.entries(params)) {
                if (key instanceof Array) {
                    params[index] = key[0];
                    this.conditionals[key[0]] = key.slice(1);
                }
            }

            Object.defineProperties(this.prototype, Object.fromEntries(params.map(e => {
                return [e,{
                    get() {
                        return this.#private[e];
                    },
                    set(val) {
                        const cond = this.constructor.conditionals[e];
                        if (!cond) {
                            this.#private[e] = val;
                            return;
                        }
                        for (let i of cond) {
                            console.log(e,val,i,i(val));
                            if (i(val)) {
                                this.#private[e] = val;
                                return;
                            }
                        }
                        throw Error(`No conditions met for ${e}`)
                    }
                }]
            })))
        }
    }
}

locker.define = function() {

}

class test extends locker(['x', (e) => typeof e == 'number'],'y') {
    constructor(x,y) {
        super(x,y);
    }
}

const a = new test(1,2);
console.log(test.conditionals);