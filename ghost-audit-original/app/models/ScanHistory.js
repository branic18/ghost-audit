const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
  },
  searchId: {
    type: String,
    required: true,
  },
  results: [{
    sourceName: String,
    sourceDate: String
  }],
  actions: [
    {
      sourceName: String,
      sourceDate: String,
      description: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  owner: {  // Linkig to user model so it saves to the user's id and the scans can be seen right when they log in
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true 
  }
});

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);

module.exports = ScanHistory;
