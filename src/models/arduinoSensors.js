const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Sread = new Schema({  
    ac: Boolean,
    light: Boolean,
    door: Boolean
});

module.exports  = mongoose.model('arduinosensors',Sread);
