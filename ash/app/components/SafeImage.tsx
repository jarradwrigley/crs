import Image from "next/image";
import { useState } from "react";
import { FileX, ImageIcon, User, FileText } from "lucide-react";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackType?: "placeholder" | "icon" | "text" | "avatar";
  fallbackText?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

const SafeImage = ({
  src,
  alt,
  width = 300,
  height = 200,
  className = "",
  fallbackType = "placeholder",
  fallbackText,
  fill = false,
  sizes,
  priority = false,
}: SafeImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if src is falsy (null, undefined, empty string)
  const shouldShowFallback = !src || hasError;

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Render different fallback types
  const renderFallback = () => {
    const baseClasses = fill
      ? "absolute inset-0 flex items-center justify-center bg-gray-100"
      : `flex items-center justify-center bg-gray-100 ${className}`;

    const style = fill ? {} : { width, height };

    switch (fallbackType) {
      case "icon":
        return (
          <div className={baseClasses} style={style}>
            <FileX className="w-8 h-8 text-gray-400" />
          </div>
        );

      case "avatar":
        return (
          <div className={baseClasses} style={style}>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        );

      case "text":
        return (
          <div className={`${baseClasses} text-gray-500 text-sm`} style={style}>
            {fallbackText || "Image not available"}
          </div>
        );

      case "placeholder":
      default:
        return (
          <div className={baseClasses} style={style}>
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No image</p>
            </div>
          </div>
        );
    }
  };

  // If no src or error occurred, show fallback
  if (shouldShowFallback) {
    return renderFallback();
  }

  // Render the actual image
  return (
    <div className={fill ? "relative" : "relative inline-block"}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${
            fill ? "" : className
          }`}
          style={fill ? {} : { width, height }}
        />
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
};

export default SafeImage
