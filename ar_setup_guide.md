# 8th Wall + React Three Fiber WebAR Setup Guide

This guide compiles the optimal settings, architectural decisions, and platform workarounds discovered during the setup of this repository to ensure high-performance, cross-browser WebAR on both desktop and mobile devices (especially iOS Safari).

---

## 1. Caching & CDN Configuration (Vercel)

iOS Safari/WebKit has strict sandboxing and aggressive caching heuristics. Caching 8th Wall's loader files and Web Worker scripts triggers WebKit engine loading bugs, causing tracking to fail on page reloads.

### Recommended `vercel.json` Headers:
- **Core Engine & Web Workers**: Disable caching entirely (`no-store, no-cache, must-revalidate`).
- **Heavy ML Models**: Enable aggressive caching (`immutable`) for `.tflite` and `.glb` files to preserve bandwidth.
- **Image Targets**: Force revalidation (`must-revalidate`) for targets under `/targets/` so changes propagate instantly.

```json
{
  "version": 2,
  "cleanUrls": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(xr.js|xr-tracking.js|xr-face.js)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "Pragma", "value": "no-cache" },
        { "key": "Expires", "value": "0" }
      ]
    },
    {
      "source": "/resources/(media-worker.js|semantics-worker.js)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "Pragma", "value": "no-cache" },
        { "key": "Expires", "value": "0" }
      ]
    },
    {
      "source": "/resources/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/targets/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/assets/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 2. Canvas Mounting & Target Registration

To track image targets correctly, 8th Wall requires target config data (`.json` databases) to be parsed and loaded prior to starting the engine.

### Rules for React Mounting:
1. **Always Mount `EighthwallCanvas`**: Do **not** conditionally render `<EighthwallCanvas>` (e.g., `permission && <EighthwallCanvas>`). Keep it mounted from page load.
2. **Synchronous Registration**: Because the canvas is always in the DOM, child `<ImageTracker>` components render and register their targets in the parent's registry (`d.current`) before the engine's initialization layout effect executes.

---

## 3. Splash Screen & Camera Initialization

iOS Safari blocks automatic camera initialization and video feed playbacks unless they are triggered directly by a **user gesture** (like a click or tap).

### Rules for the Start Experience Flow:
1. **Disable Auto-Start**: Pass `autoStart={false}` on the `<EighthwallCanvas>`. This prevents the engine from trying to start the camera automatically on page load.
2. **Context-Driven Launch**: Render the Splash Screen inside the canvas's `overlayChildren` prop.
3. **Capture the Gesture**: In the Splash Screen button click handler, call `startCamera()` (destructured from the `useXRContext()` hook). This starts the WebGL camera pipeline inside the user click gesture, preventing iOS Safari from blocking autoplay or freezing the camera stream.

---

## 4. Cross-Platform Audio Recording (Safari vs. Chrome)

iOS Safari does not support WebM (`audio/webm`) recording or playback. It natively utilizes the MP4 container (`audio/mp4` with AAC).

### Implementation Pattern:
1. **Dynamic MIME Detection**: Use `MediaRecorder.isTypeSupported()` to check supported formats in order of preference.
2. **Matched Blobs**: Ensure the `Blob` is created using the exact same MIME type used to record.

```typescript
const getSupportedMimeType = () => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/mpeg',
    'audio/wav'
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
};

// When recording starts
const mimeType = getSupportedMimeType();
const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

// When recording stops
const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
```
