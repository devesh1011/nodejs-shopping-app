const Product = require("../models/product");
const Order = require("../models/order");
const path = require("path");

const { generateInvoice } = require("../util/pdf_gen");

const ITEMS_PER_PAGE = 4;

exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const totalItems = await Product.countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const totalItems = await Product.countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId);
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.redirect("/");
    next(err);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    await req.user.removeFromCart(req.body.productId);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((item) => ({
      quantity: item.quantity,
      product: { ...item.productId._doc },
    }));
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      products: products,
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new Error("No order found"));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    generateInvoice(order, orderId, res);
  } catch (error) {
    next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const cart = user.cart;

    let total = 0;
    cart.items.forEach((item) => {
      total += item.quantity * item.productId.price;
    });

    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      cart: cart,
      totalSum: total,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
