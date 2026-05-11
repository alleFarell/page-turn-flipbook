export interface ViewerRef {
  goNext: () => void;
  goPrev: () => void;
  goToPage: (page: number) => void;
}

export interface BaseViewerProps {
  pages: string[];
  designMode: string;
  config: any;
  zoom: number;
  isMobile: boolean;
  soundEnabled: boolean;
  showPageNumbers?: boolean;
  autoPageNumbering?: boolean;
  pageLabels?: string[];
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  onLoad: () => void;
}
