import test from 'node:test';
import assert from 'node:assert/strict';
import {analysisSelection,createRequestGuard,pollAnalysis} from '../src/features/cv/services/analysisFlow.js';
import {formatJD,jdSourceLabel} from '../src/utils/jdContent.js';
test('selection uses saved JD identity and ignores displayed draft',()=>{
    assert.deepEqual(analysisSelection({id:'saved'},'draft'),{jdId:'saved'});
    assert.deepEqual(analysisSelection(null,' custom '),{jdText:'custom'});
    assert.throws(()=>analysisSelection(null,''));
});
test('old import/search responses are ignored after replacement or unmount',()=>{
    const guard=createRequestGuard();const first=guard.next();const second=guard.next();
    assert.equal(guard.current(first),false);assert.equal(guard.current(second),true);
    guard.cancel();assert.equal(guard.current(second),false);
});
test('poll accepts score zero and stops at terminal states',async()=>{
    let calls=0;const phases=[];
    const result=await pollAnalysis(async()=>++calls===1?{status:'PROCESSING'}:{status:'COMPLETED',result:{score:0}},'id',{wait:async()=>{},onUpdate:v=>phases.push(v.status)});
    assert.equal(result.result.score,0);assert.equal(calls,2);assert.deepEqual(phases,['PROCESSING','COMPLETED']);
});
test('failed analysis stays failed and abort prevents late updates',async()=>{
    const failed=await pollAnalysis(async()=>({status:'FAILED'}),'id');assert.equal(failed.status,'FAILED');
    const controller=new AbortController();let updates=0;
    await assert.rejects(pollAnalysis(async()=>{controller.abort();return {status:'COMPLETED'};},'id',{signal:controller.signal,onUpdate:()=>updates++}),{name:'AbortError'});
    assert.equal(updates,0);
});
test('shared JD formatter preserves nested source and unknown fields without raw JSON',()=>{
    const text=formatJD(JSON.stringify({title:'BA',requirements:['SQL'],source:'https://example.com',custom:{a:'Value'}}));
    assert.match(text,/SQL/);assert.match(text,/https:\/\/example.com/);assert.match(text,/Value/);assert.ok(!text.includes('{'));
    assert.equal(formatJD('plain JD'),'plain JD');assert.equal(formatJD('{invalid'),'{invalid');
    assert.match(jdSourceLabel('USER'),/Chưa xác minh/);assert.equal(jdSourceLabel('SYSTEM'),'JD tham khảo');
});
