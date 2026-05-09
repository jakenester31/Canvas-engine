const locker = (function(){
    return innerLocker;
    function innerLocker() {

    }
}())

function isInt(a) { return isFinite(a) && Math.round(a) === +a }
function replace(target,withValues) {
    if (target === withValues) throw Error(`Cannot replace an object with itself`);
    if (target instanceof Array) target.length = 0;
    for (let key in target){ delete target[key] }
    return Object.assign(target,withValues);
}
function entrify(target,func,callback) { return Object.fromEntries(func.call(Object.entries(target),callback)) }
function argumentTypeError(functionName,argument,type,value) { 
    const a = 'a' + ('euioa'.includes(String(type)[0]) ? 'n' : '');
    throw TypeError(`${functionName}() requires the '${argument}' argument to be ${a} ${type} but got '${value}' instead`) 
}

const safeIterator = (function(){
    function intError(name,value) { argumentTypeError('safeIterator',name,'integer',value) }
    function remove(start,count) {
        if (!isInt(start)) 
            if (count === undefined) return void this.storage.push({type:'delete',start});
            else intError('start',start);
        if (start < 0) start = this.indexes.length + start;
        if (count === undefined) return void this.storage.push({type:'delete',start}); 
        if (!isInt(count)) intError('count',count);
        if (count <= 0) return; // silent fail
        this.storage.push({type:'delete',start,count}); 
        this.indexes.slice(start,+start + count).forEach(e => this.deleted.add(e));
    }

    function insert(start,...items) {
        if (!isInt(start)) intError('start',start);
        if (!items.length) return; // silent fail
        if (start < 0) start = this.indexes.length + start;
        this.storage.push({type:'insert',start,items});
    }

    const FILTER = Array.prototype.filter;
    function applyAll(target,logs) {
        const FILLER = [], 
        inserts = {};
        // handles deleting and ordering insert logs.
        for (let log of logs) switch (log.type) {
            case 'delete':
                if (log.count) target.splice(log.start,log.count,...Array(log.count).fill(FILLER));
                else delete target[log.start];
            break; case 'insert':
                if (!inserts[log.start]) inserts[log.start] = [];
                inserts[log.start].unshift(log);
            break; default: throw TypeError(`No matching types for ${log.type}`);
        }
        // handles ordered insert logs.
        const keys = Object.keys(inserts);
        while (keys.length > 0) for (let log of inserts[keys.pop()]) target.splice(log.start,0,...log.items);
        // cleans up artifacts of remove 
        const replacer = target instanceof Array ? target.filter(e => e !== FILLER) : [];
        Object.assign(replacer,entrify(target,FILTER,e => !isInt(e[0])));
        replace(target,replacer);
    }

    return function(target,callback) {
        const data = {
            storage:[], 
            deleted: new Set(),
            indexes:Object.keys(target).filter(e => e >= 0 && isInt(e) ).map( e => +e ),
        }, 
        _remove = remove.bind(data), 
        _insert = insert.bind(data);
        const entries = Object.entries(target).length > 0 ? Object.entries(target) : ( target.entries?.() || [] );
        for (let [key,value] of entries) {
            if (isInt(key)) key = +key;
            if (data.deleted.has(key)) continue;
            callback({target,key,value,remove:_remove,insert:_insert});
        }
        applyAll(target,data.storage);
    }
}())

const pathFinder = (function(){ // nestedIterator / deepIterator
    function inner(target,callback,predicate,depth) {
        safeIterator(target,({target,key,value,remove,insert}) => {
            const isObject = typeof target[key] == 'object' && target[key] !== null ? target[key].constructor.name : false;
            const args = {target,key,value,remove,insert,depth,isObject}; 
            if (!predicate(args)) return;
            if (typeof target[key] == 'object' && target[key] !== null) inner(target[key],callback,predicate,depth + 1);
            callback(args);
        })
    }
    function funcError(name,value) { argumentTypeError('pathFinder',name,'function',value) }
    return function(target,callback,predicate = _ => true) {
        if (typeof callback != 'function') funcError('callback',callback);
        if (typeof predicate != 'function') funcError('predicate',predicate);
        inner(target,callback,predicate,0) 
    }
}())

const a = [
    1,[2,[3]],
    new Map([['a',41],['b',42]]),
    5,
    new Set([1,2,3,4,5,1]),
    new Uint8Array([1,2,3,4]),
    new Uint16Array([1,2,3]),
    new Uint32Array([1,2]),
];
a.x = ['yz'];

pathFinder(a,({target,key,value,depth}) => {
    console.log(depth,key,value);
})

// console.log(a);