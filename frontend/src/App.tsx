import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { LogoHeader } from './components/LogoHeader';

import {
    JoinPage,
    CreateSessionPage,
    EstimationPage,
} from './pages';

import { store } from './store';

import './App.scss';

export const App = () => {

    return (
        <Provider store={store}>
            <LogoHeader />

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<CreateSessionPage />} />
                    <Route path="/join/:sessionId" element={<JoinPage />} />
                    <Route path="/session/:sessionId" element={<EstimationPage />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}
