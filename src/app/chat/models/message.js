const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
        default: null
    }
}, { timestamps: true });

messageSchema.index({ sender: 1 }); // sender alanında indeks
messageSchema.index({ receiver: 1 }); // receiver alanında indeks
messageSchema.index({ group: 1 }); // group alanında indeks
messageSchema.index({ createdAt: 1 }); // createdAt alanında indeks

const Message = mongoose.model('messages', messageSchema);

module.exports = Message;
