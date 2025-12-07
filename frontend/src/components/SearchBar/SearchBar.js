import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        onSearch(query);
    };

    return (
        <div className="search-bar-wrapper">
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm công thức"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault(); // Ngăn reload trang
                            handleSearch();
                        }
                    }}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                    Tìm kiếm
                </button>
            </div>
        </div>
    );
}

export default SearchBar;
