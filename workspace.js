onmessage = e => {
    const data = e.data
    switch (data.type) {
        case 'initiate':
            initiate(data)
        break; case 'resize_canvas':
            resize_canvas(data);
        break; default:
            console.warn(`No matching handler for type '${data.type}'`); 
    }
}

function initiate({width,height}) {
    self.canvas = new OffscreenCanvas(width,height);
    context = canvas.getContext('2d');
    transform = {
        scale:1,
        x:0,
        y:0,
        apply() {
            context.resetTransform();
            context.translate(this.x,this.y);
            context.scale(this.scale,this.scale);
            Object.assign(transform.cache,{
                x: -transform.x / transform.scale,
                y: -transform.y / transform.scale,
                w: canvas.width / transform.scale,
                h: canvas.height / transform.scale
            })

        },
        cache: {}
    }

    transform = new Proxy(transform,{
        set(obj,prop,val) {
            obj[prop] = val;
            obj.apply();
        }
    })

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
        context.clearRect(transform.cache.x,transform.cache.y,transform.cache.w,transform.cache.h);
        context.strokeStyle = 'black';
        // draw

        context.fillStyle='green';
        context.fillRect(50,50,50,50);
        context.fillStyle='red';
        context.fillRect(50,200,100,100);

        context.fillRect(20,600,1000,100);

        const bitmap = canvas.transferToImageBitmap();
        postMessage({
            type:'draw',
            bitmap
        })

        // loop
        if (recursive)
            requestAnimationFrame(loop);
    }
})();

function resize_canvas({height,width,time}) {

    // guard
    if (width <= 0 || !isFinite(width)) return;
    if (height <= 0 || !isFinite(height)) return;

    canvas.height = height;
    canvas.width = width;

    transform.apply();
}