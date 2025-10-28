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
        if (key[0] == '/') return { type: 'any', value };
        if (key[0] == '#') return { type: 'type', value };
        if (key[0] == '@') return { type: 'pfunction', value };
        return { type: 'any', value:key };
    }
    
    innerLocker.defineProperty = function(name,conditionals) {
        if (!(conditionals instanceof Array)) conditionals = [conditionals];
        storage[name] = conditionals;
    }

    innerLocker.defineProperties = function(object) {
        for (let [name,conditionals] of Object.entries(object)) {
            innerLocker.defineProperty(name,conditionals);
        }
    }

    return innerLocker;
    function innerLocker(...params) {
        return class {
            #private = {};
            static conditionals = {};
            constructor(...args) {
                for (let [index,key] of Object.entries(params)) {
                    this[key] = args[index]
                }
            }
            static {
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
                                const {type,value} = interpreter(i);
                                let valid; 
                                switch (type) { // what is this cursed nesting lol
                                    case 'any': valid = (e => e === value)(val);
                                    break; case 'type': valid = (e => typeof e === value)(val);
                                    break; case 'function': valid = value(val);
                                    break; case 'pfunction': 
                                    for (let func of storage[value]) {
                                        if (validate(func(val))) {
                                            console.log(func(val));
                                            valid = func(val);
                                            break;
                                        }

                                    }
                                }

                                switch (validate(valid)) {
                                    case 1: this.#private[prop] = valid?.value; return;
                                    break; case 2: this.#private[prop] = val; return;
                                }

                                function validate(object) {
                                    if (object?.condition && Object.hasOwn(object,'value')) {
                                        return 1;
                                    }
                                    if (object?.condition || ( typeof object?.condition != 'boolean' && object)) {
                                        return 2;
                                    }
                                    return false;
                                }
                            }
                            console.error(`No conditions met for ${prop}`)
                        }
                    }]
                })))
            }
        }
    } 
})()

// locker.defineProperty( 'number', e => ({condition:isFinite(Number(e)), value: Number(e)}) );

locker.defineProperties({
    number: e => ({condition:isFinite(Number(e)), value: Number(e)}),
})

class test extends locker(['x','@number'],'y') {
    constructor(x,y) {
        super(x,y);
    }
}

const a = new test('123',2);

console.log(a);

{
    x: [
        {type:'class', value: Number},
        {type:'not', value: Infinity},
        {type:'not', value: -Infinity}
    ]
}