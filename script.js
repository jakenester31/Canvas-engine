const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const workspaces = new Map()
for (let canvas of $$('canvas[workspace]')) {
    // setup
    const worker = new Worker('./workspace.js',{type:'module'});
    worker.addEventListener('error', e => {
        console.error(e);
    },false);
    workspaces.set(canvas,worker);

    const context = canvas.getContext('2d');

    worker.postMessage({
        type:'initiate',
        width:canvas.clientWidth,
        height:canvas.clientHeight,
        dpr:devicePixelRatio
    })

    let bitmap;
    // listeners
    worker.onmessage = e => {
        const data = e.data;
        switch (data.type) {
            case 'draw':
                bitmap = data.bitmap;
                context.drawImage(data.bitmap,0,0);
            break; default: 
                console.warn(`No matching handler for type '${data.type}'`); 
        }
    }

    new ResizeObserver(_ => {
        if (canvas.clientWidth <= 0 || !isFinite(canvas.clientWidth)) return;
        if (canvas.clientHeight <= 0 || !isFinite(canvas.clientHeight)) return;

        canvas.height = Math.ceil(canvas.clientHeight * devicePixelRatio);
        canvas.width = Math.ceil(canvas.clientWidth * devicePixelRatio);
        if (bitmap)
            context.drawImage(bitmap,0,0);

        worker.postMessage({
            type:'resize_canvas',
            height:canvas.height,
            width:canvas.width,
        })
    }).observe(canvas);

    matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener('change', _ => {
        worker.postMessage({
            type:'dpi',
            dpr:devicePixelRatio
        })
    })


}

// 1:03