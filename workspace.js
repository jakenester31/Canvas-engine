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

function initiate({canvas}) {
    self.canvas = canvas;
    self.context = canvas.getContext('2d');
    workspace = {
        scale:'initial',
        x:0,
        y:0
    }
    mainLoop();
}


var [mainLoop,step] = (() => {
    const start = 'loop has already started';
    return [
        function() {
            loop();
            console.log(mainLoop);

            mainLoop = () => { 
                console.warn(start);
                return start;
            };
            console.log(self.mainLoop);
        },
        () => loop(false)
    ]

    function loop(recursive = true) {
        // transform
        context.resetTransform();
        context.translate(workspace.x,workspace.y);
        context.scale(workspace.scale,workspace.scale);
        context.clearRect(-workspace.x / workspace.scale,-workspace.y / workspace.scale,canvas.width / workspace.scale,canvas.height / workspace.scale);
        context.strokeStyle = 'black';
        // draw

        context.fillRect(50,50,50,50);
        context.fillRect(50,200,100,100);


        // loop
        if (recursive)
            requestAnimationFrame(loop);
    }
})();

function resize_canvas({height,width}) {
    // just in case
    if (width <= 0 || !isFinite(width)) return;
    if (height <= 0 || !isFinite(height)) return;

    // save & update
    let oldWidth = canvas.width;
    let oldHeight = canvas.height;

    canvas.height = height;
    canvas.width = width;

    const scaleWidth = canvas.width / oldWidth;

    // consistent initial props
    if (workspace.scale == 'initial')
        workspace.scale = canvas.width / 500 / scaleWidth;

    // adjust workspace
    workspace.scale *= scaleWidth;
    workspace.x *= scaleWidth;
    workspace.y = canvas.height / 2 - (oldHeight / 2 - workspace.y) * scaleWidth;

    // step();
    // requestAnimationFrame(step);
}