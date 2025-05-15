import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    image: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one image is required'
        }
    },
    date: {
        type: Number,
        default: Date.now
    }
});

// Add indexes for better query performance
productSchema.index({ date: -1 });
productSchema.index({ userId: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
    
    
