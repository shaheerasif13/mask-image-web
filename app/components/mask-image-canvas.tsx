import { useEffect, useRef, useState } from "react";

const MaskImageCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberLayerRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<"scrub" | "erase">("scrub");

  // State for scrubber and eraser sizes and scrub color
  const [scrubberSize, setScrubberSize] = useState(20);
  const [eraserSize, setEraserSize] = useState(20);
  const [scrubberColor, setScrubberColor] = useState("black");

  // State for dynamic canvas size, with initial values
  const [canvasWidth, setCanvasWidth] = useState<number>(500); // Default canvas width
  const [canvasHeight, setCanvasHeight] = useState<number>(500); // Default canvas height

  // Define constants for default sizes
  const DEFAULT_SCRUBBER_SIZE = 20;
  const DEFAULT_ERASER_SIZE = 20;
  const DEFAULT_SCRUBBER_COLOR = "black";
  const ERASER_COLOR = "white";

  // Draw the uploaded image on the base canvas
  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = new Image();

    if (ctx && canvas) {
      image.src = imageSrc;

      image.onload = () => {
        // Set the canvas size based on the image dimensions (Remove this if you want to keep the default canvas size)
        setCanvasWidth(image.width);
        setCanvasHeight(image.height);

        // Clear the canvas and draw the image
        const scale = Math.min(
          canvasWidth / image.width,
          canvasHeight / image.height
        );
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

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
    const size = mode === "erase" ? eraserSize : scrubberSize;

    ctx.globalCompositeOperation =
      mode === "erase" ? "destination-out" : "source-over";
    ctx.fillStyle = mode === "erase" ? ERASER_COLOR : scrubberColor;
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

  // Reset scrubber and eraser sizes to their defaults
  const handleResetScrubberSize = () => {
    setScrubberSize(DEFAULT_SCRUBBER_SIZE);
  };

  const handleResetEraserSize = () => {
    setEraserSize(DEFAULT_ERASER_SIZE);
  };

  const handleResetScrubberColor = () => {
    setScrubberColor(DEFAULT_SCRUBBER_COLOR);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Canvas */}
      <div className="relative mb-6">
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
      <div className="flex gap-6">
        {/* Scrub Mode */}
        <button
          onClick={() => setMode("scrub")}
          className={`px-6 py-2 rounded-md shadow-md ${
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
          className={`px-6 py-2 rounded-md shadow-md ${
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
          className="px-6 py-2 rounded-md shadow-md bg-gray-500 hover:bg-gray-700 text-white"
        >
          Clear
        </button>

        {/* Download Mask */}
        <button
          onClick={handleDownload}
          className="px-6 py-2 rounded-md shadow-md bg-green-500 hover:bg-green-700 text-white"
        >
          Download Mask
        </button>
      </div>

      {/* Range Controls */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        {/* Scrubber Size Control */}
        <div>
          <label className="block font-medium text-gray-700">
            Scrubber Size
          </label>
          <input
            type="range"
            min="10"
            max="50"
            value={scrubberSize}
            onChange={(e) => setScrubberSize(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between">
            <span>{scrubberSize}</span>
            <button
              onClick={handleResetScrubberSize}
              className="text-xs text-blue-500"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Eraser Size Control */}
        <div>
          <label className="block font-medium text-gray-700">Eraser Size</label>
          <input
            type="range"
            min="10"
            max="50"
            value={eraserSize}
            onChange={(e) => setEraserSize(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between">
            <span>{eraserSize}</span>
            <button
              onClick={handleResetEraserSize}
              className="text-xs text-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Scrubber Color Control */}
      <div className="mt-6">
        <label className="block font-medium text-gray-700">
          Scrubber Color
        </label>
        <input
          type="color"
          value={scrubberColor}
          onChange={(e) => setScrubberColor(e.target.value)}
          className="w-16 h-10 border-none"
        />
        <button
          onClick={handleResetScrubberColor}
          className="mt-2 text-xs text-blue-500"
        >
          Reset Color
        </button>
      </div>
    </div>
  );
};

export default MaskImageCanvas;
