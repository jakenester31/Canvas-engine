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

// class packager {
//     constructor() {
//         console.log(this);
//     }
// }

// packager = new Proxy(packager,{
//     apply(obj,_,args) {
//         console.log(obj,func,val);
//     }
// })

function locker(...params) {
    return class {
        #private = {};
        constructor(...args) {
            for (let [index,key] of Object.entries(params)) {
                this[key] = args[index]
            }
        }
        static { // fuck proxies, this looks cooler
            Object.defineProperties(this.prototype, Object.fromEntries(params.map(e => {
                return [e,{
                    get() {
                        return this.#private[e];
                    },
                    set(val) {
                        this.#private[e] = val;
                    }
                }]
            })))
        }
    }
}

class test extends locker('x','y') {
    constructor(x,y) {
        super(x,y);
    }
}

const a = new test(1,2);
console.log(a);

// helpers

const mix = (() => {
    return function(Base, ...classes) { return classes.map(toMixin).reduce((c, mixin) => mixin(c),Base) || Object };
    function toMixin(target) {
        if (typeof target != 'function' || !target.prototype) throw TypeError('Expected class while tying to create a mixin');
        return (Base) => class extends Base {
            constructor(...args) {
                super(...args);
                const instance = new target(...args);
                Object.assign(this, instance);
            }
        }
    }
})()