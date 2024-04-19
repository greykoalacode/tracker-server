const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    task: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);