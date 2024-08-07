const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'messages'
    }]
}, { timestamps: true });

groupSchema.index({ name: 1 }); // name alanında indeks
groupSchema.index({ members: 1 }); // members alanında indeks

const Group = mongoose.model('groups', groupSchema);

module.exports = Group;
