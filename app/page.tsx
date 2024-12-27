"use client";
import MaskImageCanvas from "./components/mask-image-canvas";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen min-w-full w-fit h-fit m-auto bg-gray-100 overflow-auto p-10">
      <MaskImageCanvas canvasWidth={500} canvasHeight={500} scrubberSize={20} />
    </div>
  );
}
