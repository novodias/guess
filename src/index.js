import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider, } from "react-router-dom"
import HomePage from './routes/Home';
import ErrorPage from './Error';
import Navbar from './templates/Navbar';
import RoomPage from './routes/Room';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/room",
    element: <RoomPage />,
    errorElement: <ErrorPage />,
  }
])

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      options: false,
    }
  }

  onClick = (event) => {
    this.toggleState();
  }
  
  toggleState = () => {
    this.setState({ options: !this.state.options });
  }

  render() {
    return (
      <React.StrictMode>
        <Navbar showOptions={this.state.options} onClick={this.onClick} />
        <main>
          <RouterProvider router={router} />
        </main>
      </React.StrictMode>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
