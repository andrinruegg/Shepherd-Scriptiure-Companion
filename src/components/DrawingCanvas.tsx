
import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Eraser, Sparkles, Trash2, Undo2, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const DrawingCanvas: React.FC<{ onClose: () => void, onSend: (blob: Blob) => void, initialImage?: string | null, width: number, height: number, isSaving?: boolean }> = ({ onClose, onSend, initialImage, width, height, isSaving }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [size, setSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.width = width || window.innerWidth;
        canvas.height = height || window.innerHeight;
        const ctx = canvas.getContext('2d');
        if (ctx && initialImage) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = initialImage;
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }
  }, [width, height, initialImage]);

  const draw = (e: any) => {
    if (!isDrawing || isSaving) return;
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y); ctx.lineWidth = size; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.stroke();
  };

  return (
    <>
        {createPortal(<div className="fixed top-0 left-0 right-0 bg-slate-900 p-4 flex justify-between items-center z-[120] shadow-2xl"><button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><X size={28}/></button><div className="flex items-center gap-6"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-none"/><button onClick={()=>setSize(size === 5 ? 15 : 5)} className={`w-10 h-10 rounded-full font-black text-xs border-2 transition-all ${size === 15 ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-white border-slate-700'}`}>{size}</button></div><button onClick={() => canvasRef.current?.toBlob(b => b && onSend(b))} className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"><Check size={24}/></button></div>, document.body)}
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-[110] touch-none cursor-crosshair bg-transparent" onMouseDown={(e)=>{setIsDrawing(true); const ctx=canvasRef.current?.getContext('2d'); ctx?.beginPath();}} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)} onTouchStart={(e)=>{setIsDrawing(true); const ctx=canvasRef.current?.getContext('2d'); ctx?.beginPath();}} onTouchMove={draw} onTouchEnd={()=>setIsDrawing(false)} />
    </>
  );
};

export default DrawingCanvas;
