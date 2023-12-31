import React, { useEffect, useState, useMemo } from 'react';
import Dropdown from './Dropdown';
import './SearchResults.css';
import { getTitlesAsync } from '../api/export';
import logger from '../utils';
import useLogger from '../hooks/useLogger';

/**
 * @param {String} v1 
 * @param {String} v2 
 */
function compareString(v1, v2) {
    return v1.toLowerCase().startsWith(v2.toLowerCase());
}

/**
 * @param {String} v1 
 * @param {String} v2 
 */
function includesString(v1, v2) {
    return v1.toLowerCase().includes(v2.toLowerCase());
}

function compareTags(array, value) {
    if (array  && array instanceof Array) {
        return array.some(v => compareString(v, value));
    }

    return false;
}

function includesTags(array, value) {
    if (array && array instanceof Array) {
        return array.some(v => includesString(v, value));
    }

    return false;
}

/**
 * @param {string} query 
 * @param {Object} title 
 * @param {string} title.name 
 * @param {string[]} title.tags 
 */
function ensureStartsWith(query, {name, tags}) {
    return compareString(name, query) || compareTags(tags, query);
}

/**
 * @param {string} query 
 * @param {Object} title 
 * @param {string} title.name 
 * @param {string[]} title.tags 
 */
function ensureIncludes(query, {name, tags}) {
    return includesString(name, query) || includesTags(tags, query);
}

function filterResults(query, titles) {
    const starts = [];
    const includes = [];

    for (let i = 0; i < titles.length; i++) {
        let title = titles[i];
        
        if (ensureStartsWith(query, title)) {
            starts.push(title);
        } else if (ensureIncludes(query, title)) {
            includes.push(title);
        }
    }

    return starts.concat(includes);
}

export default function SearchResults({ query, focus, onDropdownClick }) {
    const { info, debug } = useLogger("Search");
    const [list, setList] = useState([]);
    const [validQuery, setValidQuery] = useState('');
    const [empty, setEmpty] = useState(null);

    const filtered = useMemo(() => {
        return filterResults(query, list);
    }, [query, list]);

    useEffect(() => {
        async function searchTitles() {
            try {
                debug(`Fetching titles with name: ${query}`);
                const titles = await getTitlesAsync({ name: query });
                if (titles && titles.length !== 0) {
                    setValidQuery(query);
                    setList(titles);
                    setEmpty(false);
                } else {
                    setEmpty(true);
                }
            } catch (e) {
                if (e instanceof Error) debug(e.message);
            }
        }

        if (empty === null) {
            info("Fresh titles load");
            searchTitles();
        } else if (empty === true) {
            if (query.startsWith(validQuery) || query === '') {
                searchTitles();
            } else {
                debug("Query doesn't match valid query - doing nothing");
            }
        }
        
    }, [query]);

    // useEffect(() => {
    //     async function searchQueryAsync() {
    //         // console.log("Fetching titles with name:", query);
    //         logger.debug("Fetching titles with name:", query);    
    //         try {
    //             const data = await getTitlesAsync({ name: query });
    //             if (data) {
    //                 setList(data);
    //             }
    //             if (data.length === 0) {
    //                 setIsFetchEmpty(true);
    //             } else {
    //                 setIsFetchEmpty(false);
    //             }
    //         } catch (error) {
    //             setIsFetchEmpty(true);
    //         }     
    //     }
    //     function queryEqualsLast() {
    //         if (query === null || query === undefined) {
    //             return false;
    //         }
    //         return query.toLowerCase() === lastSuccessfulQuery.toLowerCase();
    //     }
    //     if (isFetchEmpty === null) {
    //         // console.log("Fresh load, get 100 titles.");
    //         logger.debug("Fresh load");
    //         searchQueryAsync();
    //     } else if (isFetchEmpty === true) {
    //         if (query === '') {
    //             // console.log("Query empty, fetch more");
    //             logger.debug("Query empty, fetch more");
    //             searchQueryAsync();
    //         } else if (queryEqualsLast()) {  
    //             if (list.length === 0) {
    //                 // console.log("Fetch last succesful query:", lastSuccessfulQuery);                
    //                 logger.debug("Fetch last succesful query:", lastSuccessfulQuery);
    //                 searchQueryAsync();
    //             }
    //         }
    //     } else {
    //         if (filtered.length === 0) {
    //             // console.log("Filtered empty, fetch more titles");
    //             logger.debug("Filtered empty, fetch more titles");
    //             searchQueryAsync();
    //         } else {
    //             if (!queryEqualsLast()) {
    //                 // console.log("Set last successful query:", query);
    //                 logger.debug("Set last successful query:", query)
    //                 setLastSuccessfulQuery(query);
    //             }
    //         }
    //     }
    // }, [query, filtered, isFetchEmpty, list.length, lastSuccessfulQuery]);

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