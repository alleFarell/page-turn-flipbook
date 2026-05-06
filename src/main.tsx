import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from 'sonner';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={300}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            borderRadius: 'var(--radius)',
          },
        }}
        richColors
        closeButton
      />
    </TooltipProvider>
  </StrictMode>
);
