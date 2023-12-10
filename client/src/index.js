import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom"
import Home from './routes/Home';
import ErrorPage from './Error';
import RoomPage from './routes/Room';
import AddPage from './routes/Add';
import Layout from './Layout';
import ProtectedRoom from './components/room/ProtectedRoom';
import AudioPlayerTestPage from './routes/Test';
import { GameProvider } from './context/GameProvider';
import './styles/global.css';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <ErrorPage />,
      },
      {
        path: "room/:id",
        element: (
          <ProtectedRoom>
            <GameProvider>
              <RoomPage />
            </GameProvider>
          </ProtectedRoom>),
        errorElement: <ErrorPage />,
        // loader: RoomLoader,
      },
      {
        path: "add",
        element: <AddPage />,
      },
      {
        path: "test",
        element: <AudioPlayerTestPage />
      },
      {
        path: "*",
        element: <Navigate to="/" />
      }
    ]
  },
]);

function App() {
  return (<RouterProvider router={router} />);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);