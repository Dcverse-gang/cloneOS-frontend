import JSZip from 'jszip';

/**
 * Download a remote image URL as a file. Falls back to opening in a new tab if CORS blocks fetch.
 */
export async function downloadImageFromUrl(url, filename) {
  if (!url) return;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function extFromBlobType(type) {
  if (type?.includes('png')) return 'png';
  if (type?.includes('jpeg') || type?.includes('jpg')) return 'jpg';
  if (type?.includes('webp')) return 'webp';
  return 'png';
}

/**
 * Zip all sketch URLs from ordered frames (scene order).
 */
export async function downloadSketchesZip(frames, zipName = 'storyboard-sketches.zip') {
  const zip = new JSZip();
  const list = (frames || []).filter((f) => f.sketchUrl);
  for (const frame of list) {
    try {
      const res = await fetch(frame.sketchUrl, { mode: 'cors' });
      if (!res.ok) continue;
      const blob = await res.blob();
      const ext = extFromBlobType(blob.type);
      zip.file(`scene-${frame.sequenceOrder}-sketch.${ext}`, blob);
    } catch {
      /* skip scene if blocked */
    }
  }
  if (Object.keys(zip.files).length === 0) {
    throw new Error('Could not download sketches (network or CORS).');
  }
  const out = await zip.generateAsync({ type: 'blob' });
  const objectUrl = URL.createObjectURL(out);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
