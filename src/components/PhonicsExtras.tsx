import { useEffect, useState } from 'react';
import { ArrowLeft, AudioLines, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { soundGroups } from '../data/sounds';
import type { PhonicsUnit } from '../types';

export function SoundChart({say}:{say:(text:string)=>void}) {
  const [selected,setSelected]=useState(soundGroups[0].sounds[0]);
  return <div className="sound-chart"><div className="sound-chart-intro"><span className="pill">美式 IPA · 发音参考</span><h2>先听声音，再认识符号。</h2><p>点击音标看口型提示，再听例词。这里播放完整例词，帮助你找到这个声音。</p></div><div className="sound-example"><div><span className="chart-large-symbol">{selected.symbol}</span><h3>{selected.word} <small>{selected.ipa}</small></h3><p>{selected.tip}</p></div><button className="btn primary" onClick={()=>say(selected.word)}><Volume2 size={17}/>听例词</button></div>{soundGroups.map(g=><section key={g.title}><h3>{g.title}</h3><div className="sound-chart-grid">{g.sounds.map(s=><button key={s.symbol} className={selected.symbol===s.symbol?'selected':''} onClick={()=>setSelected(s)}><strong>{s.symbol}</strong><small>{s.word}</small></button>)}</div></section>)}<p className="micro">本表展示常用美式声音。不同词典、口音的标注会略有差异；符号记忆与实际发音需要配合练习。</p></div>;
}

export function WordBuilder({unit,say}:{unit:PhonicsUnit;say:(text:string)=>void}) {
  const target=unit.words[1]??unit.words[0];
  const [tiles,setTiles]=useState<number[]>([]);
  const [checked,setChecked]=useState(false);
  const [listen,setListen]=useState(false);
  useEffect(()=>{setTiles([]);setChecked(false);setListen(false);},[unit.id]);
  const result=tiles.map(i=>target.chunks[i]).join('');
  const correct=result===target.word;
  const order=target.chunks.map((_,i)=>i).reverse();
  return <section className="word-builder"><div className="section-heading"><h3><AudioLines size={18}/>拼读积木</h3><span className="level-tag">听音拼词</span></div><p>听一个刚学过的词，把声音对应的字母块排好。</p><button className="btn secondary" onClick={()=>{say(target.word);setListen(true);}}><Volume2 size={17}/>听目标单词</button><div className="build-slots" aria-label="已拼出的单词">{target.chunks.map((_,i)=><span key={i} className={tiles[i]!==undefined?'filled':''}>{tiles[i]!==undefined?target.chunks[tiles[i]]:'·'}</span>)}</div><div className="build-tiles">{order.map(i=><button key={i} disabled={!listen||tiles.includes(i)} aria-label={`选择字母块 ${target.chunks[i]}`} onClick={()=>{setTiles(t=>[...t,i]);setChecked(false);}}>{target.chunks[i]}</button>)}</div><div className="build-controls"><button className="text-button" disabled={!tiles.length} onClick={()=>{setTiles(t=>t.slice(0,-1));setChecked(false);}}><ArrowLeft size={14}/>退一块</button><button className="text-button" disabled={!tiles.length} onClick={()=>{setTiles([]);setChecked(false);}}><RotateCcw size={14}/>重新排</button><button className="btn primary" disabled={tiles.length!==target.chunks.length} onClick={()=>setChecked(true)}>拼好了吗？</button></div>{checked&&<div className={`feedback ${correct?'success':''}`} role="status">{correct?<><CheckCircle2 size={15}/> 拼出来了！{target.word} {target.ipa} · {target.meaning}</>:<>还差一点。先重新听，再调整字母块的顺序。</>}</div>}<p className="micro">一个字母块可能有多个字母，例如 sh 共同表示一个声音。</p></section>;
}
