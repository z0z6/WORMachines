export const keys = { w:false, a:false, s:false, d:false, space:false, shift:false, e:false };
export let mouse = { dx:0, dy:0 };

export function initInput() {
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if(k===' ') keys.space = true;
    if(k==='shift') keys.shift = true;
    if(k==='e') keys.e = true;
    if(keys.hasOwnProperty(k)) keys[k] = true;
  });
  document.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if(k===' ') keys.space = false;
    if(k==='shift') keys.shift = false;
    if(k==='e') keys.e = false;
    if(keys.hasOwnProperty(k)) keys[k] = false;
  });
  document.addEventListener('mousemove', e => {
    mouse.dx = e.movementX || 0;
    mouse.dy = e.movementY || 0;
  });
  // Reset per frame
  requestAnimationFrame(function track() {
    mouse.dx = 0; mouse.dy = 0;
    requestAnimationFrame(track);
  });
}
