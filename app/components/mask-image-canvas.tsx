import React, { useEffect, useRef, useState } from "react";

interface MaskImageCanvasProps {
  canvasWidth: number;
  canvasHeight: number;
}

const MaskImageCanvas: React.FC<MaskImageCanvasProps> = ({
  canvasWidth,
  canvasHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberLayerRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<"scrub" | "erase">("scrub");

  // Define constants inside the component
  const SCRUBBER_SIZE = 20;
  const ERASER_SIZE = 20;
  const SCRUBBER_COLOR = "black";

  // Draw the uploaded image on the base canvas
  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = new Image();

    if (ctx && canvas) {
      image.src = imageSrc;

      image.onload = () => {
        // Scale the image to fit within the canvas
        const scale = Math.min(
          canvasWidth / image.width,
          canvasHeight / image.height
        );
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Clear the canvas and draw the image
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(
          image,
          (canvasWidth - scaledWidth) / 2,
          (canvasHeight - scaledHeight) / 2,
          scaledWidth,
          scaledHeight
        );

        // Clear the scrubber layer
        const scrubberCanvas = scrubberLayerRef.current;
        const scrubberCtx = scrubberCanvas?.getContext("2d");
        if (scrubberCtx) {
          scrubberCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        }
      };
    }
  }, [imageSrc, canvasWidth, canvasHeight]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = scrubberLayerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use different sizes based on the mode
    const size = mode === "erase" ? ERASER_SIZE : SCRUBBER_SIZE;

    ctx.globalCompositeOperation =
      mode === "erase" ? "destination-out" : "source-over";
    ctx.fillStyle = mode === "erase" ? "white" : SCRUBBER_COLOR;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleMouseDown = () => {
    const canvas = scrubberLayerRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove as any);
    }
  };

  const handleMouseUp = () => {
    const canvas = scrubberLayerRef.current;
    if (canvas) {
      canvas.removeEventListener("mousemove", handleMouseMove as any);
    }
  };

  const handleClearCanvas = () => {
    const canvas = scrubberLayerRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleDownload = () => {
    const baseCanvas = canvasRef.current;
    const scrubberCanvas = scrubberLayerRef.current;
    if (!baseCanvas || !scrubberCanvas) return;

    // Create a mask-only canvas for downloading
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvasWidth;
    maskCanvas.height = canvasHeight;

    const maskCtx = maskCanvas.getContext("2d");
    if (maskCtx) {
      // Fill the canvas with a white background
      maskCtx.fillStyle = "white";
      maskCtx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw the scrubber layer onto the mask canvas
      maskCtx.drawImage(scrubberCanvas, 0, 0);

      // Download the mask image
      const link = document.createElement("a");
      link.download = "masked-image.png";
      link.href = maskCanvas.toDataURL();
      link.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setImageSrc(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-2 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Canvas */}
      <div className="relative">
        {/* Base Image Layer */}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border shadow-lg bg-white"
        />

        {/* Scrubber Layer */}
        <canvas
          ref={scrubberLayerRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute top-0 left-0"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Control Panel */}
      <div className="flex gap-4">
        {/* Scrub Mode */}
        <button
          onClick={() => setMode("scrub")}
          className={`px-4 py-2 rounded-md shadow-md ${
            mode === "scrub"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Scrub
        </button>

        {/* Erase Mode */}
        <button
          onClick={() => setMode("erase")}
          className={`px-4 py-2 rounded-md shadow-md ${
            mode === "erase"
              ? "bg-red-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Erase
        </button>

        {/* Clear Canvas */}
        <button
          onClick={handleClearCanvas}
          className="px-4 py-2 rounded-md shadow-md bg-gray-500 hover:bg-gray-700 text-white"
        >
          Clear
        </button>

        {/* Download Mask */}
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-md shadow-md bg-green-500 hover:bg-green-700 text-white"
        >
          Download Mask
        </button>
      </div>
    </div>
  );
};

export default MaskImageCanvas;
