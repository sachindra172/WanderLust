const Listing = require("../models/listing.js");


module.exports.index = async (req, res) => {
  let query = {}; // Initialize an empty query object

  // Filter by Category (if provided)
  if (req.query.category) {
      query.category = req.query.category; // Exact match for category
  }

  // Filter by City (if provided)
  if (req.query.city) {
      const cityRegex = new RegExp(req.query.city, "i"); // Case-insensitive search
      query.location = cityRegex; // Match listings with `location` field
  }

  // Fetch listings based on filters
  const allListings = await Listing.find(query);
  
  res.render("listings/index.ejs", { allListings, categoryQuery: req.query.category, cityQuery: req.query.city });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "This listing does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing,currentUser:req.user });
};
module.exports.createListing=async (req, res, next) => {
    let url=req.file.path;
    let filename=req.file.filename;
  
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.imageUrl={url,filename};
    await newListing.save();
      req.flash("success","New listing created!");
      res.redirect("/listings");
  
  
   };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "This listing does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.imageUrl.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.imageUrl = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

