const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const { body } = require("express-validator");

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

// /admin/products => GET
router.get("/products", adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title").isLength({ min: 6 }).trim(),
    body("price").isFloat(),
    body("description").trim().isLength({ min: 10 }),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isLength({ min: 6 }).trim(),
    body("price").isFloat(),
    body("description").trim().isLength({ min: 10 }),
  ],
  adminController.postEditProduct
);

router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;
