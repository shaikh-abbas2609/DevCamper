const mongoose = require('mongoose');
// const BootcampModel = require('./Bootcamps')

const CourseSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:[true,'Please add a course title']
    },
    description:{
        type:String,
        required:[true,'PLease add a Description']
    },
    weeks:{
        type:String,
        required:[true,'Please add number of weeks']
    },
    tution:{
        type:Number,
        required:[true,'Please add a tution cost']
    },
    minimumSkill:{
        type:String,
        required:[true,'PLease add a minimum skill'],
        enum:['beginner','intermediate','advanced']
    },
    scholarshipAvailable:{
        type:Boolean,
        default:false
    },
    bootcamp:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'bootcamp',
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user',
        required:true
    }
},{ timestamps:true })

CourseSchema.statics.getAverageCost = async function(bootcampId){
    const obj = await this.aggregate([
      {
        $match: { bootcamp: bootcampId }
      },
      {
          $group: {
              _id: '$bootcamp',
              averageCost: { $avg: '$tution' }
          }
      }
    ])

  try {
    await this.model('bootcamp').findByIdAndUpdate(bootcampId,{
        averageCost: Math.floor(obj[0].averageCost / 10 * 10)
     })
  } catch (err) {
      console.error(err)
  }
}

// Call Get Average Cost After Save
CourseSchema.post('save',function(){
    this.constructor.getAverageCost(this.bootcamp)
})


// Call Get Average Cost Before Save
CourseSchema.pre('remove',function(){
    this.constructor.getAverageCost(this.bootcamp)
})



const CourseModel = mongoose.model('Course',CourseSchema);

module.exports = CourseModel