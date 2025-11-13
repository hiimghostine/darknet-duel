import React from 'react';

interface VideoTutorialProps {
  videoSrc: string;
  title?: string;
  onComplete?: () => void;
  onClose?: () => void;
  autoPlay?: boolean;
}

const VideoTutorial: React.FC<VideoTutorialProps> = ({
  videoSrc,
  title = "Darknet Duel Tutorial",
  onClose,
  autoPlay = false
}) => {
  // Extract YouTube video ID from the URL
  const getYouTubeEmbedUrl = (url: string) => {
    // Handle various YouTube URL formats
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1].split('?')[0]
      : url.split('v=')[1]?.split('&')[0];
    
    return `https://www.youtube.com/embed/${videoId}${autoPlay ? '?autoplay=1' : ''}`;
  };

  const embedUrl = getYouTubeEmbedUrl(videoSrc);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-6xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
          {/* YouTube Embed */}
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Tutorial Description */}
        <div className="mt-4 text-white text-center">
          <p className="text-gray-300">
            Learn the basics of Darknet Duel - cybersecurity warfare in card game form
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;
