# Sound Reverse - Audio Imitation Game

A modern web application that tests your audio memory skills by having you record audio, listen to it in reverse, and then try to imitate the reversed version. The app provides scoring based on how closely your imitation matches the original.

## 🎯 Features

### Core Functionality
- **Audio Recording**: High-quality audio recording using the Web Audio API
- **Reverse Playback**: Listen to your recordings played in reverse
- **Imitation Challenge**: Record your attempt to recreate the reversed audio
- **Similarity Scoring**: Advanced audio analysis to score your imitation accuracy
- **Recording History**: Save and manage all your recording sessions

### User Experience
- **Intuitive Flow**: Clear step-by-step process with visual indicators
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Feedback**: Live recording timer and playback controls
- **Progress Tracking**: Visual progress indicators for each step

### Advanced Features
- **Export & Share**: Download recordings or share them with others
- **History Management**: View, play, and manage all your past recordings
- **Scoring System**: Detailed similarity analysis with multiple metrics
- **Local Storage**: All data stored locally for privacy
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser with microphone access

### Installation

1. **Clone or download the project**
   ```bash
   cd sound_reverse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎮 How to Play

1. **Record Original Audio**
   - Click the microphone button to start recording
   - Record any audio you want to test your memory with
   - Click stop when finished

2. **Listen to Reversed Audio**
   - Your recording will be automatically reversed
   - Listen to it as many times as you need
   - Try to memorize the pattern and rhythm

3. **Record Your Imitation**
   - Click "Ready to Record Imitation" when you're ready
   - Try to recreate the same audio you heard in reverse
   - Click stop when finished

4. **See Your Score**
   - Your imitation will be played in reverse
   - Get a similarity score based on how close you were
   - View detailed feedback and suggestions

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, consistent icons

### Audio Processing
- **Web Audio API**: High-quality audio recording and playback
- **MediaRecorder API**: Efficient audio capture
- **Custom Audio Utils**: Audio reversal and processing algorithms
- **Similarity Analysis**: Multi-metric audio comparison

### Key Components

#### AudioRecorder
- Handles microphone access and recording
- Real-time recording timer
- Visual recording indicators

#### AudioPlayer
- Custom audio playback controls
- Volume and progress controls
- Support for reversed audio playback

#### HistoryPanel
- Manages recording history
- Export and share functionality
- Detailed recording metadata

#### ScoreDisplay
- Visual similarity scoring
- Performance feedback
- Achievement levels

### Audio Processing Pipeline

1. **Recording**: Capture audio using MediaRecorder API
2. **Reversal**: Use Web Audio API to reverse audio samples
3. **Analysis**: Calculate similarity using multiple metrics:
   - Spectral similarity (frequency content)
   - Temporal similarity (rhythm and timing)
   - Amplitude similarity (volume patterns)
4. **Scoring**: Weighted combination of similarity metrics

## 🎨 Customization

### Styling
The app uses CSS custom properties for easy theming. Key variables in `src/index.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
}
```

### Audio Settings
Modify recording quality in `src/hooks/useAudioRecorder.js`:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
    channelCount: 1
  }
})
```

## 📱 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.5+)
- **Edge**: Full support

### Required APIs
- MediaRecorder API
- Web Audio API
- Local Storage API
- Web Share API (optional, for sharing)

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── AudioRecorder.jsx
│   ├── AudioPlayer.jsx
│   ├── HistoryPanel.jsx
│   └── ScoreDisplay.jsx
├── hooks/              # Custom React hooks
│   ├── useAudioRecorder.js
│   └── useAudioPlayer.js
├── utils/              # Utility functions
│   ├── audioUtils.js
│   ├── similarityUtils.js
│   └── storageUtils.js
├── App.jsx             # Main application component
├── App.css             # Main application styles
├── index.css           # Global styles
└── main.jsx            # Application entry point
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🐛 Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Ensure browser has microphone permissions
   - Check browser settings for site permissions

2. **Audio Not Playing**
   - Check browser audio settings
   - Ensure audio is not muted
   - Try refreshing the page

3. **Recording Quality Issues**
   - Check microphone quality
   - Ensure stable internet connection
   - Close other applications using microphone

4. **Storage Issues**
   - Clear browser cache if storage is full
   - Check available disk space
   - Clear old recordings from history

### Performance Tips

- Close unnecessary browser tabs
- Use a good quality microphone
- Record in a quiet environment
- Keep recordings under 30 seconds for best performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Web Audio API documentation
- React and Vite communities
- Framer Motion for animations
- Lucide for beautiful icons

## 🔮 Future Enhancements

- [ ] Real-time audio visualization
- [ ] Multiple difficulty levels
- [ ] Social features and leaderboards
- [ ] Cloud storage integration
- [ ] Advanced audio effects
- [ ] Mobile app version
- [ ] Multiplayer mode
- [ ] Custom audio challenges

---

**Have fun testing your audio memory skills! 🎵**
