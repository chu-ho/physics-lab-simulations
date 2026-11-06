/* Image-drawing annotations use world points on z=0, never screen pixels. */
'use strict';
let annotationEnabled=false,annotationPointer=null,annotationDraft=null;
const annotationStrokes=[];
function annotationAvailable(){return def?.id==='image-drawing';}
function annotationUI(message){$('annotationPanel').hidden=!annotationAvailable();$('annotationToggle').setAttribute('aria-pressed',String(annotationEnabled));$('annotationToggle').textContent=annotationEnabled?'回到轉視角':'開啟手繪';$('annotationUndo').disabled=!annotationStrokes.length;$('annotationClear').disabled=!annotationStrokes.length&&!annotationDraft;canvas.style.cursor=annotationEnabled?'crosshair':'';$('annotationStatus').textContent=message||(annotationEnabled?'手繪模式：單指／滑鼠作畫；轉視角或雙指縮放請先回到轉視角。':'轉視角模式；已保留 '+annotationStrokes.length+' 筆。');}
function annotationCancel(){annotationPointer=null;annotationDraft=null;dirty=true;}
function annotationSelect(){annotationCancel();annotationEnabled=false;annotationUI();}
function annotationWorldPoint(clientX,clientY){updateCamera();const rect=canvas.getBoundingClientRect(),x=(clientX-(rect.left||0))*W/rect.width,y=(clientY-(rect.top||0))*H/rect.height,bounds=sceneBounds(),sx=(x-W/2)/focal,sy=-(y-(bounds.top+bounds.bottom)/2)/focal,dir=forward.map((v,j)=>v+sx*right[j]+sy*up[j]);if(Math.abs(dir[2])<1e-6)return null;const distance=-eye[2]/dir[2];if(distance<=0)return null;const point=eye.map((v,j)=>v+distance*dir[j]);if(!point.every(Number.isFinite)||Math.abs(point[0])>simulation.extent||point[1]<.5||point[1]>7.5)return null;point[2]=0;return point;}
function annotationDown(e){if(!annotationAvailable()||!annotationEnabled)return false;e.preventDefault?.();if(annotationPointer!==null||e.button>0)return true;const point=annotationWorldPoint(e.clientX,e.clientY);if(!point){annotationUI('此位置未落在作圖平面；請轉向作圖平面後再畫。');return true;}annotationPointer=e.pointerId;annotationDraft={color:$('annotationColor').value||'#c6636b',points:[point]};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});annotationUI();dirty=true;return true;}
function annotationMove(e){if(!annotationAvailable()||!annotationEnabled)return false;if(e.pointerId!==annotationPointer)return true;const point=annotationWorldPoint(e.clientX,e.clientY);if(point){const last=annotationDraft.points.at(-1);if(Math.hypot(...point.map((v,j)=>v-last[j]))>.005)annotationDraft.points.push(point);}dirty=true;return true;}
function annotationRelease(e){if(e.pointerId!==annotationPointer)return false;if(e.type==='pointerup'&&annotationDraft?.points.length>1)annotationStrokes.push(annotationDraft);annotationCancel();annotationUI();return true;}
function drawAnnotations(){if(!annotationAvailable())return;for(const stroke of [...annotationStrokes,...(annotationDraft?[annotationDraft]:[])])for(let j=1;j<stroke.points.length;j++)segment(stroke.points[j-1],stroke.points[j],stroke.color,2.5);}
$('annotationToggle').onclick=()=>{annotationCancel();annotationEnabled=!annotationEnabled;annotationUI();};
$('annotationUndo').onclick=()=>{annotationCancel();annotationStrokes.pop();annotationUI();};
$('annotationClear').onclick=()=>{annotationCancel();annotationStrokes.length=0;annotationUI();};
