const advancedResult = (model, populate) => async (req,res,next) => {
    let query;

    // Copy req.query
    const reqQuery = {...req.query}

    // Fields to exclude
    const removeField = ['select','sort','limit','page'];

    // Loop over removeField and remove the word from reqQuery
    removeField.forEach(rm => delete reqQuery[rm])

    // Create query string
    let queryStr = JSON.stringify(reqQuery)
    queryStr = queryStr.replace(/(gt|gte|lt|lte|in)/g,match => `$${match}`)

    // Finding resource
    
    query = model.find(JSON.parse(queryStr));


    // SELECT QUERY
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // SORT QUERY
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt')
    }

    // LIMIT QUERY
    const limit = parseInt(req.query.limit,10) || 25
    const page = parseInt(req.query.page,10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate)
    }
    
    // Executing Query
    const result = await query;

    const pagination = {}

    if(endIndex < total){
        pagination:{
            pagination.next = {
                page: page + 1,
                limit
            }
        }
    }

    if(startIndex > 0){
        pagination:{
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
    }

    res.advancedResult = {
        sucess:true,
        count:result.length,
        pagination,
        data:result
    }

    next()
    
}

module.exports = advancedResult