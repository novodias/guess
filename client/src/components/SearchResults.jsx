import React, { useEffect, useState, useMemo } from 'react';
import Dropdown from './Dropdown';
import './SearchResults.css';

export default function SearchResults({ query, focus, onDropdownClick }) {
    const [list, setList] = useState([]);
    
    // const filtered = list.filter(title => {
    //     try {
    //         return title.name.toLowerCase()
    //             .startsWith(query.toLowerCase());
    //     } catch (error) {
            
    //     }

    //     return false;
    // });

    const filtered = useMemo(() => {
        return list.filter(title => {
            return title.name.toLowerCase().startsWith(query.toLowerCase());
        });
    }, [query, list]);

    useEffect(() => {
        async function searchQueryAsync() {
            console.log("Loaded, fetching titles");

            try {
                const response = await fetch(`/api/titles?name=${query || ''}`);
                const data = await response.json();
                setList(data);
            } catch (error) {
                console.error(error);
            }
        }

        if (filtered.length === 0) {
            searchQueryAsync();
        }
    }, [query, filtered]);

    return (
        <Dropdown className={focus}>
            {filtered.map((title, key) => {
                return (
                    <li onClick={() => onDropdownClick(title)} key={key} id={title.id}>
                        {title.name}
                    </li>
                );
            })}
        </Dropdown>
    );
}

// function Loading() {
//     const circle1 = { animation: "circle-loop 0.3s ease-in-out alternate" };
//     const circle2 = { animation: "circle-loop 0.3s ease-in-out alternate", animationDelay: "250ms" };
//     const circle3 = { animation: "circle-loop 0.3s ease-in-out alternate", animationDelay: "500ms" };
//     return (
//         <div className='row' style={{ justifyContent: 'center', alignItems: 'center' }}>
//             <CircleIcon style={circle1} htmlColor='white' />
//             <CircleIcon style={circle2} htmlColor='white' />
//             <CircleIcon style={circle3} htmlColor='white' />
//         </div>
//     )
// }