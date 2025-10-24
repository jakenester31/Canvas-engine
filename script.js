const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const workspaces = new Map()
for (let canvas of $$('canvas[workspace]')) {
    // setup
    const worker = new Worker('workspace.js');
    const worker_canvas = canvas.transferControlToOffscreen();
    workspaces.set(canvas,worker);

    worker.postMessage({
        type:'initiate',
        canvas:worker_canvas
    },[worker_canvas])

    // listeners
    worker.onmessage = e => {
        console.log(e.data);
    }

    new ResizeObserver(e => {
        if (canvas.clientWidth <= 0 || !isFinite(canvas.clientWidth)) return;
        if (canvas.clientHeight <= 0 || !isFinite(canvas.clientHeight)) return;

        worker.postMessage({
            type:'resize_canvas',
            height:canvas.clientHeight,
            width:canvas.clientWidth
        })
    }).observe(canvas);
}

