import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom"
import HomePage from './routes/Home';
import ErrorPage from './Error';
import Navbar from './templates/Navbar';
import RoomPage, { RoomLoader } from './routes/Room';
import CreatePage from './routes/Create';
import PasswordPage from './routes/Password';

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
        path: "room",
        element: <Navigate to="/" />,
        children: [
          {
            path: ":id",
            element: <RoomPage />, errorElement: <ErrorPage />,
            loader: RoomLoader,
          }
        ]
      },
      {
        path: "enter/:id",
        element: <PasswordPage />,
      },
      {
        path: "create",
        element: <CreatePage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />
      }
    ]
  },
]);

function Layout() {
  const [options, setOptions] = useState(false);

  const toggleState = () => {
    setOptions(!options);
  }

  const onClick = (event) => {
    toggleState();
  }
  
  return (
    <>
      <header>
        <Navbar showOptions={options} onClick={onClick} />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}

function App() {
  return (<RouterProvider router={router} />);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
