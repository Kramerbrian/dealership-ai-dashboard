# Ambient Audio for Hero Section

## Required File: `ai-hum.mp3`

The HeroSection_CupertinoNolan component supports optional ambient audio that plays on user interaction.

### Requirements:
- **Filename**: `ai-hum.mp3`
- **Location**: `/public/audio/ai-hum.mp3`
- **Format**: MP3
- **Duration**: 5-30 seconds (will loop)
- **Volume**: Low intensity, ambient background sound
- **Suggested characteristics**:
  - Subtle electronic hum or drone
  - Frequency range: 100-500Hz
  - Non-intrusive, atmospheric
  - Professional/cinematic quality

### How to Add:

1. **Generate or source** an ambient audio file
2. **Convert** to MP3 format if needed
3. **Save** as `/public/audio/ai-hum.mp3`
4. **Test** by unmuting the audio toggle on the landing page

### Free Sources:
- Freesound.org (search: "ambient hum", "drone", "synth pad")
- Pixabay Audio Library
- YouTube Audio Library

### Current Status:
⚠️ **File not present** - Component will gracefully handle missing audio with no errors.

The audio player will only activate when users hover over the CTA button or manually unmute.
