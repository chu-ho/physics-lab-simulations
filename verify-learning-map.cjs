'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {domHarness} = require('./tools/dom-harness.cjs');
const read = file => fs.readFileSync(path.join(__dirname,file),'utf8');
const html = read('library.html');

function openMap(hash = '', state = null) {
  const {ids,sandbox} = domHarness(html);
  const listeners = new Map();
  sandbox.window.addEventListener = (name,handler) => listeners.set(name,handler);
  sandbox.location.hash = hash;
  sandbox.history.state = state;
  sandbox.history.replaceState = value => { sandbox.history.state = value; };
  sandbox.history.pushState = (value,_,fragment) => {
    sandbox.history.state = value;
    sandbox.location.hash = fragment;
  };
  for (const [,source] of html.matchAll(/<script src="([^"]+)"/g)) {
    vm.runInContext(read(source),sandbox,{filename:source});
  }
  return {ids,sandbox,listeners};
}

const {ids,sandbox,listeners} = openMap();
const graph = ids['map-board'].children;
assert.equal(graph.find(node=>node.className==='map-legend').children.length,4);
assert.equal(graph.filter(node=>node.className==='map-point map-hub').length,19);
const catalogue = vm.runInContext('experiments',sandbox);
assert.equal(graph.filter(node=>node.className==='map-point').length,catalogue.length);
for (const lab of catalogue) {
  if (['projectile','stairs','inclined-projectile'].includes(lab.id)) {
    assert.ok(fs.existsSync(path.join(__dirname,lab.href)));
  } else {
    assert.equal(lab.href,'mechanics.html#experiment='+lab.id);
  }
}
const activate = node => node.listeners.click({preventDefault(){}});
for (const [query,chapter,id,href] of [
  ['腳踏車煞車','1.2','bicycle-friction'],
  ['透鏡遮一半','2.2','half-lens'],
  ['光電效應','4.2','photoelectric']
]) {
  ids['map-search'].value = query;
  ids['map-search'].listeners.input();
  const result = ids['map-results'].children.find(node => node.href === '#map-'+chapter+'/'+id);
  assert.ok(result, query);
  activate(result);
  assert.equal(sandbox.location.hash,result.href);
  assert.equal(ids['map-lab-'+id].attrs['aria-current'],'location');
  assert.equal(ids['map-lab-'+id].href,'mechanics.html#experiment='+id);
}
activate(ids['map-point-pn-junction']);
assert.equal(ids['map-point-pn-junction'].attrs['data-state'],'selected');
assert.equal(ids['map-point-two-charges'].attrs['data-state'],'neighbor');
assert.equal(ids['map-point-1.1'].attrs['data-state'],'quiet');
assert.ok(graph[0].children.some(line=>line.attrs['data-active']==='true'));
assert.ok(ids['map-selection'].children.some(node=>node.href==='mechanics.html#experiment=pn-junction'));
activate(ids['map-point-photoelectric']);
const board=ids['map-board'];
const viewport=ids['map-viewport'];
const positionBefore=ids['map-point-photoelectric'].style.left;
const edgeBefore=graph[0].children[0].attrs.d;
board.listeners.pointerdown({button:0,isPrimary:true,pointerId:1,clientX:10,clientY:10});
board.listeners.pointermove({pointerId:1,clientX:105,clientY:40});
board.listeners.pointerup({pointerId:1});
assert.notEqual(ids['map-point-photoelectric'].style.left,positionBefore);
assert.notEqual(graph[0].children[0].attrs.d,edgeBefore);
assert.notEqual(sandbox.history.state.mapView.yaw,.24);
viewport.listeners.keydown({target:viewport,key:'ArrowRight',preventDefault(){}});
activate(ids['map-zoom-in']);
activate(ids['map-zoom-in']);
ids['map-viewport'].scrollLeft=42;
ids['map-viewport'].scrollTop=54;
listeners.get('pagehide')();
const reopened=openMap(sandbox.location.hash,sandbox.history.state);
assert.equal(reopened.ids['map-board'].style.width,'140%');
assert.equal(reopened.ids['map-viewport'].scrollLeft,42);
assert.equal(reopened.ids['map-viewport'].scrollTop,54);
assert.equal(reopened.ids['map-lab-photoelectric'].attrs['aria-current'],'location');
assert.equal(reopened.ids['map-point-photoelectric'].style.left,ids['map-point-photoelectric'].style.left);
activate(reopened.ids['map-zoom-reset']);
assert.equal(reopened.ids['map-board'].style.width,'');
assert.equal(reopened.ids['map-viewport'].scrollLeft,0);
assert.equal(reopened.ids['map-viewport'].scrollTop,0);
assert.equal(reopened.ids['map-point-photoelectric'].style.left,positionBefore);
const semiconductor=openMap('#map-4.6/pn-junction');
const findLink=(node,href)=>{
  if(node.href===href)return node;
  for(const child of node.children){
    const match=findLink(child,href);
    if(match)return match;
  }
};
const electricField=findLink(semiconductor.ids['map-detail'],'#map-3.1/two-charges');
assert.ok(electricField);
activate(electricField);
assert.equal(semiconductor.sandbox.location.hash,'#map-3.1/two-charges');
assert.equal(semiconductor.ids['map-lab-two-charges'].attrs['aria-current'],'location');
console.log('PASS: map chapters, searchable experiment links, shareable selection, saved zoom/pan and reset.');
