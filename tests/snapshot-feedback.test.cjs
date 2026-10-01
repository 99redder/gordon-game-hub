const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../games/coloring/snapshot-feedback.js'),'utf8');
function setup(audio=true,reduced=false){
 const events={starts:[],resumes:0,volumes:[]},classes=new Set();
 const element={classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)},offsetWidth:100};
 class Audio {
  sampleRate=44100;currentTime=0;destination={};
  resume(){events.resumes++;return Promise.resolve();}
  createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};}
  createBufferSource(){return {connect(){},disconnect(){},start:time=>events.starts.push(time),stop(){}};}
  createBiquadFilter(){return {frequency:{},Q:{},connect(){},disconnect(){}};}
  createGain(){return {gain:{setValueAtTime:value=>events.volumes.push(value),exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 }
 const context=vm.createContext({window:audio?{AudioContext:Audio}:{},document:{hidden:false,querySelector:()=>element,addEventListener(){}},matchMedia:()=>({matches:reduced}),setTimeout:()=>1,clearTimeout(){}});
 vm.runInContext(source,context);
 return {feedback:context.window.SnapshotFeedback,events,classes};
}
test('camera sound unlocks on the tap and schedules two quiet shutter clicks',async()=>{
 const {feedback,events,classes}=setup();feedback.capture();
 assert.equal(events.resumes,1);assert.equal(classes.has('takingSnapshot'),true);
 await Promise.resolve();assert.deepEqual(events.starts,[0,.075]);assert.equal(Math.max(...events.volumes)<=.22,true);
});
test('visual feedback works without audio and reduced motion skips the flying photo',async()=>{
 const {feedback,classes}=setup(false,true);assert.doesNotThrow(()=>feedback.capture());
 await feedback.saved({});assert.equal(classes.has('snapshotArrived'),true);
});
