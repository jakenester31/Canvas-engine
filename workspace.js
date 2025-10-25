onmessage = e => {
    const data = e.data
    switch (data.type) {
        case 'initiate':
            initiate(data)
        break; case 'resize_canvas':
            resize_canvas(data);
        break; case 'dpi':
            dpr = data.dpr
        break; default:
            console.warn(`No matching handler for type '${data.type}'`); 
    }
}

function initiate({width,height,dpr}) {
    self.canvas = new OffscreenCanvas(width,height);
    context = canvas.getContext('2d');
    transform = {
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

        context.fillStyle='green';
        context.fillRect(50,50,50,50);
        context.fillStyle='red';
        context.fillRect(50,200,100,100);

        context.fillRect(20,600,1000,100);


        postMessage({
            type:'draw',
            bitmap:canvas.transferToImageBitmap()
        })

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