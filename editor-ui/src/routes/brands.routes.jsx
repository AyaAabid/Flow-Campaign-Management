import React from "react";
import BrandList from "../features/brands/BrandList";
import BrandForm from "../features/brands/BrandForm";
import BrandDetails from "../features/brands/BrandDetails";

export default [
  { path: "/brands", element: <BrandList /> },
  { path: "/brands/:id", element: <BrandDetails /> },
  { path: "/brands/new", element: <BrandForm mode="create" /> },
  { path: "/brands/:id/edit", element: <BrandForm mode="edit" /> },
];
