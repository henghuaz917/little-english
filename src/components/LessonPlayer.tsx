import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, BookOpen, Check, CheckCircle2, ChevronRight, Headphones, Lightbulb, Mic, PenLine, Play, Sparkles, Sprout, Volume2 } from 'lucide-react';
import type { Lesson, ChoiceExercise } from '../types';
import { phonicsUnits } from '../data/curriculum';
import { addWords, completeLesson, normalizeAnswer, type LearningState } from '../lib/learning';
import { stopSpeech } from '../lib/audio';
import Recorder from './Recorder';

const steps=[{label:'认识词句',icon:BookOpen},{label:'拼读规律',icon:AudioLines},{label:'听懂一句',icon:Headphones},{label:'读懂情景',icon:BookOpen},{label:'开口表达',icon:Mic},{label:'动笔写写',icon:PenLine}];
export default function LessonPlayer({lesson,state,setState,onExit,say}:{lesson:Lesson;state:LearningState;setState:React.Dispatch<React.SetStateAction<LearningState>>;onExit:()=>void;say:(text:string)=>void}) {
  const step=state.session?.lessonId===lesson.id?Math.min(5,state.session.step):0;
  const answers=state.session?.lessonId===lesson.id?state.session.answers:{};
  const [finished,setFinished]=useState(false);
  const [showSpeaking,setShowSpeaking]=useState(false);
  const [hint,setHint]=useState(false);
  const [writingChecked,setWritingChecked]=useState(false);
  const [selfChecked,setSelfChecked]=useState(false);
  const activeMs=useRef(typeof answers._activeMs==='number'?answers._activeMs:0);
  const lastAction=useRef(Date.now());
  const [elapsed,setElapsed]=useState(activeMs.current);
  const phonics=phonicsUnits.find(p=>p.id===lesson.phonicsId)!;
  const [heard,setHeard]=useState(false);
  useEffect(()=>{
    let tick=Date.now();let saved=Date.now();
    const action=()=>{lastAction.current=Date.now();};
    window.addEventListener('pointerdown',action);window.addEventListener('keydown',action);window.addEventListener('scroll',action);
    const interval=setInterval(()=>{const now=Date.now();if(!finished&&document.visibilityState==='visible'&&now-lastAction.current<120000)activeMs.current+=Math.min(now-tick,2000);tick=now;setElapsed(activeMs.current);if(!finished&&now-saved>10000){saved=now;setState(s=>s.session?.lessonId===lesson.id?{...s,session:{...s.session,answers:{...s.session.answers,_activeMs:activeMs.current}}}:s);}},1000);
    return()=>{clearInterval(interval);window.removeEventListener('pointerdown',action);window.removeEventListener('keydown',action);window.removeEventListener('scroll',action);};
  },[finished,lesson.id,setState]);
  useEffect(()=>{stopSpeech();setHint(false);setWritingChecked(false);setSelfChecked(false);setShowSpeaking(false);setHeard(false);},[step]);
  function remember(key:string,value:unknown) {setState(s=>({...s,session:{lessonId:lesson.id,step,answers:{...s.session?.answers,[key]:value,_activeMs:activeMs.current}}}));}
  function leave(){setState(s=>s.session?.lessonId===lesson.id?{...s,session:{...s.session,answers:{...s.session.answers,_activeMs:activeMs.current}}}:s);onExit();}
  function advance(){
    stopSpeech();
    if(step<5){setState(s=>({...s,session:{lessonId:lesson.id,step:step+1,answers:{...s.session?.answers,_activeMs:activeMs.current}}}));window.scrollTo({top:0,behavior:'smooth'});return;}
    setState(s=>{const next=completeLesson(addWords(s,lesson.words.map(w=>w.id)),lesson.id,['listening','speaking','reading','writing'],activeMs.current/60000);return {...next,session:undefined};});
    setFinished(true);window.scrollTo({top:0,behavior:'smooth'});
  }
  const writing=String(answers.writingText??'');
  const writingCorrect=lesson.writing.answers.some(a=>normalizeAnswer(a)===normalizeAnswer(writing));
  const ready=step===0||step===1||(step===2&&answers.listening===lesson.listening.answerIndex)||(step===3&&answers.reading===lesson.reading.answerIndex)||(step===4&&answers.spoken===true)||(step===5&&writingChecked&&(writingCorrect||selfChecked));
  if(finished)return <div className="completion-screen"><div className="completion-leaves"><Sprout size={55}/></div><span className="eyebrow">ONE SMALL STEP, WELL DONE</span><h1>今天，又会了一点。</h1><p>你完成了「{lesson.title}」<br/>从听懂、读懂，到自己说出来、写下来。</p><div className="completion-skills">{[Headphones,Mic,BookOpen,PenLine].map((Icon,i)=><div key={i}><Icon size={24}/><span>{['听','说','读','写'][i]}</span><CheckCircle2 size={15}/></div>)}</div><div className="completion-recap"><strong>{lesson.words.length} 个词句已加入复习</strong><p>看词忆义、听音识义、主动表达，分别安排下一次回忆。</p><div>{lesson.words.map(w=><button onClick={()=>say(w.word)} key={w.id}>{w.word}<Volume2 size={13}/></button>)}</div></div><div className="info-box">本次前台练习约 {Math.max(1,Math.round(elapsed/60000))} 分钟。口语采用自评，写作采用参考答案核对；完成课程不代表能力已全部掌握。</div><button className="btn primary" onClick={onExit}>带着收获，返回学习空间<ArrowRight size={18}/></button></div>;
  return <><div className="lesson-player-header"><button className="text-button" onClick={leave}><ArrowLeft size={17}/>保存并返回</button><span className="micro">前台练习 {Math.floor(elapsed/60000)}:{String(Math.floor(elapsed/1000)%60).padStart(2,'0')}</span></div><div className="lesson-player-title"><span className="eyebrow">EVERYDAY QUEST · 生活情景</span><h1><span>{lesson.emoji}</span>{lesson.title}</h1><p>{lesson.subtitle}</p></div><div className="stepper" aria-label="课程进度">{steps.map(({label,icon:Icon},i)=><div key={label} className={`${step===i?'current':''} ${step>i?'completed':''}`} aria-current={step===i?'step':undefined}><span>{step>i?<Check size={17}/>:<Icon size={17}/>}</span><small>{label}</small></div>)}</div><section className="exercise-card" key={step}><div className="exercise-heading"><span className="pill">STEP {step+1} / 6</span><span className="micro">{step===4?'开口练习 · 自我检查':step===5?'短句写作 · 参考答案核对':'先理解，再试着自己完成'}</span></div>
    {step===0&&<><h2>先认识今天的几个词。</h2><p className="muted">点一下听声音。读懂例句，再试着说一遍。</p><div className="lesson-vocabulary">{lesson.words.map(w=><article key={w.id}><button className="word-audio" onClick={()=>say(w.word)} aria-label={`朗读 ${w.word}`}><Volume2 size={20}/></button><h3>{w.word}<span>{w.ipa}</span></h3><p>{w.meaning}</p><button className="example-button" onClick={()=>say(w.example)}>{w.example}<Play size={12}/></button><small>{w.translation}</small></article>)}</div><div className="tip"><Lightbulb size={18}/>不用一下记牢。后面的任务里，还会遇见它们。</div></>}
    {step===1&&<><h2>{phonics.title}</h2><p className="muted">{phonics.description}</p><div className="lesson-sound"><span>{phonics.spelling}</span><strong>{phonics.sound}</strong><p>{phonics.mouthTip}</p></div><div className="phonics-words">{phonics.words.map(w=><button key={w.word} onClick={()=>say(w.word)}><Volume2 size={17}/><strong>{w.chunks.map((c,i)=><span key={i}>{c}</span>)}</strong><small>{w.ipa}</small><em>{w.meaning}</em></button>)}</div><div className="tip"><Lightbulb size={18}/>听完整单词，再观察字母组合。音标帮助查读音，拼读规律帮助认词。</div></>}
    {(step===2||step===3)&&<ChoiceTask exercise={step===2?lesson.listening:lesson.reading} listening={step===2} selection={typeof answers[step===2?'listening':'reading']==='number'?answers[step===2?'listening':'reading'] as number:null} onSelect={value=>remember(step===2?'listening':'reading',value)} say={say} heard={heard} setHeard={setHeard}/>}
    {step===4&&<><h2>轮到你，开口说一句。</h2><p className="speaking-prompt">{lesson.speaking.prompt}</p><div className="speak-visual"><div className="mic-orb"><Mic size={32}/></div><span>先试着自己说，再听示范。</span></div><div className="button-row center"><button className="btn secondary" onClick={()=>say(lesson.speaking.example)}><Volume2 size={17}/>听示范</button><button className="text-button" onClick={()=>setShowSpeaking(v=>!v)}>{showSpeaking?'收起参考表达':'需要一点提示'}<ChevronRight size={15}/></button></div>{showSpeaking&&<div className="reference-sentence"><strong>{lesson.speaking.example}</strong><p>{lesson.speaking.translation}</p></div>}<Recorder/><label className="self-check"><input type="checkbox" checked={answers.spoken===true} onChange={e=>remember('spoken',e.target.checked)}/><span>我已开口练习，并对照示范检查了自己的表达。<small>可以录音回听，也可以直接大声练习。本步骤不会自动评分。</small></span></label></>}
    {step===5&&<><h2>把想说的话，写下来。</h2><p className="writing-prompt">{lesson.writing.prompt}</p><label className="field-label" htmlFor="writing-answer">你的英文表达</label><textarea id="writing-answer" value={writing} placeholder="试着写一个完整的英文句子…" autoComplete="off" spellCheck={false} onChange={e=>{remember('writingText',e.target.value);setWritingChecked(false);setSelfChecked(false);}} rows={4}/><div className="writing-controls"><button className="text-button" onClick={()=>setHint(v=>!v)}><Lightbulb size={16}/>{hint?'收起提示':'给我一点提示'}</button><button className="btn secondary" disabled={!writing.trim()} onClick={()=>setWritingChecked(true)}><Check size={16}/>核对表达</button></div>{hint&&<div className="tip"><Lightbulb size={18}/>{lesson.writing.hint}</div>}{writingChecked&&<div className={`feedback ${writingCorrect?'success':''}`} role="status"><strong>{writingCorrect?'表达与参考答案一致，做得好！':'这句话与预设答案不同，一起对照看看。'}</strong><p className="reference-answer">{lesson.writing.answers[0]}</p>{!writingCorrect&&<><p>本版只能匹配参考句，无法判断所有正确说法。可以修改后再核对，或自行确认意思和语法。</p><label className="checkbox-label"><input type="checkbox" checked={selfChecked} onChange={e=>setSelfChecked(e.target.checked)}/>我已对照参考句，自查并完成练习</label></>}</div>}</>}
    <div className="exercise-footer"><span className="micro">{step===5?'完成后，词句会加入间隔复习。':'每一步都在为独立表达做准备。'}</span><button className="btn primary" disabled={!ready} onClick={advance}>{step===5?'完成这一关':'继续下一步'}{step===5?<CheckCircle2 size={18}/>:<ArrowRight size={18}/>}</button></div>
  </section></>;
}

function ChoiceTask({exercise,listening,selection,onSelect,say,heard,setHeard}:{exercise:ChoiceExercise;listening:boolean;selection:number|null;onSelect:(n:number)=>void;say:(t:string)=>void;heard:boolean;setHeard:(v:boolean)=>void}) {
  const correct=selection===exercise.answerIndex;
  const [transcript,setTranscript]=useState(false);
  return <><h2>{listening?'先听一听，抓住关键信息。':'读一小段，发现关键信息。'}</h2>{listening?<><div className="listening-stage"><button className="listen-orb" aria-label="播放听力材料" onClick={()=>{say(exercise.text);setHeard(true);}}><Headphones size={32}/></button><div className="wave-decoration" aria-hidden="true">{[12,22,35,20,42,28,15,30,46,22,35,15,25,11].map((h,i)=><i key={i} style={{height:h}}/>)}</div><p>{heard?'可以反复播放，按自己的节奏听。':'点击耳机，听今天的小对话。'}</p></div></>:<div className="reading-passage"><span className="eyebrow">A LITTLE READING</span><p>{exercise.text}</p><button className="text-button" onClick={()=>say(exercise.text)}><Volume2 size={16}/>听一遍朗读</button></div>}<h3 className="question-text">{exercise.prompt}</h3><div className="answer-options">{exercise.options.map((option,i)=><button key={i} onClick={()=>onSelect(i)} className={selection===i?(correct?'correct':'incorrect'):''}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{selection===i&&(correct?<CheckCircle2 size={20}/>:<RotateCcwIcon/>)}</button>)}</div>{selection!==null&&<div className={`feedback ${correct?'success':''}`} role="status"><strong>{correct?'找到了！':'再试试，你可以重新听或读。'}</strong><p>{exercise.explanation}</p></div>}{listening&&selection!==null&&<><button className="text-button transcript-toggle" onClick={()=>setTranscript(v=>!v)}><BookOpen size={16}/>{transcript?'收起原文':'查看听力原文'}</button>{transcript&&<div className="reading-passage"><p>{exercise.text}</p></div>}</>}</>;
}
function RotateCcwIcon(){return <span aria-hidden="true">↻</span>;}
