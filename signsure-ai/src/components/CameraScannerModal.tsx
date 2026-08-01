import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, Trash2, X, Sparkles, Layers, ShieldCheck, ArrowRight, Upload, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (file: File) => void;
  modalTitle?: string;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
  modalTitle = 'Scan Physical Contract Document',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState<number | null>(null);

  // Start camera stream when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedPages([]);
      setCameraError(null);
      setPreviewPageIndex(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings or upload an image/PDF file instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device detected on this system. You can use native file upload or sample files.');
      } else {
        setCameraError('Unable to start live camera stream. You can upload an image from your device or use your device camera app.');
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Flash animation trigger
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get high quality JPEG data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPages((prev) => [...prev, imageDataUrl]);
  };

  const deleteCapturedPage = (index: number) => {
    setCapturedPages((prev) => prev.filter((_, i) => i !== index));
    if (previewPageIndex === index) {
      setPreviewPageIndex(null);
    } else if (previewPageIndex !== null && previewPageIndex > index) {
      setPreviewPageIndex(previewPageIndex - 1);
    }
  };

  // Fallback native photo capture file input
  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishScanning = async () => {
    if (capturedPages.length === 0) return;

    if (capturedPages.length === 1) {
      // Convert single image page dataUrl to File
      const response = await fetch(capturedPages[0]);
      const blob = await response.blob();
      const file = new File([blob], `Scanned_Legal_Document_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCaptureComplete(file);
      onClose();
      return;
    }

    // Multi-page stitching onto a clean vertical multi-page composite canvas
    const images = await Promise.all(
      capturedPages.map((src) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      })
    );

    const maxWidth = Math.max(...images.map((img) => img.width));
    const paddingBetweenPages = 20;
    const totalHeight = images.reduce((acc, img) => acc + (img.height * (maxWidth / img.width)) + paddingBetweenPages, 0);

    const stitchedCanvas = document.createElement('canvas');
    stitchedCanvas.width = maxWidth;
    stitchedCanvas.height = totalHeight;

    const ctx = stitchedCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, stitchedCanvas.width, stitchedCanvas.height);

      let currentY = 0;
      images.forEach((img) => {
        const scaledHeight = img.height * (maxWidth / img.width);
        ctx.drawImage(img, 0, currentY, maxWidth, scaledHeight);
        currentY += scaledHeight + paddingBetweenPages;
      });

      stitchedCanvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `Scanned_MultiPage_Contract_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCaptureComplete(file);
          onClose();
        }
      }, 'image/jpeg', 0.90);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hidden Canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden fallback mobile photo picker */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleNativeCapture}
          className="hidden"
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Align contract pages inside the viewfinder box and tap Snap
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col items-center">
          {/* Camera Viewfinder Box */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center group shadow-inner">
            {/* Flash Effect Layer */}
            {isFlashActive && (
              <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150 animate-pulse" />
            )}

            {/* Live Stream or Error Fallback */}
            {!cameraError ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Document Frame Guide Overlay */}
                <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-indigo-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10 transition-all">
                  {/* Four Corner Alignment Bracket Markers */}
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                    <div className="w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-indigo-300 border border-indigo-500/30 rounded-full shadow-lg">
                      Position Document Page
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                    <div className="w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Top Control Overlay (Flip camera) */}
                <div className="absolute top-3 right-3 z-20">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-xl border border-white/10 backdrop-blur-md text-xs font-medium flex items-center space-x-1.5 shadow-lg transition-colors"
                    title="Switch Camera (Front/Back)"
                  >
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                    <span className="hidden sm:inline">Flip Camera</span>
                  </button>
                </div>
              </>
            ) : (
              /* Camera Error / Fallback Card */
              <div className="p-6 text-center space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Take Photo / Select Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Shutter Action & Quick Capture Bar */}
          <div className="w-full flex items-center justify-between px-2 pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Captured Pages: <strong className="text-white font-bold">{capturedPages.length}</strong></span>
            </div>

            {/* Primary Snap Button */}
            <button
              type="button"
              disabled={!!cameraError || isCameraLoading}
              onClick={capturePage}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center space-x-2 active:scale-95 transition-all"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span>Snap Page ({capturedPages.length + 1})</span>
            </button>

            {/* Native Mobile Camera Button Shortcut */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/10 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Native App</span>
            </button>
          </div>

          {/* Scanned Pages Strip Preview */}
          {capturedPages.length > 0 && (
            <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Captured Pages Strip ({capturedPages.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Tap thumbnail to view full resolution</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                {capturedPages.map((pageSrc, idx) => (
                  <div
                    key={idx}
                    className={`relative shrink-0 w-20 h-28 rounded-xl border-2 overflow-hidden group cursor-pointer transition-all ${
                      previewPageIndex === idx ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-white/10 hover:border-indigo-400/50'
                    }`}
                    onClick={() => setPreviewPageIndex(idx)}
                  >
                    <img src={pageSrc} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                      #{idx + 1}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCapturedPage(idx);
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md opacity-90 group-hover:opacity-100 transition-opacity shadow"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Resolution Preview Zoom Modal if clicked */}
          {previewPageIndex !== null && capturedPages[previewPageIndex] && (
            <div className="w-full bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-2 relative">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-xs font-bold text-indigo-300">
                  Previewing Page #{previewPageIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPageIndex(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Preview
                </button>
              </div>
              <div className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-black flex justify-center">
                <img src={capturedPages[previewPageIndex]} alt="Preview" className="max-h-60 object-contain" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={capturedPages.length === 0}
            onClick={handleFinishScanning}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Analyze {capturedPages.length} Scanned Page{capturedPages.length > 1 ? 's' : ''}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
