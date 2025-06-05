import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element. The React app cannot be mounted.');
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.style.textAlign = 'center';
  errorDiv.style.fontSize = '18px';
  errorDiv.innerHTML = 'Error: Root element (#root) not found. React app cannot start. Check index.html.';
  document.body.appendChild(errorDiv);
}
