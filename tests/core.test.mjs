import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reducer, scoreCheckin, remainingSeconds, createStore, restore, STORAGE_KEY } from '../dist/src/core.js';
import { replyTo, duoReflection } from '../dist/src/services.js';

test('check-in accepts only four answered questions and maps the scale to 0–100', () => {
  assert.equal(scoreCheckin([1,1,1,1]).score,0);
  assert.equal(scoreCheckin([5,5,5,5]).score,100);
  assert.equal(scoreCheckin([3,3,3,3]).score,50);
  for (const answers of [[],[1,2,3],[0,1,1,1],[6,2,3,4],[1.2,2,3,4],[NaN,2,3,4]]) assert.throws(()=>scoreCheckin(answers));
});
test('message allowance cannot be refreshed by clearing chat, and demo plan expands it',()=>{
  let s=initialState();for(let i=0;i<10;i++)s=reducer(s,{type:'MESSAGE',message:{id:String(i),role:'user',text:'hello'}});
  assert.equal(s.messages.length,8);assert.equal(s.chatUses,8);
  s=reducer(s,{type:'CLEAR_CHAT'});s=reducer(s,{type:'MESSAGE',message:{id:'blocked',role:'user',text:'hello'}});
  assert.equal(s.messages.length,0);s=reducer(s,{type:'SET_PLAN',plan:'plus'});
  s=reducer(s,{type:'MESSAGE',message:{id:'allowed',role:'user',text:'hello'}});assert.equal(s.chatUses,9);
});
test('countdown uses elapsed wall time, clamps at zero, and pauses without losing remaining time',()=>{
  let s=reducer(initialState(),{type:'TIMER_RESET',seconds:60});s=reducer(s,{type:'TIMER_START',now:1000});
  assert.equal(remainingSeconds(s.timer,31000),30);assert.equal(remainingSeconds(s.timer,99000),0);
  s=reducer(s,{type:'TIMER_PAUSE',now:31000});assert.equal(remainingSeconds(s.timer,99000),30);
});
test('local bookings reject duplicate provider/slot pairs and can be cancelled',()=>{
  let s=initialState();s=reducer(s,{type:'BOOK',booking:{id:'a',provider:'maya',slot:'Tomorrow, 10:00'}});
  s=reducer(s,{type:'BOOK',booking:{id:'b',provider:'maya',slot:'Tomorrow, 10:00'}});assert.equal(s.bookings.length,1);
  s=reducer(s,{type:'CANCEL_BOOKING',id:'a'});assert.equal(s.bookings.length,0);
});
test('both Duo speakers are needed before the shared reflection changes',()=>{
  let s=initialState();s=reducer(s,{type:'DUO_MESSAGE',message:{speaker:'You',text:'hi'}});assert.equal(s.duo.messages.length,0);
  s=reducer(s,{type:'CREATE_ROOM',code:'ABC123'});s=reducer(s,{type:'DUO_MESSAGE',message:{speaker:'You',text:'hi'}});
  assert.match(duoReflection(s.duo.messages),/both people/);
  s=reducer(s,{type:'SPEAKER',speaker:'Partner'});s=reducer(s,{type:'DUO_MESSAGE',message:{speaker:'Partner',text:'hello'}});
  assert.match(duoReflection(s.duo.messages),/Both perspectives/);
});
test('poll choice is replaced rather than counted repeatedly',()=>{
  let s=reducer(initialState(),{type:'VOTE',option:0});s=reducer(s,{type:'VOTE',option:2});assert.equal(s.vote,2);
  assert.equal(reducer(s,{type:'VOTE',option:99}).vote,2);
});
test('journal, progress and favourites survive a store reload',()=>{
  const data=new Map(), storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
  const a=createStore(storage);a.dispatch({type:'SAVE_JOURNAL',entry:{id:'j',mood:'Okay',at:1,answers:['A','B','C']}});
  a.dispatch({type:'COMPLETE',id:'pause'});a.dispatch({type:'FAVOURITE',id:'pause'});
  const b=createStore(storage);assert.deepEqual(b.get().journals[0].answers,['A','B','C']);assert.deepEqual(b.get().completed,['pause']);assert.deepEqual(b.get().favourites,['pause']);
  assert.ok(data.has(STORAGE_KEY));
});
test('blocked storage preserves an in-memory working app and reports the limitation',()=>{
  const a=createStore({getItem(){throw Error('denied');},setItem(){throw Error('quota');}});
  a.dispatch({type:'SET_PLAN',plan:'plus'});assert.equal(a.get().plan,'plus');assert.equal(a.isDurable(),false);
});
test('malformed or wrong-version storage falls back to a fresh state',()=>{
  for(const raw of ['bad json','null','{}',JSON.stringify({...initialState(),version:99}),JSON.stringify({...initialState(),messages:[{}]})])assert.deepEqual(restore(raw),initialState());
});
test('starring is reversible and reset does not mutate shared seed content',()=>{
  let s=reducer(initialState(),{type:'STAR',id:'m'});s=reducer(s,{type:'STAR',id:'m'});assert.deepEqual(s.stars,[]);
  s.posts[0].text='changed';assert.notEqual(initialState().posts[0].text,'changed');assert.equal(reducer(s,{type:'RESET'}).chatUses,0);
});
test('assistant adapter is deterministic, distinguishes routes and labels limitations',()=>{
  assert.deepEqual(replyTo('work stress'),replyTo('work stress'));assert.equal(replyTo('work stress').kind,'reflection');
  assert.equal(replyTo('partner').kind,'duo');assert.equal(replyTo('demo features').kind,'orientation');
  assert.equal(replyTo('I might hurt myself').kind,'support');assert.match(replyTo('I might hurt myself').text,/cannot assess risk/);
});
