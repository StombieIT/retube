import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from './components/app';
import { store } from './store';
import { VideoManagerProvider } from './managers/video-manager/react';

const root = createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <Provider store={store}>
        <VideoManagerProvider>
            <App />
        </VideoManagerProvider>
    </Provider>
);
