const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const workspaces = new Map()
for (let canvas of $$('canvas[workspace]')) {
    // setup
    const worker = new Worker('workspace.js');
    workspaces.set(canvas,worker);

    const worker_canvas = canvas.transferControlToOffscreen();

    worker.postMessage({
        type:'initiate',
        canvas:worker_canvas
    },[worker_canvas])

    worker.postMessage({type:'test'})

    // listeners
    worker.onmessage = e => {
        const data = e.data;
        switch (data.type) {
            default: 
                console.warn(`No matching handler for type '${data.type}'`); 
        }
    }

    new ResizeObserver(e => {
        if (canvas.clientWidth <= 0 || !isFinite(canvas.clientWidth)) return;
        if (canvas.clientHeight <= 0 || !isFinite(canvas.clientHeight)) return;

        worker.postMessage({
            type:'resize_canvas',
            height:canvas.clientHeight,
            width:canvas.clientWidth,
        })
    }).observe(canvas);
}