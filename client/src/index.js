import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  // Route,
  // Routes,
  // Navigate,
  // BrowserRouter,
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom"
import HomePage from './routes/Home';
import ErrorPage from './Error';
import Navbar from './templates/Navbar';
import RoomPage from './routes/Room';

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
        element: <RoomPage />,
        errorElement: <ErrorPage />,
        loader: async ({ params }) => {
          const res = await fetch(`http://localhost:3001/api/room/get/${params.id}`);
          if (!res.ok) {
            throw new Error("Could not fetch to the server");
          }
          
          if (res.status === 404) {
            throw new Response("Not Found", { status: 404 });
          }
          
          const data = await res.json();
          return data;
        }
      }
      // { path: "*", errorElement: <ErrorPage /> }
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

// render() {
//   return (
//     <BrowserRouter>
//       <Navbar showOptions={this.state.options} onClick={this.onClick} />
//       <main>
//         <Routes>
//           <Route exact path='/' element={<HomePage />} />
          
//           <Route path='/' errorElement={<ErrorPage />}>
//             <Route path='room/:id'
//               loader={async ({ params }) => {
//                 const res = await fetch(`http://localhost:3001/api/room/get/${params.id}`);
//                 if (res.status === 404) {
//                   throw new Response("Not Found", { status: 404 });
//                 }

//                 if (!res.ok) {
//                   throw new Error("Could not fetch to the server");
//                 }
                
//                 const data = await res.json();
//                 return data;
//               }}
//               element={<RoomPage />}
//               errorElement={<ErrorPage />} />
//           </Route>
      
//           <Route path='*' element={<Navigate to="/" />} />     
//         </Routes>
//       </main>
//     </BrowserRouter>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
