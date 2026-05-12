/**
 * viewers/index.ts — barrel export for all flipbook rendering engines.
 *
 * Import pattern in FlipbookViewer.tsx:
 *   import { BookViewer, MagazineViewer, ... } from './viewers';
 */
export { MagazineViewer }   from './MagazineViewer';
export { BookViewer }       from './BookViewer';
export { AlbumViewer }      from './AlbumViewer';
export { NotebookViewer }   from './NotebookViewer';
export { OnePageViewer }    from './OnePageViewer';
export { SliderViewer }     from './SliderViewer';
export { CardsViewer }      from './CardsViewer';
export { CoverflowViewer }  from './CoverflowViewer';
export type { ViewerRef, BaseViewerProps } from './types';
