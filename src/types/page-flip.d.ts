declare module 'page-flip' {
  export interface FlipSetting {
    width: number;
    height: number;
    size?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    maxShadowOpacity?: number;
    mobileScrollSupport?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    usePortrait?: boolean;
    autoSize?: boolean;
    drawShadow?: boolean;
    flippingTime?: number;
    startZIndex?: number;
    startPage?: number;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: FlipSetting);
    loadFromHTML(elements: HTMLElement[]): void;
    loadFromImages(images: string[]): void;
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    flip(pageNum: number, corner?: string): void;
    turnToPage(pageNum: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): string;
    destroy(): void;
    on(eventName: string, callback: (e: { data: unknown }) => void): PageFlip;
    off(eventName: string): void;
  }
}
