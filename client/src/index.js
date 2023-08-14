import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom"
import HomePage from './routes/Home';
import ErrorPage from './Error';
import RoomPage from './routes/Room';
import AddPage from './routes/Add';
import PasswordPage from './routes/Password';
import Layout from './Layout';
import ProtectedRoom from './components/room/ProtectedRoom';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "room/:id",
        element: (
          <ProtectedRoom>
            <RoomPage />
          </ProtectedRoom>),
        errorElement: <ErrorPage />,
        // loader: RoomLoader,
      },
      {
        path: "enter/:id",
        element: <PasswordPage />,
      },
      {
        path: "add",
        element: <AddPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />
      }
    ]
  },
]);

function App() {
  sessionStorage.setItem("nickname", "Guest");
  return (<RouterProvider router={router} />);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
