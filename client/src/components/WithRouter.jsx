import React from 'react';
import { useLoaderData, useLocation, useNavigate, useParams } from 'react-router-dom';

export default function withRouter(Component) {
    function RoomWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        let loader = useLoaderData();

        return (
          <Component
            {...props}
            router={{ location, navigate, params, loader }}
          />
        );
    }

    return RoomWithRouterProp;
}