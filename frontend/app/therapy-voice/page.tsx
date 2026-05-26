'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Volume2, AlertCircle, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const PERSONALITIES = [
  { id: 'calm_mentor', name: '🧘 Calm Mentor', color: 'from-blue-500 to-cyan-500' },
  { id: 'friendly_best_friend', name: '😊 Best Friend', color: 'from-pink-500 to-rose-500' },
  { id: 'soft_therapist', name: '💬 Soft Therapist', color: 'from-purple-500 to-pink-500' },
  { id: 'motivational_coach', name: '💪 Coach', color: 'from-orange-500 to-red-500' },
  { id: 'mindfulness_guide', name: '🌿 Mindfulness Guide', color: 'from-green-500 to-emerald-500' }
];

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message: string;
}

export default function TherapyVoicePage() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState('calm_mentor');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Microphone Access', status: 'pending', message: 'Not tested yet' },
    { name: 'Audio Recording', status: 'pending', message: 'Not tested yet' },
    { name: 'Audio Playback', status: 'pending', message: 'Not tested yet' },
    { name: 'Backend Transcription', status: 'pending', message: 'Not tested yet' },
    { name: 'Murf Voice Generation', status: 'pending', message: 'Not tested yet' }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const testMicrophoneAccess = async () => {
    setTestResults(prev => prev.map(r => r.name === 'Microphone Access' ? { ...r, status: 'running' } : r));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setTestResults(prev => prev.map(r => r.name === 'Microphone Access' ? { ...r, status: 'success', message: '✅ Microphone detected and accessible' } : r));
    } catch (error) {
      setTestResults(prev => prev.map(r => r.name === 'Microphone Access' ? { ...r, status: 'failed', message: `❌ ${error}` } : r));
    }
  };

  const startRecording = async () => {
    try {
      setTestResults(prev => prev.map(r => r.name === 'Audio Recording' ? { ...r, status: 'running' } : r));
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`✅ Recording complete: ${audioBlob.size} bytes`);
        setTestResults(prev => prev.map(r => r.name === 'Audio Recording' ? { ...r, status: 'success', message: `✅ Recorded ${recordingTime}s, ${audioBlob.size} bytes` } : r));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      setTestResults(prev => prev.map(r => r.name === 'Audio Recording' ? { ...r, status: 'failed', message: `❌ ${error}` } : r));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      alert('Please record audio first');
      return;
    }

    try {
      setTestResults(prev => prev.map(r => r.name === 'Audio Playback' ? { ...r, status: 'running' } : r));
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
          setTestResults(prev => prev.map(r => r.name === 'Audio Playback' ? { ...r, status: 'success', message: '✅ Audio playback successful' } : r));
        };
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (error) {
      setTestResults(prev => prev.map(r => r.name === 'Audio Playback' ? { ...r, status: 'failed', message: `❌ ${error}` } : r));
    }
  };

  const sendForTranscription = async () => {
    if (audioChunksRef.current.length === 0) {
      alert('Please record audio first');
      return;
    }

    try {
      setTestResults(prev => prev.map(r => r.name === 'Backend Transcription' ? { ...r, status: 'running' } : r));
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'message.webm');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/voice/transcribe`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTranscript(data.transcription);
      setConfidence(data.confidence);
      setTestResults(prev => prev.map(r => r.name === 'Backend Transcription' ? { ...r, status: 'success', message: `✅ Confidence: ${(data.confidence * 100).toFixed(1)}%` } : r));
    } catch (error) {
      setTestResults(prev => prev.map(r => r.name === 'Backend Transcription' ? { ...r, status: 'failed', message: `❌ ${error}` } : r));
    }
  };

  const generateVoiceResponse = async () => {
    if (!transcript) {
      alert('Please get a transcription first');
      return;
    }

    try {
      setTestResults(prev => prev.map(r => r.name === 'Murf Voice Generation' ? { ...r, status: 'running' } : r));

      const mockResponses: { [key: string]: string } = {
        'calm_mentor': 'I understand. Remember, you are stronger than you think. Take a moment to breathe deeply and trust in your ability to handle this.',
        'friendly_best_friend': 'That sounds tough! But hey, you\'ve got this. I\'m here for you, and we can work through it together!',
        'soft_therapist': 'I hear you. Those feelings are valid and important. Let\'s explore what you\'re experiencing in a safe space.',
        'motivational_coach': 'Let\'s turn this into an opportunity! You have the strength and resilience to overcome this. Let\'s make a plan!',
        'mindfulness_guide': 'Take a deep breath. In this moment, you are safe. Let\'s anchor ourselves in the present and find peace.'
      };

      const aiResponse = mockResponses[selectedPersonality] || mockResponses['calm_mentor'];
      setVoiceResponse(aiResponse);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/voice/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            text: aiResponse,
            personality_mode: selectedPersonality
          })
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAudioUrl(data.audio_url);
      setTestResults(prev => prev.map(r => r.name === 'Murf Voice Generation' ? { ...r, status: 'success', message: '✅ Voice generated, playing...' } : r));

      if (audioRef.current) {
        audioRef.current.src = data.audio_url;
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (error) {
      setTestResults(prev => prev.map(r => r.name === 'Murf Voice Generation' ? { ...r, status: 'failed', message: `❌ ${error}` } : r));
    }
  };

  const playVoiceAgain = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'success') {
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    }
    if (status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
    if (status === 'running') {
      return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900 p-6">
      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} className="hidden" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎤 Voice & Microphone Testing</h1>
            <p className="text-gray-400">Complete end-to-end voice functionality validation</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Testing Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Microphone Test */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">1️⃣</span> Microphone Access
              </h2>
              <button
                onClick={testMicrophoneAccess}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Mic size={20} /> Test Microphone
              </button>
            </motion.div>

            {/* Step 2: Recording */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">2️⃣</span> Record Audio
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle size={20} /> Stop Recording ({formatTime(recordingTime)})
                      </>
                    ) : (
                      <>
                        <Mic size={20} /> Start Recording
                      </>
                    )}
                  </button>
                </div>
                {audioChunksRef.current.length > 0 && (
                  <div className="text-sm text-green-400">✅ Audio recorded: {new Blob(audioChunksRef.current).size} bytes</div>
                )}
              </div>
            </motion.div>

            {/* Step 3: Playback */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">3️⃣</span> Audio Playback
              </h2>
              <button
                onClick={playRecordedAudio}
                disabled={audioChunksRef.current.length === 0 || isPlayingAudio}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Volume2 size={20} /> {isPlayingAudio ? 'Playing...' : 'Play Recording'}
              </button>
            </motion.div>

            {/* Step 4: Transcription */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">4️⃣</span> Send for Transcription
              </h2>
              <button
                onClick={sendForTranscription}
                disabled={audioChunksRef.current.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Send to Backend
              </button>
              {transcript && (
                <motion.div className="mt-4 p-4 bg-black/30 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-sm text-gray-400 mb-2">Transcribed Text:</p>
                  <p className="text-white mb-2">"{transcript}"</p>
                  <p className="text-sm text-green-400">Confidence: {(confidence * 100).toFixed(1)}%</p>
                </motion.div>
              )}
            </motion.div>

            {/* Step 5: Personality Selection */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">5️⃣</span> Select Voice Personality
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PERSONALITIES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonality(p.id)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
                      selectedPersonality === p.id
                        ? 'bg-white/20 border-white text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Step 6: Generate Voice */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">6️⃣</span> Generate Voice Response
              </h2>
              <button
                onClick={generateVoiceResponse}
                disabled={!transcript}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Generate & Play Voice
              </button>
              {voiceResponse && (
                <motion.div className="mt-4 p-4 bg-black/30 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-sm text-gray-400 mb-2">AI Response:</p>
                  <p className="text-white mb-3">"{voiceResponse}"</p>
                  <button
                    onClick={playVoiceAgain}
                    disabled={!audioUrl || isPlayingAudio}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Volume2 size={16} /> {isPlayingAudio ? 'Playing...' : 'Play Again'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Test Results Panel */}
          <motion.div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 h-fit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">📊 Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, idx) => (
                <motion.div
                  key={idx}
                  className="p-3 bg-black/30 rounded-lg border border-white/10"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon status={result.status} />
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{result.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{result.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Copy Logs */}
            <div className="mt-6 p-4 bg-black/50 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-2">Browser Console Logs:</p>
              <button
                onClick={() => {
                  const logs = testResults.map(r => `${r.name}: ${r.message}`).join('\n');
                  navigator.clipboard.writeText(logs);
                  alert('Test results copied to clipboard');
                }}
                className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Copy size={14} /> Copy Results
              </button>
            </div>

            {/* Documentation Link */}
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-2">📖 Need help?</p>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
                View Testing Guide →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Instructions */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-white mb-3">📋 Testing Checklist</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <li>✅ Microphone detected and accessible</li>
            <li>✅ Audio records without errors</li>
            <li>✅ Playback works (hear your own voice)</li>
            <li>✅ Transcription accuracy &gt; 80%</li>
            <li>✅ All 5 personalities have unique voices</li>
            <li>✅ Voice response plays automatically</li>
            <li>✅ No console errors</li>
            <li>✅ Latency acceptable (&lt; 3 seconds per step)</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
