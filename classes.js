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

const locker = (function(){
    const storage = {};
    

    function interpreter(key) {
        if (typeof key == 'function') return { type: 'function', value:key };
        if (typeof key != 'string') return { type: 'any', value:key };
        const value = key.slice(1);
        if (key[0] == '/') return { type: 'string', value };
        if (key[0] == '#') return { type: 'type', value };
        if (key[0] == '@') return { type: 'pfunction', value };
        return { type: 'string', value:key };
    }
    
    innerlocker.define = function(name,conditionals) {
        if (!conditionals instanceof Array) conditionals = [conditionals];
        storage[name] = conditionals;
        console.log(storage);
    }

    function innerlocker(...params) {
        return class {
            #private = {};
            static conditionals = {};
            constructor(...args) {
                for (let [index,key] of Object.entries(params)) {
                    this[key] = args[index]
                }
            }
            static { // what is this cursed nesting lol
                for (let [index,key] of Object.entries(params)) {
                    if (key instanceof Array) {
                        params[index] = key[0];
                        this.conditionals[key[0]] = key.slice(1);
                    }
                }

                Object.defineProperties(this.prototype, Object.fromEntries(params.map(prop => {
                    return [prop,{
                        get() {
                            return this.#private[prop];
                        },
                        set(val) {
                            const cond = this.constructor.conditionals[prop];
                            if (!cond) {
                                this.#private[prop] = val;
                                return;
                            }
                            for (let i of cond) {
                                console.log(interpreter(i))
                                const {type,value} = interpreter(i);
                                let valid; 
                                switch (type) {
                                    case 'any':
                                    case 'string': valid = (e => e === value)(val);
                                    break; case 'type': valid = (e => typeof e === value)(val);
                                    break; case 'function': valid = value(val);
                                    break; case 'pfunction': valid = storage[value]?.(val);
                                }
                                if (valid) {
                                    this.#private[prop] = val;
                                    return;
                                }
                            }
                            // throw Error(`No conditions met for ${prop}`)
                            console.error(`No conditions met for ${prop}`)
                        }
                    }]
                })))
            }
        }
    } 
    return innerlocker;
})()

locker.define('number',(e) => typeof e == 'number');

class test extends locker(['x','@number'],'y') {
    constructor(x,y) {
        super(x,y);
    }
}

const a = new test(3,2);