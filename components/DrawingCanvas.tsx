
import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Eraser, Sparkles, Trash2, Undo2, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DrawingCanvasProps {
  onClose: () => void;
  onSend: (blob: Blob) => void;
  initialImage?: string | null;    
  width: number;
  height: number;
  isSaving?: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
    onClose, 
    onSend, 
    initialImage, 
    width,
    height,
    isSaving = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Brush Settings
  const [color, setColor] = useState('#6366f1'); 
  const [size, setSize] = useState(5);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);

  // Undo History
  const [history, setHistory] = useState<ImageData[]>([]);

  // Ensure valid dimensions
  const safeWidth = width || window.innerWidth;
  const safeHeight = height || window.innerHeight;

  useEffect(() => {
    // Init canvas
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.width = safeWidth;
        canvas.height = safeHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            if (initialImage) {
                console.log("[DrawingCanvas] Loading background image...", initialImage);
                const img = new Image();
                // CRITICAL: Set crossOrigin BEFORE src to prevent canvas tainting
                img.crossOrigin = "anonymous";
                // Cache-busting: Force browser to re-fetch with CORS headers even if cached without them
                const separator = initialImage.includes('?') ? '&' : '?';
                img.src = `${initialImage}${separator}cb=${Date.now()}`;
                
                img.onload = () => {
                    console.log("[DrawingCanvas] Background image loaded successfully.");
                    try {
                        ctx.drawImage(img, 0, 0, safeWidth, safeHeight);
                        saveHistory();
                    } catch (e) {
                        console.error("Image draw failed", e);
                    }
                };
                img.onerror = (e) => {
                    console.error("[DrawingCanvas] Failed to load background image", e);
                    // We continue without the background rather than breaking the app
                    saveHistory();
                };
            } else {
                 saveHistory();
            }
        }
    }
  }, [safeWidth, safeHeight, initialImage]);

  const saveHistory = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
          try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              setHistory(prev => [...prev.slice(-10), imageData]); 
          } catch (e) {
              console.warn("[DrawingCanvas] Could not save history (likely tainted canvas)", e);
          }
      }
  };

  const handleUndo = () => {
      if (history.length <= 1) return;
      const newHistory = [...history];
      newHistory.pop(); 
      const previousState = newHistory[newHistory.length - 1];
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && previousState) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(previousState, 0, 0);
          setHistory(newHistory);
      }
  };

  const getCoords = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSaving) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistory(); 
    setIsDrawing(true);
    
    const { x, y } = getCoords(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.shadowBlur = 0;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        if (isGlowing) {
            ctx.shadowBlur = size * 2;
            ctx.shadowColor = color;
        } else {
            ctx.shadowBlur = 0;
        }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isSaving) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    if (isSaving) return;
    if(!confirm("Clear drawing?")) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveHistory();
    }
  };

  const handleSend = () => {
      console.log("[DrawingCanvas] Checkmark clicked. Saving...");
      if (isSaving) {
          console.warn("[DrawingCanvas] Save already in progress.");
          return;
      }
      
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("[DrawingCanvas] Canvas ref is null");
        alert("System Error: Canvas not found.");
        return;
      }
      
      try {
          // This usually throws a SecurityError if the canvas is tainted (CORS issue)
          canvas.toBlob((blob) => {
              if (blob) {
                console.log(`[DrawingCanvas] Blob created successfully. Size: ${blob.size} bytes. Type: ${blob.type}`);
                onSend(blob);
              } else {
                console.error("[DrawingCanvas] canvas.toBlob() returned null. This usually means the canvas is tainted (CORS security violation).");
                alert("Security Error: The background image is blocking the save. Please check Supabase storage CORS settings.");
              }
          }, 'image/png');
      } catch (error) {
          console.error("[DrawingCanvas] Exception during toBlob:", error);
          alert("Security Error: The background image is blocking the save. Please check Supabase storage CORS settings.");
      }
  };

  // Render Toolbar via Portal to ensure it is fixed on top of everything
  const toolbar = (
      <div className="fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-3 z-[60] shadow-xl safe-area-top">
         <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 disabled:opacity-50">
             <X size={24} />
         </button>

         <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto no-scrollbar">
             <div className="flex items-center gap-3">
                 <input 
                   type="color" 
                   value={color} 
                   onChange={(e) => { setColor(e.target.value); setIsEraser(false); }}
                   disabled={isSaving}
                   className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none disabled:opacity-50"
                 />
                 
                 <button 
                    onClick={() => { setIsGlowing(!isGlowing); setIsEraser(false); }}
                    disabled={isSaving}
                    className={`p-2 rounded-full ${isGlowing && !isEraser ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-slate-800 text-slate-400'} disabled:opacity-50`}
                 >
                     <Sparkles size={18} />
                 </button>

                 <button 
                    onClick={() => setIsEraser(!isEraser)}
                    disabled={isSaving}
                    className={`p-2 rounded-full ${isEraser ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'} disabled:opacity-50`}
                 >
                     <Eraser size={18} />
                 </button>
                 
                 <button onClick={() => setSize(size === 5 ? 15 : 5)} disabled={isSaving} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 disabled:opacity-50">
                     {size}
                 </button>
             </div>
             
             <div className="w-px h-6 bg-slate-700 mx-2"></div>

             <button onClick={handleUndo} disabled={isSaving} className="text-slate-400 hover:text-white disabled:opacity-50"><Undo2 size={20} /></button>
             <button onClick={clearCanvas} disabled={isSaving} className="text-red-400 hover:text-red-300 disabled:opacity-50"><Trash2 size={20} /></button>
         </div>

         <button 
            onClick={handleSend} 
            disabled={isSaving}
            className={`px-4 py-2 rounded-full font-bold shadow-lg flex items-center justify-center min-w-[3.5rem] transition-colors ${isSaving ? 'bg-indigo-600 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
         >
             {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
         </button>
      </div>
  );

  return (
    <>
        {createPortal(toolbar, document.body)}
        <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 z-50 touch-none ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
            style={{ width: safeWidth, height: safeHeight }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
        {isSaving && (
            <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/20 pointer-events-none">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-medium">Saving drawing...</span>
                </div>
            </div>
        )}
    </>
  );
};

export default DrawingCanvas;
