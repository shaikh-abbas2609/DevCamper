const asyncHandler = require('../middlewares/asyncHandler');
const CourseModel = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const BootcampModel = require('../models/Bootcamps')

// @desc Get courses
// @route - GET /api/v1/courses/
// @route - GET /api/v1/bootcamps/:bootcampId/courses
//@Access - Public
const getCourses =asyncHandler(async (req,res,next) => {
    if(req.params.bootcampId){
        const courses = await CourseModel.find({ bootcamp: req.params.bootcampId })
        return res.status(200).json({
            success:true,
            count:courses.length,
            data:courses
        })
    }else{
        res.status(200).json(res.advancedResult)
    }
})

// @desc Get Single course
// @route - GET /api/v1/courses/:id
// @route - GET /api/v1/bootcamps/:bootcampId/courses
//@Access - Public
const getSingleCourse =asyncHandler( async (req,res,next) => {
    let query;
    const id = req.params.id;
    query = CourseModel.findById(id)

    const course = await query;

    if(!course){
        return next(
            new ErrorResponse(`No Course found with id of ${id}`)
        )
    }

    res.status(200).json({
        success:true,
        data:course
    })
})


// @desc - Add a Course
// @route - POST /api/v1/bootcamps/:bootcampId/courses
//@Access - Private
const addCourse = asyncHandler( async ( req,res,next ) => {
    let query ;
    const id = req.params.bootcampId
    req.body.bootcamp = id;
    req.body.user = req.user.id;

    const bootcamp = await BootcampModel.findById(id);
    if(!bootcamp){
        return next(
            new ErrorResponse(`No Bootcamp with id ${id}`)
        )
    }
    
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(
                `user with ${req.user.id} not authorize to create the course in following bootcamp`,
                401
                )
        )
    }

    query = CourseModel.create(req.body);

    const course = await query;

    res.status(200).json({
        success:true,
        data:course
    })
})

// @desc - Update a Course
// @route - PUT /api/v1/courses/:id
//@Access - Private
const updateCourse = asyncHandler( async ( req,res,next ) => {
    let query ;
    const id = req.params.id
    const course = await CourseModel.findById(id);

    if(!course){
        return next(
            new ErrorResponse(`No Course with id ${id}`)
        )
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(
                `user with ${req.user.id} not authorize to update the course in following bootcamp`,
                401
                )
        )
    }

    query = CourseModel.findByIdAndUpdate(id , req.body, { new:true, runValidators:true });

    const updateCourse = await query;

    res.status(200).json({
        success:true,
        data:updateCourse
    })
})


// @desc - Delete a Course
// @route - Delete /api/v1/courses/:id
//@Access - Private
const deleteCourse = asyncHandler( async ( req,res,next ) => {
    let query ;
    const id = req.params.id

    const course = await CourseModel.findById(id);

    if(!course){
        return next(
            new ErrorResponse(`No Course with id ${id}`)
        )
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(
                `user with ${req.user.id} not authorize to delete the course in following bootcamp`,
                401
                )
        )
    }

    query = CourseModel.findByIdAndDelete(id)

    await query;

    res.status(200).json({
        success:true,
        message:'Course removed Successfully'
    })
})


module.exports = {
    getCourses,
    getSingleCourse,
    addCourse,
    updateCourse,
    deleteCourse
}