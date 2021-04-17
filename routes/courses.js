const express = require('express');
const { getCourses, getSingleCourse, addCourse, updateCourse, deleteCourse } = require('../controller/coursesController');
const courseRoutes = express.Router({ mergeParams:true })
const CourseModel = require('../models/Course');
const advancedResult = require('../middlewares/advancedResult');
const { protectRoutes,roles } = require('../middlewares/authHandler');



courseRoutes.get('/', advancedResult(CourseModel,{ 
    path:'bootcamp',
    select:'name description'
 }),getCourses);
courseRoutes.get('/:id', getSingleCourse);
courseRoutes.post('/', protectRoutes, roles('admin','publisher'),addCourse);
courseRoutes.put('/:id',protectRoutes,roles('admin','publisher'),updateCourse);
courseRoutes.delete('/:id',protectRoutes,roles('admin','publisher'), deleteCourse)


module.exports = courseRoutes;