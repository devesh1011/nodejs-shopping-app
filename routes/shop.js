const express = require("express");
const shopController = require("../controllers/shop");
const isAuthenticated = require("../middlewares/isAuth");
const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", isAuthenticated, shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuthenticated, shopController.getCart);

router.post("/cart", isAuthenticated, shopController.postCart);

router.post(
  "/cart-delete-item",
  isAuthenticated,
  shopController.postCartDeleteProduct
);

router.post("/create-order", isAuthenticated, shopController.postOrder);

router.get("/orders", isAuthenticated, shopController.getOrders);

router.get("/orders/:orderId", isAuthenticated, shopController.getInvoice);

router.get("/checkout", isAuthenticated, shopController.getCheckout);

module.exports = router;
