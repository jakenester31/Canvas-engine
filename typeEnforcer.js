const locker = (function(){
    return innerLocker;
    function innerLocker() {

    }
}())

function mod(a,b) { return ((a % b) + b) % b }
function isInt(a) { return isFinite(a) && Math.round(a) === +a }
function replace(target,replacer) {
    if (target instanceof Array) target.length = 0;
    for (let key in target){ delete target[key] }
    for (let key in replacer) { target[key] = replacer[key] }
}
function toAndFromEntries(target,func,callback) { return Object.fromEntries(func.bind(Object.entries(target))(callback)) }


const safeIterator = (function(){
    function remove(start,count) {
        if (!count) {
            this.storage.push({type:'delete',start}); 
            return;
        }
        if (!isInt(start)) throw TypeError(`start must be an integer`);
        start = mod(start,this.indexes.length);
        this.storage.push({type:'delete',start,count}); 
        this.indexes.slice(start,+start + count).forEach(e => this.deleted.add(e))
    }

    function insert(start,...items) { this.storage.push({type:'insert',start,items}); }

    function applyAll(target,logs) {
        const FILLER = [];
        const ordered = {};
        for (let log of logs) {
            switch (log.type) {
                case 'delete':
                    if (log.count)
                        target.splice(log.start,log.count,...Array(log.count).fill(FILLER));
                    else delete target[log.start];
                break; case 'insert':
                    if (!ordered[log.start])
                        ordered[log.start] = [];
                    ordered[log.start].unshift(log)
                break; default:
                throw Error(`No matching types for ${log.type}`);
            }
        }

        const keys = Object.keys(ordered);
        for (let i = keys.length; i > 0; i--) {
            let logs = ordered[keys.pop()]
            for (let log of logs) {
                console.log(log)
                target.splice(log.start,0,...log.items);
            }
        }

        // console.log('ordered',ordered)


        const replacer = [];
        if (target instanceof Array) Object.assign(replacer,target.filter(e => e !== FILLER));
        Object.assign(replacer,Object.fromEntries( Object.entries(target).filter(e => !isInt(e[0])) ));
        replace(target,replacer);
    }

    return function(target,func) {
        const c = {
            storage:[],
            indexes:Object.keys(target).filter(e => e >= 0 && isInt(e) ).map( e => +e ),
            deleted: new Set()
        }
        _remove = remove.bind(c),
        _insert = insert.bind(c);
        for (let key in target) {
            if (isInt(key)) key = +key;
            if (c.deleted.has(key)) continue;
            func({target,key,remove:_remove,insert:_insert});
        }
        applyAll(target,c.storage);
    }
}())

// const a = {a:1,b:2,c:3,d:4};
const a = [1,2,3,4];
a.x = 'yz';

safeIterator(a,({target,key,remove,insert}) => {
    console.log('ITER',key,target[key]);
    if (target[key] % 2 == 0) {
        // remove(key);
        insert(key,'inserted');
        insert(key,'in2');
    }
})

console.log(a);