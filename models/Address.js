import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: false
    },
    country: {
        type: String,
        default: 'India'
    }
}, {
    timestamps: true
});

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address; 