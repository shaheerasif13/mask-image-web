"use client";
import ImageMasking from "./components/mask-image";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ImageMasking canvasWidth={500} canvasHeight={500} scrubberSize={20} />
    </div>
  );
}
