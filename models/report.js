const mongoose = require('mongoose');
const BaseService = require('./baseService');

const reportSchema = new mongoose.Schema({
    reporter: { type: 'ObjectId', ref: 'User', required: true },
    culprit: { type: 'ObjectId', ref: 'User', required: true },
    reason: { type: String, required: true },
    simplifiedReason: { type: String },
    display: { type: Boolean, default: true },
    valid: { type: Number, enum: [1, 2, 3] },
    feedback: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Report = mongoose.model('Report', reportSchema);

class ReportService extends BaseService
{
    constructor() {
        super(Report);
    }

    /**
     * 
     * @param {object} reporter UserId who creates
     * @param {object} culpritId UserId who is being reported
     * @param {string} reason 
     */
    async create(reporter, culpritId, reason) {
        try {
            return await Report.create({reporter: reporter, culprit: culpritId, reason: reason});
        } catch(error) {
            return { error: error._message }
        }
    }
}

const service = new ReportService();

module.exports = { service, Report };