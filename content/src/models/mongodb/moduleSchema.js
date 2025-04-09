// models/mongodb/moduleSchema.js
const mongoose = require('mongoose');
const mongoDb = require('../../../config/mongoDb');

const ModuleSchema = new mongoose.Schema({
    module_id: {
        type: Number,
        required: true,
        unique: true
    },
    course_id: {
        type: Number,
        required: true
    },
    content: [{
        text: String,
        subTitle: String,
        videoUrl: String
    }],
    quiz: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number
        }],
        passing_score: Number
    }
});

const ModuleContent = mongoDb.model('module_contents', ModuleSchema);
module.exports = ModuleContent;