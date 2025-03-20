const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage});
const razorpay=require("../razorpay.js")

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn, 
    upload.single('listing[imageUrl]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );
 
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);



// Payment Route
router.post("/:id/pay", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
  }

  const options = {
      amount: listing.price*100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${id}`,
      payment_capture: 1, // Auto capture payment
  };

  try {
      const order = await razorpay.orders.create(options);
      res.json(order);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Razorpay order creation failed" });
  }
}));


module.exports = router;