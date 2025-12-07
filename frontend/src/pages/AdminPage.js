import React from "react";
import { Container, Box, Typography } from "@mui/material";
import UserList from "../components/AdminUserManagement/UserList";

const AdminPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trang quản trị
        </Typography>
        <UserList />
      </Box>
    </Container>
  );
};

export default AdminPage;
