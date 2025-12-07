import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
    { id: "image", numeric: false, disablePadding: true, label: "Ảnh" },
    { id: "title", numeric: false, disablePadding: false, label: "Công thức" },
    { id: "categoryDisplay", numeric: false, disablePadding: false, label: "Danh mục" },
    { id: "likes", numeric: true, disablePadding: false, label: "Lượt thích" },
    { id: "views", numeric: true, disablePadding: false, label: "Lượt xem" },
    { id: "createdAt", numeric: true, disablePadding: false, label: "Ngày tạo" },
    { id: "updatedAt", numeric: true, disablePadding: false, label: "Cập nhật" },
    { id: "actions", numeric: false, disablePadding: false, label: "Hành động" },
];

function EnhancedTableHead({
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
}) {
    const createSortHandler = (property) => (event) => onRequestSort(event, property);

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? "right" : "left"}
                        padding={headCell.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            position: "relative",
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                top: "20%",
                                bottom: "20%",
                                right: 0,
                                width: "1px",
                                backgroundColor: "#e0e0e0",
                            },
                            "&:last-child::after": { display: "none" },
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function EnhancedTableToolbar({ numSelected }) {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                pt: "10px",
                pb: "10px",
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            <Typography
                sx={{ flex: "1 1 100%" }}
                variant={numSelected > 0 ? "subtitle1" : "h6"}
                component="div"
            >
                {numSelected > 0 ? `Đã chọn ${numSelected} mục` : "Danh sách công thức"}
            </Typography>

            <Tooltip title={numSelected > 0 ? "Delete" : "Filter list"}>
                <IconButton>{numSelected > 0 ? <DeleteIcon /> : <FilterListIcon />}</IconButton>
            </Tooltip>
        </Toolbar>
    );
}

export default function EnhancedTable() {
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("title");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes`);
                const data = await res.json();
                const formatted = data.map((item) => ({
                    id: item._id,
                    imageThumb: item.imageThumb,
                    title: item.title,
                    categoryDisplay: item.categoryDisplay,
                    likes: item.likes,
                    views: item.views,
                    createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
                    updatedAt: new Date(item.updatedAt).toLocaleDateString("vi-VN"),
                }));
                setRows(formatted);
                setPage(0);
            } catch (err) {
                console.error("Lỗi khi tải công thức:", err);
            }
        };
        fetchRecipes();
    }, []);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [...selected];

        if (selectedIndex === -1) newSelected.push(id);
        else newSelected.splice(selectedIndex, 1);

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const visibleRows = React.useMemo(
        () =>
            [...rows]
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage, rows]
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ maxWidth: "90%", mx: "auto", mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} />
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => (
                                <TableRow
                                    hover
                                    onClick={(event) => handleClick(event, row.id)}
                                    role="checkbox"
                                    aria-checked={selected.includes(row.id)}
                                    tabIndex={-1}
                                    key={row.id}
                                    selected={selected.includes(row.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={selected.includes(row.id)}
                                            inputProps={{
                                                "aria-labelledby": `enhanced-table-checkbox-${index}`,
                                            }}
                                        />
                                    </TableCell>
                                    {headCells.map((headCell) => {
                                        if (headCell.id === "image") {
                                            return (
                                                <TableCell
                                                    key={headCell.id}
                                                    align="center"
                                                    padding="none"
                                                >
                                                    <img
                                                        src={row.imageThumb}
                                                        alt={row.title}
                                                        width={60}
                                                        height={40}
                                                        style={{
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </TableCell>
                                            );
                                        }
                                        if (headCell.id === "actions") {
                                            return (
                                                <TableCell key={headCell.id} align="left">
                                                    <div className="action-button-recipe-table">
                                                        <Tooltip title="Xem" placement="top">
                                                            <i className="bx bx-show"></i>
                                                        </Tooltip>
                                                        <Tooltip title="Sửa" placement="top">
                                                            <i className="bx  bx-edit"></i>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa" placement="top">
                                                            <i className="bx  bx-trash"></i>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            );
                                        }
                                        return (
                                            <TableCell
                                                key={headCell.id}
                                                align={headCell.numeric ? "right" : "left"}
                                            >
                                                {row[headCell.id]}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
