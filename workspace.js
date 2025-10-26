import {objects, rect} from './classes.js';

new rect(50,50,50,50);


onmessage = e => {
    const data = e.data
    switch (data.type) {
        case 'initiate':
            initiate(data)
        break; case 'resize_canvas':
            resize_canvas(data);
        break; case 'dpi':
            dpr = data.dpr;
        break; default:
            console.warn(`No matching handler for type '${data.type}'`); 
    }
}

function initiate({width,height,dpr}) {
    self.canvas = new OffscreenCanvas(width,height);
    self.context = canvas.getContext('2d',{ willReadFrequently:true });

    self.transform = {
        scale:1,
        x:0,
        y:0,
        apply() {
            context.resetTransform();
            context.translate(this.x,this.y);
            context.scale(this.scale * dpr,this.scale * dpr);
            Object.assign(transform.cache,[
                -transform.x / transform.scale,
                -transform.y / transform.scale,
                canvas.width / transform.scale,
                canvas.height / transform.scale
            ])
        },
        cache: []
    }

    transform = new Proxy(transform,{
        set(obj,prop,val) {
            obj[prop] = val;
            obj.apply();
        }
    })

    self.dpr = dpr
    transform.apply();

    mainLoop();
}

var [mainLoop,step] = (() => {
    const start = 'loop has already started';
    return [
        function() {
            loop();

            mainLoop = () => { 
                console.warn(start);
                return start;
            };
        },
        () => loop(false)
    ]

    function loop(recursive = true) {
        context.clearRect(...transform.cache);
        context.strokeStyle = 'black';

        // draw



        for (let i of objects) {
            i.draw();
        }

        compareAndPost()
        // loop
        if (recursive)
            requestAnimationFrame(loop);
    }
})();

function resize_canvas({width,height}) {
    canvas.height = height;
    canvas.width = width;
    transform.apply();
}

const compareAndPost = (() => {
    let lastData;
    return function() {
        const h1 = hash(context.getImageData(0,0,canvas.width,canvas.height).data);
        const h2 = lastData;
        lastData = h1;
        if (h1 !== h2) {
            postMessage({
                type:'draw',
                bitmap:canvas.transferToImageBitmap()
            })
        }
    }

    function hash(data) {
        let a = 1, b = 0;
        const MOD = 65521;
        for (let i = 0; i < data.length; i++) {
            a = (a + data[i]) % MOD;
            b = (b + a) % MOD;
        }
        return (b << 16) | a;
    }
})()