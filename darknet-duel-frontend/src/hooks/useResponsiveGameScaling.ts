import { useState, useEffect, useMemo } from 'react';

export interface GameScaling {
  // Card dimensions
  cardWidth: number;
  cardHeight: number;
  cardWidthLg: number;
  cardHeightLg: number;
  
  // Expanded card dimensions
  expandedCardWidth: number;
  expandedCardHeight: number;
  
  // Spacing
  cardGap: number;
  containerPadding: number;
  
  // Scale factor
  scaleFactor: number;
  
  // Breakpoint info
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // Container heights (for limiting overflow)
  playerHandHeight: string;
  opponentHandHeight: string;
}

export const useResponsiveGameScaling = (): GameScaling => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scaling = useMemo((): GameScaling => {
    const { width, height } = dimensions;
    
    // Determine breakpoint
    let breakpoint: GameScaling['breakpoint'] = 'xl';
    if (width < 640) breakpoint = 'xs';
    else if (width < 768) breakpoint = 'sm';
    else if (width < 1024) breakpoint = 'md';
    else if (width < 1280) breakpoint = 'lg';
    else if (width < 1536) breakpoint = 'xl';
    else breakpoint = '2xl';

    // Calculate scale factor based on viewport height
    // Baseline: 1080px height = 1.0 scale
    const heightScale = Math.min(1, Math.max(0.6, height / 1080));
    const widthScale = Math.min(1, Math.max(0.7, width / 1920));
    const scaleFactor = Math.min(heightScale, widthScale);

    // Base card dimensions (mobile-first)
    let baseCardWidth = 112; // 28 * 4 (w-28)
    let baseCardHeight = 160; // 40 * 4 (h-40)
    
    // Large screen card dimensions
    let lgCardWidth = 128; // 32 * 4 (w-32)
    let lgCardHeight = 192; // 48 * 4 (h-48)

    // Expanded card dimensions
    let expandedWidth = 256; // w-64
    let expandedHeight = 384; // h-96

    // Adjust based on screen height constraints
    if (height < 720) {
      // Very small screens (mobile landscape, small monitors)
      baseCardWidth = Math.floor(baseCardWidth * 0.7);
      baseCardHeight = Math.floor(baseCardHeight * 0.7);
      lgCardWidth = Math.floor(lgCardWidth * 0.7);
      lgCardHeight = Math.floor(lgCardHeight * 0.7);
      expandedWidth = Math.floor(expandedWidth * 0.8);
      expandedHeight = Math.floor(expandedHeight * 0.8);
    } else if (height < 900) {
      // Medium screens (tablets, laptops)
      baseCardWidth = Math.floor(baseCardWidth * 0.85);
      baseCardHeight = Math.floor(baseCardHeight * 0.85);
      lgCardWidth = Math.floor(lgCardWidth * 0.85);
      lgCardHeight = Math.floor(lgCardHeight * 0.85);
      expandedWidth = Math.floor(expandedWidth * 0.9);
      expandedHeight = Math.floor(expandedHeight * 0.9);
    } else if (height < 1080) {
      // Standard HD screens
      baseCardWidth = Math.floor(baseCardWidth * 0.95);
      baseCardHeight = Math.floor(baseCardHeight * 0.95);
      lgCardWidth = Math.floor(lgCardWidth * 0.95);
      lgCardHeight = Math.floor(lgCardHeight * 0.95);
    }
    // Heights >= 1080 use full size

    // Spacing adjustments
    let cardGap = 12; // gap-3
    let containerPadding = 16; // p-4
    
    if (height < 720) {
      cardGap = 8;
      containerPadding = 8;
    } else if (height < 900) {
      cardGap = 10;
      containerPadding = 12;
    }

    // Container heights based on viewport
    const playerHandHeight = height < 720 ? '140px' : 
                            height < 900 ? '180px' :
                            height < 1080 ? '200px' : '220px';
    
    const opponentHandHeight = height < 720 ? '80px' : 
                              height < 900 ? '100px' :
                              height < 1080 ? '110px' : '120px';

    return {
      cardWidth: baseCardWidth,
      cardHeight: baseCardHeight,
      cardWidthLg: lgCardWidth,
      cardHeightLg: lgCardHeight,
      expandedCardWidth: expandedWidth,
      expandedCardHeight: expandedHeight,
      cardGap,
      containerPadding,
      scaleFactor,
      breakpoint,
      playerHandHeight,
      opponentHandHeight
    };
  }, [dimensions]);

  return scaling;
};

