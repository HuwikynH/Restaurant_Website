import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import UserLayout from "./layouts/UserLayout/UserLayout";
import Home from "./pages/UserPages/Home/Home";
import Recipes from "./pages/UserPages/Recipes/Recipes";
import Contact from "./pages/UserPages/Contact/Contact";
import AboutUs from "./pages/UserPages/AboutUs/AboutUs";
import Blog from "./pages/UserPages/Blog/Blog";
import UserProfile from "./pages/UserMenu/UserProfile/UserProfile";
import MyRecipes from "./pages/UserMenu/MyRecipes/MyRecipes";
import AddRecipe from "./pages/UserMenu/AddRecipe/AddRecipe";
import FavoriteRecipes from "./pages/UserMenu/FavoriteRecipes/FavoriteRecipes";
import MyBookings from "./pages/UserMenu/MyBookings/MyBookings";

import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import AdminDashboard from "./pages/AdminPages/AdminDashboard/AdminDashboard";
import AdminRecipes from "./pages/AdminPages/AdminRecipes/AdminRecipes";
import AdminCategories from "./pages/AdminPages/AdminCategories/AdminCategories";
import AdminCollections from "./pages/AdminPages/AdminCollections/AdminCollections";
import AdminUsers from "./pages/AdminPages/AdminUsers/AdminUsers";
import AdminBookings from "./pages/AdminPages/AdminBookings/AdminBookings";
import AdminTables from "./pages/AdminPages/AdminTables/AdminTables";

import LoginPopup from "./components/LoginPopup/LoginPopup";
import RecipeDetail from "./pages/UserPages/RecipeDetail/RecipeDetail";
import RecipeSearchResult from "./pages/UserPages/RecipeSearchResult/RecipeSearchResult";
import EmailVerificationStatus from "./pages/UserPages/EmailVerificationStatus/EmailVerificationStatus";
import BlogDetail from "./pages/UserPages/Blog/BlogDetail";
import LoginPage from "./pages/LoginPage";
import AdminBlogs from "./pages/AdminPages/AdminBlogs/AdminBlogs";
import Booking from "./pages/UserPages/Booking/Booking";
import BookingMenu from "./pages/UserPages/Booking/BookingMenu";
import BookingReview from "./pages/UserPages/Booking/BookingReview";

function App() {
    const [showLogin, setShowLogin] = useState(false);
    // const user = JSON.parse(localStorage.getItem("user"));
    // console.log("app render");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const userId = urlParams.get("userId");
        const provider = urlParams.get("provider");

        if (token && userId) {
            // Lưu token vào localStorage
            localStorage.setItem("token", token);

            // Gọi API để lấy thông tin đầy đủ của user
            const fetchUserData = async () => {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Không thể lấy thông tin người dùng");
                    }

                    const userData = await response.json();
                    localStorage.setItem("user", JSON.stringify(userData));

                    // Xóa query parameters khỏi URL
                    window.history.replaceState({}, document.title, "/");

                    // Reload trang để cập nhật trạng thái đăng nhập
                    window.location.reload();
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                }
            };

            fetchUserData();
        }
    }, []); // Chạy 1 lần khi component mount

    const user = JSON.parse(localStorage.getItem("user")); // Đọc lại user sau khi có thể đã lưu từ social login

    return (
        <>
            {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}

            <div className="App">
                <Routes>
                    <Route element={<UserLayout setShowLogin={setShowLogin} />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/recipes" element={<Recipes />} />
                        <Route path="/recipes/:id" element={<RecipeDetail />} />
                        <Route path="/search" element={<RecipeSearchResult />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blogs/:id" element={<BlogDetail />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/aboutUs" element={<AboutUs />} />
                        <Route path="/verify-email-status" element={<EmailVerificationStatus />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/booking/:bookingId/menu" element={<BookingMenu />} />
                        <Route path="/booking/:bookingId/review" element={<BookingReview />} />
                    </Route>

                    {/* Trang user đã đăng nhập */}
                    <Route
                        element={
                            user ? <UserLayout setShowLogin={setShowLogin} /> : <Navigate to="/" />
                        }
                    >
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/my-bookings" element={<MyBookings />} />
                        <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
                    </Route>

                    <Route
                        element={
                            user && user.role === "admin" ? <AdminLayout /> : <Navigate to="/" />
                        }
                    >
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/adminRecipes" element={<AdminRecipes />} />
                        <Route path="/adminCategories" element={<AdminCategories />} />
                        <Route path="/adminCollections" element={<AdminCollections />} />
                        <Route path="/adminUsers" element={<AdminUsers />} />
                        <Route path="/adminBookings" element={<AdminBookings />} />
                        <Route path="/adminTables" element={<AdminTables />} />
                        <Route path="/adminBlogs" element={<AdminBlogs />} />
                        {/* Admin dùng các trang công thức cũ để thêm/sửa món */}
                        <Route path="/my-recipes" element={<MyRecipes />} />
                        <Route path="/add-recipe" element={<AddRecipe />} />
                        <Route path="/edit-recipe/:id" element={<AddRecipe />} />
                    </Route>
                </Routes>
            </div>
            <ToastContainer />
        </>
    );
}

export default App;
