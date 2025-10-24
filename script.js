const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const workspaces = new Map()
for (let i of $$('[workspace]')) {
    const worker = new Worker('workspace.js');
    workspaces.set(i,worker);

    workspaces.get(i).postMessage('something');

    workspaces.get(i).onmessage = e => {
        console.log(e.data);
    }
}

console.log(workspaces);