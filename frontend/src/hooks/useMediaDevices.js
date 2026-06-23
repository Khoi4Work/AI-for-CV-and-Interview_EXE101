import { useState, useEffect, useRef, useCallback } from 'react';
import { useMediaContext } from '../contexts/MediaContext.jsx';

export function useMediaDevices() {
  const {
    stream,
    updateStream,
    cameraOn,
    setCameraState,
    micOn,
    setMicState
  } = useMediaContext();

  const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));
  const [isRecording, setIsRecording] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Ref for volume to allow VAD checks without triggering re-renders
  const volumeRef = useRef(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevels(new Array(20).fill(0));
    volumeRef.current = 0;
  }, []);

  const stopAllTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    stopAudioAnalysis();
  }, [stream, stopAudioAnalysis]);

  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      stopAllTracks();
      updateStream(null);
      setCameraState(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        updateStream(s);
        setCameraState(true);
        setMicState(true);
      } catch (e) {
        console.warn('Camera/Mic access denied:', e);
        throw e;
      }
    }
  }, [cameraOn, stopAllTracks, updateStream, setCameraState, setMicState]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !micOn;
      setMicState(!micOn);
    }
  }, [stream, micOn, setMicState]);

  const ensureStream = useCallback(async () => {
    if (stream && stream.getAudioTracks().length > 0) {
      return stream;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      updateStream(s);
      setCameraState(true);
      setMicState(true);
      return s;
    } catch (e) {
      console.error('[useMediaDevices] Failed to re-acquire stream:', e);
      throw e;
    }
  }, [stream, updateStream, setCameraState, setMicState]);

  const startAudioAnalysis = useCallback(() => {
    if (!stream) return;

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      }

      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      const analyser = analyserRef.current;
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyserRef.current) return;

        analyser.getByteFrequencyData(buf);
        const sampleBins = Math.min(buf.length, 24);
        let sum = 0;
        for (let i = 0; i < sampleBins; i++) sum += buf[i];
        const avg = sum / sampleBins;

        // Update ref for logic, state for UI
        volumeRef.current = avg;

        setAudioLevels((prev) => prev.map((_, i) => {
          const variation = Math.abs(Math.sin((Date.now() / 200) + i));
          return avg > 55 ? 8 + (avg / 255) * 56 * variation : 4;
        }));

        animationRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch (e) {
      console.error('Audio Analysis failed:', e);
    }
  }, [stream]);

  const startRecording = useCallback(async () => {
    try {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsRecorded(false);
      audioChunksRef.current = [];

      const s = await ensureStream();

      const mediaRecorder = new MediaRecorder(s);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsRecorded(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startAudioAnalysis();
    } catch (e) {
      console.warn('Recording failed:', e);
      throw e;
    }
  }, [ensureStream, startAudioAnalysis, audioUrl]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  const playAudio = useCallback(() => {
    if (!audioUrl) return;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
    };
  }, [stopAudioAnalysis, audioUrl]);

  return {
    stream,
    cameraOn,
    micOn,
    audioLevels,
    volumeRef, // Return the ref for high-frequency polling
    isRecording,
    isRecorded,
    audioUrl,
    isPlaying,
    toggleCamera,
    toggleMic,
    ensureStream,
    startAudioAnalysis,
    stopAudioAnalysis,
    startRecording,
    stopRecording,
    playAudio,
    updateStream,
    stopAllTracks
  };
}
