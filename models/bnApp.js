const mongoose = require('mongoose');
const BaseService = require('./baseService');

const bnAppSchema = new mongoose.Schema({
    applicant: {type: 'ObjectId', ref: 'User', required: true},
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania'], required: true },
    mods: [{ type: String, required: true }],
    evaluations: [{type: 'ObjectId', ref: 'Evaluation'}],
    active: { type: Boolean, default: true },
    discussion: { type: Boolean, default: false },
    consensus: { type: String, enum: ["pass", "fail"] },
    feedback: { type: String },
    test: { type: 'ObjectId', ref: 'TestSubmission' },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const BnApp = mongoose.model('BnApp', bnAppSchema);

class BnAppService extends BaseService
{
    constructor() {
        super(BnApp);
    }

    /**
     * 
     * @param {object} userId UserId of applicant
     * @param {string} mode 
     * @param {string[]} mods 
     */
    async create(userId, mode, mods) {
        try {
            return await BnApp.create({ applicant: userId, mode: mode, mods: mods });
        } catch(error) {
            return { error: error._message }
        }
    }
}

const service = new BnAppService();

module.exports = { service };