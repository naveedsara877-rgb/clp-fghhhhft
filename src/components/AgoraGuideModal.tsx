import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Play, ShieldAlert, Cpu, Sparkles, ExternalLink } from 'lucide-react';
import { agoraService } from '../services/agoraService';

interface AgoraGuideModalProps {
  onClose: () => void;
}

export const AgoraGuideModal: React.FC<AgoraGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'snippets' | 'tester' | 'guide'>('snippets');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Live test input state
  const [testAppId, setTestAppId] = useState('');
  const [testChannel, setTestChannel] = useState('chamet_live_room_1');
  const [testMode, setTestMode] = useState<'live' | 'rtc'>('live');
  const [testRole, setTestRole] = useState<'host' | 'audience'>('host');
  const [connectionStatus, setConnectionStatus] = useState<string>('Idle');
  const [isTesting, setIsTesting] = useState(false);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunAgoraTest = async () => {
    if (!testAppId.trim()) {
      setConnectionStatus('⚠️ Please enter your Agora App ID from Agora Console');
      return;
    }

    try {
      setIsTesting(true);
      setConnectionStatus('Initializing Agora client...');
      agoraService.initClient(testMode, testRole);

      setConnectionStatus(`Joining channel "${testChannel}"...`);
      await agoraService.joinChannel(testAppId.trim(), testChannel.trim(), null);

      if (testRole === 'host' || testMode === 'rtc') {
        setConnectionStatus('Publishing microphone and camera tracks...');
        await agoraService.publishLocalTracks('agora-tester-video-preview');
        setConnectionStatus('✅ Successfully published local tracks! Room is live.');
      } else {
        setConnectionStatus('✅ Connected as audience. Listening for remote streams...');
      }
    } catch (err: any) {
      setConnectionStatus(`❌ Error: ${err?.message || 'Agora connection failed'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleStopAgoraTest = async () => {
    await agoraService.leaveChannel();
    setConnectionStatus('Disconnected & tracks closed.');
  };

  const SNIPPETS = [
    {
      title: '1. Initialize Agora RTC Client',
      desc: 'Creates the RTC client instance configured for low-latency live streaming or 1-on-1 calling.',
      code: `import AgoraRTC from 'agora-rtc-sdk-ng';

// Use 'live' mode for 1-to-many streaming or 'rtc' for 1-on-1 video calls
const client = AgoraRTC.createClient({ 
  mode: 'live', // 'live' | 'rtc'
  codec: 'vp8'  // Standard browser video codec
});

// For live streaming, designate role: 'host' (broadcaster) or 'audience' (viewer)
client.setClientRole('host');`,
    },
    {
      title: '2. Join a Channel',
      desc: 'Connect to an Agora channel using your App ID, channel name, and security token.',
      code: `const APP_ID = 'YOUR_AGORA_APP_ID';
const CHANNEL_NAME = 'chamet_live_room_101';
const TOKEN = null; // Use null for testing with App Certificate disabled, or provide server-generated RTC token
const UID = null;   // Pass null to let Agora auto-assign a numeric user ID

async function joinLiveStream() {
  const uid = await client.join(APP_ID, CHANNEL_NAME, TOKEN, UID);
  console.log('Successfully joined Agora channel with UID:', uid);
  return uid;
}`,
    },
    {
      title: '3. Create & Publish Local Audio/Video Tracks',
      desc: 'Captures webcam and microphone input, plays local preview, and broadcasts to other participants.',
      code: `let localAudioTrack;
let localVideoTrack;

async function startPublishing() {
  // Capture mic and camera in a single call
  [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
    { encoderConfig: 'music_standard' },
    { encoderConfig: '720p_1' } // 1280x720 30fps
  );

  // Play local camera preview in an HTML element (e.g., <div id="local-video"></div>)
  localVideoTrack.play('local-video');

  // Publish tracks into the joined channel
  await client.publish([localAudioTrack, localVideoTrack]);
  console.log('Local tracks published successfully!');
}`,
    },
    {
      title: '4. Subscribe to Remote Streamer / Caller Tracks',
      desc: 'Listens for remote users publishing audio/video and automatically renders them.',
      code: `// Listen for remote participants publishing media
client.on('user-published', async (user, mediaType) => {
  // Subscribe to the specific track (audio or video)
  await client.subscribe(user, mediaType);
  console.log('Subscribed to user:', user.uid, 'media:', mediaType);

  if (mediaType === 'video') {
    // Play remote video inside target container (e.g., <div id="remote-video"></div>)
    user.videoTrack.play('remote-video');
  }

  if (mediaType === 'audio') {
    // Play remote audio through system speakers
    user.audioTrack.play();
  }
});

// Handle remote user leaving or muting
client.on('user-unpublished', (user, mediaType) => {
  console.log('Remote user unpublished:', user.uid, mediaType);
});

client.on('user-left', (user) => {
  console.log('Remote user left channel:', user.uid);
});`,
    },
    {
      title: '5. Device Controls: Mute Microphone & Toggle Camera',
      desc: 'Enables or disables audio/video tracks on the fly without having to recreate the tracks.',
      code: `// Mute or unmute microphone
async function toggleMicrophone(enabled) {
  if (localAudioTrack) {
    await localAudioTrack.setEnabled(enabled);
    console.log(enabled ? 'Microphone unmuted' : 'Microphone muted');
  }
}

// Turn camera on or off
async function toggleCamera(enabled) {
  if (localVideoTrack) {
    await localVideoTrack.setEnabled(enabled);
    console.log(enabled ? 'Camera enabled' : 'Camera disabled');
  }
}`,
    },
    {
      title: '6. Clean Disconnect & Channel Leave',
      desc: 'Stops hardware tracks, releases camera/mic permissions, and leaves the channel cleanly.',
      code: `async function leaveRoom() {
  if (localAudioTrack) {
    localAudioTrack.stop();
    localAudioTrack.close();
  }
  if (localVideoTrack) {
    localVideoTrack.stop();
    localVideoTrack.close();
  }
  
  // Leave the Agora channel
  await client.leave();
  console.log('Left channel and cleaned up all resources.');
}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Agora Web SDK Integration Guide
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  v4.x (agora-rtc-sdk-ng)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production guide for Live Video Streaming & 1-on-1 Calls (Chamet Architecture)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('snippets')}
            className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'snippets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Code Snippets</span>
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'tester'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Agora Testbed</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step-by-Step Testing Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
          {activeTab === 'snippets' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Agora RTC NG Architecture:</span> In Chamet-style apps,
                  use <code className="bg-black/40 px-1 py-0.5 rounded text-white">mode: 'live'</code> for
                  public broadcast rooms (one host, unlimited audience) and{' '}
                  <code className="bg-black/40 px-1 py-0.5 rounded text-white">mode: 'rtc'</code> for
                  private 1-on-1 video calls.
                </div>
              </div>

              {SNIPPETS.map((snippet, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden"
                >
                  <div className="p-3 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{snippet.title}</h4>
                      <p className="text-[11px] text-slate-400">{snippet.desc}</p>
                    </div>
                    <button
                      onClick={() => copyCode(snippet.code, idx)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto bg-slate-950 leading-relaxed custom-scrollbar">
                    {snippet.code}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-pink-400" />
                  <span>Real-Time Agora Connection Sandbox</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Have an Agora App ID? Test your real webcam and microphone audio/video tracks inside
                  this testbed.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Agora App ID
                    </label>
                    <input
                      type="text"
                      value={testAppId}
                      onChange={(e) => setTestAppId(e.target.value)}
                      placeholder="e.g. 4d7f8a92b... (from Agora Console)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Channel Name
                    </label>
                    <input
                      type="text"
                      value={testChannel}
                      onChange={(e) => setTestChannel(e.target.value)}
                      placeholder="chamet_live_room_1"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Mode
                    </label>
                    <select
                      value={testMode}
                      onChange={(e) => setTestMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="live">Live Broadcasting (mode: 'live')</option>
                      <option value="rtc">1-on-1 Video Call (mode: 'rtc')</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Role
                    </label>
                    <select
                      value={testRole}
                      onChange={(e) => setTestRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="host">Host / Broadcaster (Publish Camera)</option>
                      <option value="audience">Audience (Subscribe Only)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleRunAgoraTest}
                    disabled={isTesting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs hover:from-pink-600 hover:to-rose-700 transition-all shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? 'Connecting...' : 'Connect to Agora Channel'}
                  </button>

                  <button
                    onClick={handleStopAgoraTest}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Status Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
                  <span className="text-slate-400">Status: </span>
                  <span>{connectionStatus}</span>
                </div>

                {/* Local Video Container for Agora playback */}
                <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
                  <div
                    id="agora-tester-video-preview"
                    className="w-full h-full flex items-center justify-center text-slate-500 text-xs"
                  >
                    Agora local camera stream container will render here upon connection
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How to Test Agora WebRTC Locally (Step-by-Step)</span>
                </h4>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-pink-400 block mb-1">
                      Step 1: Obtain a Free Agora App ID
                    </span>
                    <p className="text-slate-400">
                      1. Visit{' '}
                      <a
                        href="https://console.agora.io"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline inline-flex items-center gap-0.5"
                      >
                        console.agora.io <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      and create a free developer account (10,000 free minutes monthly).
                      <br />
                      2. Create a new project and select <strong>"Testing Mode: App ID"</strong> (without
                      certificate token requirement) for instantaneous local prototyping.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-cyan-400 block mb-1">
                      Step 2: Dual Browser Tab Testing
                    </span>
                    <p className="text-slate-400">
                      1. Open this Chamet Live app in <strong>Tab A</strong> (acts as Host Streamer).
                      <br />
                      2. Open an Incognito window or second browser in <strong>Tab B</strong> (acts as
                      Audience Viewer or 1-on-1 caller).
                      <br />
                      3. When Tab A joins channel <code className="text-pink-300">room_1</code> and
                      publishes tracks, Tab B joins <code className="text-pink-300">room_1</code> and
                      immediately receives the <code className="text-pink-300">user-published</code> event,
                      rendering high-definition live video!
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">
                      Step 3: Audio Feedback & Echo Prevention
                    </span>
                    <p className="text-slate-400">
                      Always set your local preview <code className="text-emerald-300">&lt;video&gt;</code> element
                      to <code className="text-emerald-300">muted</code> so your own microphone does not loop
                      back through your speakers during local testing.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-1">
                      Step 4: Production Security & Token Generation
                    </span>
                    <p className="text-slate-400">
                      In production Chamet deployment, generate short-lived RTC tokens on your backend server
                      (Node.js/Express) using <code className="text-amber-300">agora-access-token</code> or{' '}
                      <code className="text-amber-300">RtcTokenBuilder</code> with an expiry of 24 hours. The
                      SDK triggers <code className="text-amber-300">client.on('token-privilege-will-expire')</code> to
                      allow seamless background token renewal without dropping calls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
