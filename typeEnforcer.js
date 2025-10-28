const locker = (function(){
    return innerLocker;
    function innerLocker() {

    }
}())

// const a = ['a','b','c','d'];
// // a.x = 'yz';
// console.log('INPUT >> ',a,'\n');

// safeIterator(a, ({target,index,key,keys}) => {
//     console.log('AT',key,`(${index}) >>`,target[key]);
//     // target.splice(index,1);
//     target.splice(key,0,NaN,NaN)
//     console.log();
// })

// console.log('RESULT >>',a);

// function safeIterator(target,func) {
//     if (typeof func != 'function') throw TypeError(`Parameter func must be a function`);
//     if (Object.hasOwn(target,'splice')) {
//         var splice = target.splice
//         console.warn("Temporary overwriting targets splice function. Don't worry, it'll come back after safeIterator finishes");
//     }
//     const innerSplice = Array.prototype.splice.bind(target);
//     const FILLER = [];
//     if (true)
//         Object.defineProperty(target,'splice',{
//             value(start,deleteCount,...items) {
//                 // js similarity compat
//                 if (+start != start) start = 0;
//                 if (!isFinite(start)) return; //silent death
//                 // key vs index compat
//                 const temp = {}
//                 temp.indexes = keys.filter(e => e >= 0 && Math.round(e) == e )
//                 temp.keys = keys.filter(e => !temp.indexes.includes(e) )

//                 // general
//                 originalStart = start;
//                 start = mod(start, temp.indexes.length) || 0;
                
//                 // delete compat
//                 index += Math.min(0,Math.max(start - index - 1,-deleteCount,-temp.indexes.length));
//                 temp.indexes.splice(temp.indexes.length - deleteCount, deleteCount);

//                 // add compat
//                 const offset = Math.max(0,Math.min(start - index + items.length - 0));
//                 index += offset;

//                 temp.indexes.splice(start,items.length,...Array(items.length).fill(FILLER));
//                 for (let i in items) temp.indexes.push(String(+temp.indexes.length + 1));


//                 // debug
//                 console.log('SPLICE',start,deleteCount,items)
//                 console.log('KEYS',temp.indexes);

//                 // splice
//                 keys = [].concat(...Object.values(temp));
//                 innerSplice(start,deleteCount,...items);


//                 console.log('OBJECT', target);

//             }
//         })

//     var lock = 0;
//     var keys = Object.keys(target)
//     for (var index = 0, key = keys[index]; index < keys.length; index++, key = keys[index]) {
//         // if (key === FILLER) continue;
//         if (Math.round(key) === key) key = +key;
//         func({target,index,key,keys})
//         lock++;
//         if (lock > 5)
//             break;
//     }
// }

function mod(a,b) { return ((a % b) + b) % b }


const a = [1,2,3,4];
a.x = 'yz';

safeIterator(a,({target,key}) => {
    console.log(target[key]);
})

const safeIterator = (function(){
    function remove(start,count) {

    }

    function insert(start,...items) {

    }

    return function(target,func) {
        const cache = [];
        for (let key in target) {
            func({target,key,remove,insert})
        }
    }
}())