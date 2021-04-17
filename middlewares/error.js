const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err,req,res,next) => {

    let error = {...err }
    error.message = err.message;
    error.statusCode = err.statusCode;

    console.log(err)

    // Validation Error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map( val => val.message )
        const statusCode = 400;
        error = new ErrorResponse(message,statusCode);
    }


    // Duplicate Key Error
    if(err.code === 11000){
        const message = 'Field Value already exists';
        const statusCode = 400;
        error = new ErrorResponse(message,statusCode)
    }

    // Mongoose Bad ObjectId
    if(err.name === 'CastError'){
        const message = `Resource not found with id of ${err.value}`;
        const statusCode = 404;
        error = new ErrorResponse(message, statusCode)
    }

    res.status(error.statusCode || 500).json({
        success:false,
        error:error.message || 'Server Error'
    });
}

module.exports = errorHandler