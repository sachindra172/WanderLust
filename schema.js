const Joi = require('joi');
const review = require('./models/review');


module.exports.listingSchema = Joi.object({
    listing:Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        imageUrl: Joi.string().allow("",null),
        category: Joi.string()
    .valid("trending", "iconiccities", "mountains", "beach", "castle",
          "lakefront", "luxe", "dome", "cabins", "camping", "farms")
    }).required()

});
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),

    }).required(),
});