'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function VideoDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">See DealershipAI in Action</h2>
        <p className="text-xl text-gray-600">Watch how we help dealerships dominate AI search results</p>
      </div>

      {/* Video Placeholder - Replace with actual video */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 aspect-video group">
        {/* Video Thumbnail/Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto group-hover:bg-white/20 transition-colors">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
            <p className="text-white/80 text-sm">Product Demo Video</p>
          </div>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all transform hover:scale-110 shadow-xl"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-gray-900" />
            ) : (
              <Play className="w-8 h-8 text-gray-900 ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="text-white text-sm">
              <span className="font-medium">DealershipAI</span> • Product Demo
            </div>
          </div>
        </div>
      </div>

      {/* Video Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[
          { title: '2-Minute Overview', desc: 'Quick introduction to core features' },
          { title: 'Real Results', desc: 'See actual dealership transformations' },
          { title: 'Easy Setup', desc: 'Get started in under 5 minutes' }
        ].map((feature, i) => (
          <div key={i} className="text-center p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

