import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Get base path from Vite's base config (set via VITE_BASE_PATH)
const basePath = import.meta.env.BASE_URL || '/';

// Handle GitHub Pages SPA redirect
// 404.html redirects to /?p=/original-path, we restore it here
const params = new URLSearchParams(window.location.search);
const redirectPath = params.get('p');
if (redirectPath) {
  // Remove the ?p= param and replace with the actual path
  const cleanPath = basePath.replace(/\/$/, '') + redirectPath;
  window.history.replaceState(null, '', cleanPath);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
