import React from "react";
import "./PagePagination.css";
import { returnPaginationRange } from "../../utils/RecipeUtils";

function PagePagination({
    totalPage,
    currPage,
    limit,
    siblings,
    onPageChange,
}) {
    let array = returnPaginationRange(
        totalPage,
        currPage,
        limit,
        siblings
    );
    return (
        <div className="page-pagination-wrapper">
            <ul className="pagination pagination-md">
                <li className="page-item">
                    <span
                        onClick={() => onPageChange("<<")}
                        className="page-link"
                    >
                        <i className="bx bx-chevrons-left"></i>
                    </span>
                </li>
                <li className="page-item">
                    <span
                        onClick={() => onPageChange("<")}
                        className="page-link"
                    >
                        <i className="bx bx-chevron-left"></i>
                    </span>
                </li>
                {array.map((value) => (
                    <li
                        key={value}
                        className={
                            value === currPage
                                ? "page-item active"
                                : "page-item"
                        }
                    >
                        <span
                            onClick={() => onPageChange(value)}
                            className="page-link"
                        >
                            {value}
                        </span>
                    </li>
                ))}

                <li className="page-item">
                    <span
                        onClick={() => onPageChange(">")}
                        className="page-link"
                    >
                        <i className="bx bx-chevron-right"></i>
                    </span>
                </li>
                <li className="page-item">
                    <span
                        onClick={() => onPageChange(">>")}
                        className="page-link"
                    >
                        <i className="bx bx-chevrons-right"></i>
                    </span>
                </li>
            </ul>
        </div>
    );
}

export default PagePagination;
