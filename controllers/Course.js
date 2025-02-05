const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Function to create a new course
//create Course handler fun
exports.createCourse= async(req,res)=>{
    try{
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn,price,tag}= req.body;
        //get thumbnail
        const thumbnail=req.files.thumbnailImage;
        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message:'All fields are required',
            });
        }
        //check for instructor
        const userId= req.user.id;
        const instructorDetails= await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails);
       //TODO: Verify that user id and instructor detail id are same or different. 
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }
        //check given tag is valid or not
        const tagDetails= await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'Tag details not found',
            });
        }
        //Upload image top cloudinary
        const thumbnailImage= await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        //create an entry  for new course
        const newCourse= await Course.create({
            courseName,
            courseDescription ,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })
        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new: true},
        )
         //Update the tag kaa schema
         //hw
         // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
        { _id: category },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      console.log("HEREEEEEEEE", categoryDetails2)
      // Return the new course and a success message


         //return response
         return res.status(200).json({
            success: true,
            message: 'Course Created successfully',
            data: newCourse,
         });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message:'Failed to create course',
            error: error.message,
        })

    }
};

//get allCourses handler fun
exports.showAllCourses= async(req,res)=>{
    try {
        const allCourses= await Course.find({});
            return res.status(200).json({
                success:true,
                message:'Data for all courses fetched successfully',
                data: allCourses, 
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot fetch course data',
            error: error.message,
        })
    }
}