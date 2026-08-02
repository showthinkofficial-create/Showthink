import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export interface LightboxImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  currentIndex: number;
  onNavigate?: (newIndex: number) => void;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}: ImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex] || images[0];

  // Reset zoom & position whenever image changes
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, zoomLevel]);

  if (!isOpen || !currentImage) return null;

  const handlePrev = () => {
    const newIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    if (onNavigate) onNavigate(newIdx);
  };

  const handleNext = () => {
    const newIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    if (onNavigate) onNavigate(newIdx);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel === 1) {
      setZoomLevel(2.2);
    } else {
      handleResetZoom();
    }
  };

  // Mouse dragging when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-white">
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-[#FFC907] text-[#1A325D] rounded-full">
            {currentImage.category}
          </span>
          <span className="text-xs sm:text-sm text-gray-300 font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 text-white">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <span className="text-xs font-mono font-bold px-2 py-1 bg-white/10 rounded min-w-[50px] text-center text-[#FFC907]">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3.5}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="w-px h-6 bg-white/20 mx-1"></div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-all cursor-pointer shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Center Image Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-12"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Image Arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-black/50 hover:bg-[#FFC907] hover:text-[#1A325D] text-white transition-all cursor-pointer shadow-xl border border-white/10 active:scale-95"
            title="Previous Image (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Image Display */}
        <div
          className="relative max-w-full max-h-[75vh] transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onClick={toggleZoom}
        >
          <img
            src={currentImage.imageUrl}
            alt={currentImage.title}
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10 pointer-events-auto select-none"
            referrerPolicy="no-referrer"
            draggable={false}
          />

          {zoomLevel === 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white/90 text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none border border-white/10">
              <Maximize2 className="w-3 h-3 text-[#FFC907]" />
              <span>Click to Zoom</span>
            </div>
          )}
        </div>

        {/* Next Image Arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-black/50 hover:bg-[#FFC907] hover:text-[#1A325D] text-white transition-all cursor-pointer shadow-xl border border-white/10 active:scale-95"
            title="Next Image (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div
        className="p-4 sm:p-6 bg-gradient-to-t from-black/90 to-transparent text-center z-20 space-y-1"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base sm:text-xl font-sans font-extrabold text-[#FFC907] tracking-wide">
          {currentImage.title}
        </h3>
        <p className="text-xs text-gray-400">
          Use mouse wheel / click to zoom in &amp; out. Use arrow keys to navigate.
        </p>
      </div>
    </div>
  );
}
