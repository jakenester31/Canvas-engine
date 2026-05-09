class Validator {
    constructor(map) {
        for (let i in map) {
            const e = map[i];
            if (typeof e.validate != 'function') {
                e.validate = () => false;
                if (typeof e.set == 'function')
                    e.validate = () => true;
            }
            if (typeof e.set != 'function')
                e.set = (val) => val;
            if (typeof e.get != 'function')
                e.get = (val) => val;
        }

        return new Proxy(this,{
            set(obj,prop,val) {
                const check = map[prop];
                if (!check?.validate(val)) return;
                return Reflect.set(obj,prop,check.set(val));
            },
            get(obj,prop) {
                // console.log(prop);
                const check = map[prop];
                const real = Reflect.get(obj,prop);
                return check ? check.get(real) : real;
            }
        })
    }
}

// const a = new Validator({
//     test:{
//         validate(val) { return true }
//     }
// })

// a.test = {a:{b:1}};
// console.log(a.test.a.b)

// abstract
class Base {
    static instances = [];
    constructor(map) {
        // super(map)
        Base.instances.push(this);
    }
    draw() { context.fillText('ERR',this?.x,this?.y) }
} export const objects = Base.instances;

class Node extends Base {
    fill = {
        style:'fill', // fill (drawn), null (not drawn), clear (erase)
        color:'black' // any color name, hex, rgb, or hsl
    }
    border = {
        style:'fill',
        color:'black',
        width:0 // type Number
    }
    position = Object.assign(new Vector(0,0),{
        origin:'absolute', // absolute (relative to (0,0)), object (relative to specified object)
    })

    constructor(x,y,map) {
        super(map);
        this.position.x = x;
        this.position.y = y;
    }
}

// simple
class Vector extends Validator {
    static #valid = {
        validate(val) { return isFinite(val) && val != null },
        set(val) { return +val }
    }
    static #rules = {
        x: Vector.#valid,
        y: Vector.#valid,
        origin: {
            validate(val) { return val == 'absolute' || val instanceof Node }
        }
    }
    constructor(x,y) {
        super(Vector.#rules);
        Object.assign(this,{x,y});
    }
}

// const a = new Node(0,0);

// drawn
export class Rect extends Node {
    constructor(x,y,w,h) {
        super(x,y);
        Object.assign(this,{
            dimensions: {
                width:w, // type Number
                height:h // type Number
            }
        })
    }
    draw() {
        context.fillRect(this.position.x,this.position.y,this.dimensions.width,this.dimensions.height);
    }
}

const a = new Rect(1,2,3,4);
// console.log(a)


// function interpreter(key) {
//     if (typeof key == 'function') return { type: 'function', value:key };
//     if (typeof key != 'string') return { type: 'any', value:key };
//     const value = key.slice(1);
//     if (key[0] == '/') return { type: 'any', value };
//     if (key[0] == '#') return { type: 'type', value };
//     if (key[0] == '@') return { type: 'pfunction', value };
//     return { type: 'any', value:key };
// }