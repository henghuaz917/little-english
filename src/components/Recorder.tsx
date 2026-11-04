import { useEffect, useRef, useState } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const requestingRef = useRef(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioUrl = useRef('');
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [seconds, setSeconds] = useState(0);
  const stop = () => { if (recorder.current?.state === 'recording') recorder.current.stop(); stream.current?.getTracks().forEach(t => t.stop()); setRecording(false); if(timer.current) clearTimeout(timer.current); };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (recorder.current?.state === 'recording') recorder.current.stop(); stream.current?.getTracks().forEach(t => t.stop()); if(audioUrl.current) URL.revokeObjectURL(audioUrl.current); if(timer.current) clearTimeout(timer.current); }; }, []);
  useEffect(() => { if (!recording) return; const id = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(id); }, [recording]);
  async function start() {
    if(requestingRef.current || recorder.current?.state === 'recording') return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError('当前浏览器不支持录音。你可以大声练习，再对照示范自查。'); return; }
    requestingRef.current = true; setRequesting(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if(!mounted.current) { media.getTracks().forEach(t => t.stop()); return; }
      stream.current = media;
      const rec = new MediaRecorder(media); recorder.current = rec;
      const chunks: Blob[] = [];
      rec.ondataavailable = event => { if(event.data.size > 0) chunks.push(event.data); };
      rec.onstop = () => { if(!mounted.current) return; if(audioUrl.current) URL.revokeObjectURL(audioUrl.current); audioUrl.current = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })); setUrl(audioUrl.current); setRecording(false); media.getTracks().forEach(t => t.stop()); };
      rec.start(); setSeconds(0); setRecording(true); timer.current = setTimeout(stop, 60000);
    } catch { stream.current?.getTracks().forEach(t=>t.stop()); if(mounted.current) setError('无法开始录音。请检查麦克风权限，也可以直接大声练习。'); }
    finally {requestingRef.current=false;if(mounted.current)setRequesting(false);}
  }
  return <div className="recorder"><button className={recording ? 'btn record-active' : 'btn secondary'} disabled={requesting} onClick={recording ? stop : start}>{recording ? <Square size={18}/> : url ? <RotateCcw size={18}/> : <Mic size={18}/>} {requesting ? '正在申请麦克风…' : recording ? `停止录音 · ${seconds}s` : url ? '重新录一遍' : '录下我的声音'}</button>{url && !recording && <audio controls src={url} aria-label="播放我的录音"/>}<p className="micro">录音仅用于本次回听，离开练习后释放。最长 60 秒。</p>{error && <p role="alert" className="notice">{error}</p>}</div>;
}
