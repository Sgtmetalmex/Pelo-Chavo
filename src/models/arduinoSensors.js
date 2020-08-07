const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Sread = new Schema({  
    ac: Boolean,
    light: Boolean,
    window: Boolean,
    wifi: Boolean
});

module.exports  = mongoose.model('arduinosensors',Sread);
