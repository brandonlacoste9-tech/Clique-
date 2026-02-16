# Clique - The Sovereign Social Reality

Clique is the French version of Snapchat and the social heart of the Empire. We are taking the ephemeral nature of Snapchat and dressing it in the Imperial Gold and Leather aesthetic.

## Features

### 🎥 The Lens - Camera UI
A clean, sophisticated camera interface featuring:
- **Gold-rimmed viewfinder** - An elegant border that frames your captures
- **Burnished Gold Glow** - A stunning flash animation when you capture a moment
- No clutter, just pure elegance

### 📜 Sealed Dispatches
Communication redefined with imperial sophistication:
- Messages are called **Dispatches**, not "Snaps"
- Arrive as **digital dossiers** sealed with a gold wax-style "C"
- **Tap-to-break seal** interaction reveals the content
- Ephemeral by design - files are scrubbed after viewing

### 👥 La Clique - The Inner Circle
Your exclusive social network:
- Friend list is called **La Clique**
- **Leather-textured background** for tactile navigation
- **Verified nodes only** - No discover page, no ads
- Real-time status indicators (En ligne/Hors ligne)
- Direct dispatch sending to your inner circle

### 🔒 Ephemeral P2P (Conceptual)
Privacy-first architecture:
- Media designed for peer-to-peer transfer (not central servers)
- **System Scrubber** notification for file deletion after viewing
- True ephemeral messaging

## Design Aesthetic

**Imperial Gold and Leather Theme:**
- Primary colors: Burnished Gold (#d4af37) and Rich Leather Browns
- Typography: Classic serif fonts (Georgia)
- Textures: Leather-grain backgrounds with subtle patterns
- Lighting: Gold glows and elegant shadows
- No modern flat design - only imperial luxury

## Technology Stack

- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with animations
- **WebRTC Ready** - Prepared for P2P implementation

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
Clique-/
├── src/
│   ├── components/
│   │   ├── CameraLens.jsx      # Gold-rimmed camera interface
│   │   ├── DispatchList.jsx    # Sealed dispatch viewer
│   │   └── LaClique.jsx        # Friend list interface
│   ├── styles/
│   │   ├── index.css           # Global styles
│   │   ├── App.css             # Main app and navigation styles
│   │   ├── CameraLens.css      # Camera component styles
│   │   ├── DispatchList.css    # Dispatch component styles
│   │   └── LaClique.css        # Friend list styles
│   ├── App.jsx                 # Main application component
│   └── main.jsx                # Application entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
└── package.json                # Project dependencies

```

## Key Interactions

1. **Navigate** between views using the leather-textured buttons at the bottom
2. **Capture moments** with the gold capture button in The Lens
3. **Break seals** by tapping the gold "C" on any dispatch
4. **Send dispatches** to members of La Clique

## Future Enhancements

- WebRTC implementation for true P2P media transfer
- System Scrubber animation with file deletion
- Video capture support
- End-to-end encryption
- Voice and text messaging
- Advanced camera filters with gold effects

## License

ISC License - See LICENSE file for details
