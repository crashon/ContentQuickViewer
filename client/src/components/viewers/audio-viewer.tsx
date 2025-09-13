import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Repeat } from "lucide-react";
import type { FileEntry } from "@shared/schema";

interface AudioViewerProps {
  file: FileEntry;
}

export default function AudioViewer({ file }: AudioViewerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(24).fill(0.2));

  const { data: fileContent, isLoading } = useQuery({
    queryKey: ["/api/files/content", { path: file.path }],
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeating]);

  // Animate visualizer bars
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setVisualizerBars(prev => 
          prev.map(() => 0.2 + Math.random() * 0.6)
        );
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse bg-muted rounded-lg w-48 h-48 mx-auto mb-4"></div>
        <div className="text-muted-foreground">Loading audio...</div>
      </div>
    );
  }

  if (!fileContent || fileContent.type !== 'binary') {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Unable to load audio
      </div>
    );
  }

  return (
    <div className="p-4">
      <audio ref={audioRef} src={fileContent.url} />
      
      <div className="text-center mb-4">
        {/* Album Art Placeholder */}
        <div className="w-48 h-48 mx-auto rounded-lg bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 mb-4 flex items-center justify-center">
          <div className="text-white text-6xl">🎵</div>
        </div>
        
        <h3 className="font-semibold text-lg" data-testid="text-track-title">
          {file.name.replace(/\.[^/.]+$/, "")}
        </h3>
        <p className="text-muted-foreground" data-testid="text-artist">Unknown Artist</p>
        <p className="text-sm text-muted-foreground">Sample Album • 2023</p>
      </div>
      
      {/* Audio Visualizer */}
      <div className="h-16 bg-card border border-border rounded-lg mb-4 p-2" data-testid="audio-visualizer">
        <div className="flex items-end justify-center h-full gap-1">
          {visualizerBars.map((height, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-primary to-accent rounded-sm transition-all duration-100 ease-out"
              style={{ 
                height: `${height * 100}%`,
                width: '4px',
                minHeight: '4px'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div 
        className="w-full h-1 bg-muted rounded-full cursor-pointer mb-4"
        onClick={handleSeek}
        data-testid="audio-progress"
      >
        <div 
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
      
      {/* Audio Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground" data-testid="text-current-time">
          {formatTime(currentTime)}
        </span>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            title="Previous"
            data-testid="button-previous-track"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={togglePlay}
            className="rounded-full"
            title="Play/Pause (Space)"
            data-testid="button-play-pause-audio"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="Next"
            data-testid="button-next-track"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRepeating(!isRepeating)}
            className={isRepeating ? "text-accent" : ""}
            title="Repeat (R)"
            data-testid="button-repeat"
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>
        
        <span className="text-sm text-muted-foreground" data-testid="text-duration">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
