const mongoose = require('mongoose')
const validateMongoId = (id => {
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if (!isValid) {
        throw new Error(`${id} is not a valid id`)
    }
    return true
})

module.exports = validateMongoId