import React, { useEffect, useState, useMemo } from 'react';
import Dropdown from './Dropdown';
import { getTitlesAsync } from '../api/export';
import useLogger from '../hooks/useLogger';
import './SearchResults.css';
import { noop } from '../utils';

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

export default function SearchResults({ query, focus, onDropdownClick, selected, setLength, isSelected, onSelected }) {
    const { info, debug } = useLogger("Search");
    const [list, setList] = useState([]);
    const [validQuery, setValidQuery] = useState('');
    const [initial, setInitial] = useState(false);
    
    
    const filtered = useMemo(() => {
        return filterResults(query, list);
    }, [query, list]);
    
    const isEmpty = list.length === 0;
    
    useEffect(() => {
        async function searchTitles(titleQuery) {
            try {
                debug(`Fetching titles with name: ${titleQuery}`);
                const titles = await getTitlesAsync({ name: titleQuery || '' });
                if (typeof titles !== 'undefined' && titles.length !== 0) {
                    setLength(titles.length);
                    if (typeof titleQuery === 'undefined') {
                        setValidQuery(query);
                    }
                    setList(titles);
                }
            } catch (e) {
                if (e instanceof Error) debug(e.message);
            }
        }
        
        if (!initial) {
            info("Fresh titles load");
            searchTitles();
            setInitial(true);
        } else {
            const queryIsValid = query.startsWith(validQuery);
            const queryIsEmpty = query === '' || typeof query === 'undefined';
            const filteredIsEmpty = filtered.length === 0;

            if (isEmpty) {
                searchTitles();
                debug("Titles list empty");
                return;
            } else {
                if (filteredIsEmpty) {
                    searchTitles(query);
                    debug("Filtered titles list empty, searching more");
                    return;
                }

                if (queryIsValid) {
                    searchTitles(query);
                    debug("Input query is valid, searching: " + query);
                    return;
                }

                if (queryIsEmpty) {
                    searchTitles();
                    debug("Input empty, searching more titles");
                    return;
                }
            }

        }
    }, [query]);

    useEffect(() => {
        if (isSelected) {
            const title = filtered.filter((_, idx) => idx === selected)[0];
            (onSelected || noop)(title);
        }
    }, [isSelected]);

    return (
        <Dropdown className={focus ? 'title-input-focused' : ''}>
            {filtered.map((title, idx) => {
                return (
                    <li className={`${idx === selected ? 'selected' : ''}`}
                        onClick={() => onDropdownClick(title)}
                        key={idx}
                        id={title.id}>
                        {title.name}
                    </li>
                );
            })}
        </Dropdown>
    );
}