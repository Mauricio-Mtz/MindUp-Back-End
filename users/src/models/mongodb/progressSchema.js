const mongoose = require('mongoose');
const mongoDb = require('../../../config/mongoDb');


const ProgressSchema = new mongoose.Schema({
    student_course_id: {
        type: Number,
        required: true,
        unique: true
    },
    module_progress: [{
        module_id: Number,
        correct_answers: Number,
        total_questions: Number,
        progress_percentage: Number
    }]
});

const StudentProgress = mongoDb.model('student_progress', ProgressSchema);
module.exports = StudentProgress;