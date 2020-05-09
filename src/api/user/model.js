import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    role: { type: String, enum: ['admin', 'editor'] },
    fullName: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: Number },
    address: { type: String }
}, {
    timestamps: true,
});

const model = mongoose.model('User', userSchema);

export default model;