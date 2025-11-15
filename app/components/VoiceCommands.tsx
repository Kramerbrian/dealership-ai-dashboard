'use client';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface VoiceCommand {
  id: string;
  phrase: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'data' | 'ai' | 'system';
}

interface ARMarker {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  data: any;
  visible: boolean;
}

const VoiceCommands: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [arMode, setArMode] = useState(false);
  const [arMarkers, setArMarkers] = useState<ARMarker[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any | null>(null);

  // Voice commands configuration
  const voiceCommands: VoiceCommand[] = [
    {
      id: 'nav-dashboard',
      phrase: 'show dashboard',
      action: () => navigateToTab('overview'),
      description: 'Navigate to main dashboard',
      category: 'navigation'
    },
    {
      id: 'nav-ai-chat',
      phrase: 'open ai chat',
      action: () => navigateToTab('conversational'),
      description: 'Open AI Chat interface',
      category: 'navigation'
    },
    {
      id: 'nav-3d',
      phrase: 'show 3d landscape',
      action: () => navigateToTab('3d-landscape'),
      description: 'Open 3D competitor landscape',
      category: 'navigation'
    },
    {
      id: 'data-export',
      phrase: 'export data',
      action: () => handleDataExport(),
      description: 'Export current data to PDF/CSV',
      category: 'data'
    },
    {
      id: 'ai-analyze',
      phrase: 'analyze competitors',
      action: () => handleAIAnalysis(),
      description: 'Run AI competitor analysis',
      category: 'ai'
    },
    {
      id: 'system-dark-mode',
      phrase: 'toggle dark mode',
      action: () => handleDarkModeToggle(),
      description: 'Toggle dark/light theme',
      category: 'system'
    },
    {
      id: 'ar-activate',
      phrase: 'activate ar mode',
      action: () => activateARMode(),
      description: 'Activate AR visualization mode',
      category: 'system'
    }
  ];

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Speak now');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success('Stopped listening');
    }
  };

  const processVoiceCommand = (command: string) => {
    const matchedCommand = voiceCommands.find(cmd => 
      command.includes(cmd.phrase) || 
      command.includes(cmd.id.replace('-', ' '))
    );

    if (matchedCommand) {
      toast.success(`Executing: ${matchedCommand.description}`);
      matchedCommand.action();
    } else {
      toast.error(`Command not recognized: "${command}"`);
    }
  };

  const navigateToTab = (tabId: string) => {
    // This would integrate with the main dashboard's tab system
    console.log(`Navigating to tab: ${tabId}`);
    toast.success(`Navigating to ${tabId}`);
  };

  const handleDataExport = () => {
    toast.success('Exporting data...');
    // Integration with existing export functionality
  };

  const handleAIAnalysis = () => {
    toast.success('Running AI competitor analysis...');
    // Integration with AI analysis features
  };

  const handleDarkModeToggle = () => {
    toast.success('Toggling dark mode...');
    // Integration with theme toggle
  };

  const activateARMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setArMode(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize AR markers
      initializeARMarkers();
      toast.success('AR mode activated! Point camera at your screen');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied. AR mode unavailable.');
    }
  };

  const deactivateARMode = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setArMode(false);
    setArMarkers([]);
    toast.success('AR mode deactivated');
  };

  const initializeARMarkers = () => {
    // Simulate AR markers for dashboard elements
    const markers: ARMarker[] = [
      {
        id: 'kpi-1',
        name: 'VAI Score',
        position: { x: 0.2, y: 0.3, z: 0 },
        data: { value: 87.3, trend: 'up' },
        visible: true
      },
      {
        id: 'kpi-2',
        name: 'Traffic',
        position: { x: 0.7, y: 0.3, z: 0 },
        data: { value: 125000, trend: 'up' },
        visible: true
      },
      {
        id: 'competitor-1',
        name: 'AutoMax',
        position: { x: 0.3, y: 0.7, z: 0 },
        data: { score: 85, threat: 'high' },
        visible: true
      }
    ];
    setArMarkers(markers);
  };

  const getCommandsByCategory = (category: string) => {
    return voiceCommands.filter(cmd => cmd.category === category);
  };

  return (
    <div className="voice-commands">
      <h3>🎤 Voice Commands & AR/VR Integration</h3>
      <p>Control your dashboard with voice commands and visualize data in augmented reality.</p>

      {/* Voice Commands Section */}
      <div className="voice-section">
        <h4>Voice Commands</h4>
        <div className="voice-controls">
          {isSupported ? (
            <div className="voice-buttons">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`voice-button ${isListening ? 'listening' : ''}`}
                disabled={!isSupported}
              >
                {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
              </button>
              <div className="voice-status">
                Status: {isListening ? 'Listening...' : 'Ready'}
              </div>
            </div>
          ) : (
            <div className="voice-error">
              Voice recognition not supported in this browser
            </div>
          )}

          {transcript && (
            <div className="transcript">
              <strong>You said:</strong> "{transcript}"
            </div>
          )}
        </div>

        {/* Voice Commands Reference */}
        <div className="commands-reference">
          <h5>Available Commands:</h5>
          {['navigation', 'data', 'ai', 'system'].map(category => (
            <div key={category} className="command-category">
              <h6>{category.charAt(0).toUpperCase() + category.slice(1)}</h6>
              <ul>
                {getCommandsByCategory(category).map(cmd => (
                  <li key={cmd.id}>
                    <code>"{cmd.phrase}"</code> - {cmd.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* AR/VR Section */}
      <div className="ar-section">
        <h4>Augmented Reality Mode</h4>
        <div className="ar-controls">
          <button
            onClick={arMode ? deactivateARMode : activateARMode}
            className={`ar-button ${arMode ? 'active' : ''}`}
          >
            {arMode ? '📱 Deactivate AR' : '📱 Activate AR'}
          </button>
        </div>

        {arMode && (
          <div className="ar-viewport">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="ar-camera"
            />
            <div className="ar-overlay">
              {arMarkers.map(marker => (
                <div
                  key={marker.id}
                  className="ar-marker"
                  style={{
                    left: `${marker.position.x * 100}%`,
                    top: `${marker.position.y * 100}%`,
                    display: marker.visible ? 'block' : 'none'
                  }}
                >
                  <div className="marker-content">
                    <h6>{marker.name}</h6>
                    <div className="marker-data">
                      {Object.entries(marker.data).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {arMode && (
          <div className="ar-instructions">
            <h5>AR Instructions:</h5>
            <ul>
              <li>Point your camera at the dashboard screen</li>
              <li>AR markers will appear over data elements</li>
              <li>Tap markers to interact with data</li>
              <li>Move around to see different perspectives</li>
            </ul>
          </div>
        )}
      </div>

      {/* VR Integration Placeholder */}
      <div className="vr-section">
        <h4>Virtual Reality Mode</h4>
        <div className="vr-info">
          <p>VR mode requires WebXR support and VR headset.</p>
          <button className="vr-button" disabled>
            🥽 Enter VR Mode (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommands;
