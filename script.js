const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const workspaces = new Map()
for (let canvas of $$('canvas[workspace]')) {
    // setup
    const worker = new Worker('workspace.js');
    workspaces.set(canvas,worker);

    const context = canvas.getContext('2d');

    worker.postMessage({
        type:'initiate',
        width:canvas.clientWidth,
        height:canvas.clientHeight
    })

    let bitmap;
    // listeners
    worker.onmessage = e => {
        const data = e.data;
        switch (data.type) {
            case 'draw':
                bitmap = data.bitmap;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(data.bitmap,0,0);
            break; default: 
                console.warn(`No matching handler for type '${data.type}'`); 
        }
    }

    new ResizeObserver(e => {
        if (canvas.clientWidth <= 0 || !isFinite(canvas.clientWidth)) return;
        if (canvas.clientHeight <= 0 || !isFinite(canvas.clientHeight)) return;

        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        if (bitmap)
            context.drawImage(bitmap,0,0);

        worker.postMessage({
            type:'resize_canvas',
            width:canvas.width,
            height:canvas.height
        })
    }).observe(canvas);
}

// 1:03