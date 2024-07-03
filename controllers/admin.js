const Product = require("../models/product");
const { validationResult } = require("express-validator");
const { deleteFile } = require("../util/flie");

exports.getAddProduct = async (req, res, next) => {
  try {
    res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: false,
      errorMsg: null,
      validationErrors: [],
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    const errors = validationResult(req);

    if (!image) {
      return res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: true,
        product: {
          title: title,
          price: price,
          description: description,
        },
        errorMsg: "Attached file is not an image.",
        validationErrors: [],
      });
    }

    if (!errors.isEmpty()) {
      console.log(errors.array()[0]);
      return res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: true,
        product: {
          title: title,
          price: price,
          description: description,
        },
        errorMsg: "Attached file is not an image.",
        validationErrors: [],
      });
    }

    if (!req.user) {
      return res.redirect("/login");
    }

    const imageUrl = image.path;

    const product = new Product({
      title,
      price,
      description,
      imageUrl: imageUrl,
      userId: req.user._id,
    });

    await product.save();
    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error creating product", err);
    next(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect("/");
    }

    const prodId = req.params.productId;
    const product = await Product.findById(prodId);

    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      hasError: false,
      errorMsg: null,
      validationErrors: [],
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const { productId, title, price, description } = req.body;
    const image = req.file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasError: true,
        product: {
          title: title,
          price: price,
          description: description,
          _id: productId,
        },
        errorMsg: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    const product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    product.title = title;
    product.price = price;
    product.description = description;
    if (image) {
      deleteFile(product.imageUrl)
      product.imageUrl = image.path;
    }

    await product.save();
    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    console.log(products);
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await Product.findByIdAndRemove({ _id: prodId, userId: req.user._id });
    deleteFile(product.imageUrl);
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    next(err);
  }
};
