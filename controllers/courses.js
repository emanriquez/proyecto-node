const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Course = require("../models/courses");
const { errorHandler } = require("../helpers/dbErrorHandler");

//COURSE ID
exports.courseById = (req, res, next, id) => {
    Course.findById(id).exec((err, course) => {
        if (err || !course) {
            return res.status(400).json({
                error: "Course not found"
            });
        }
        req.course = course;
        next();
    });
};


//READ COURSE
exports.read = (req, res) => {
    req.course.photo = undefined;
    return res.json(req.course);
};


//CREATE COURSE
exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        // check for all fields
        const {
            name,
            description,
            teacher,
        } = fields;

        if (
            !name ||
            !description ||
            !teacher 
        
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let course = new Course(fields);


        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            course.photo.data = fs.readFileSync(files.photo.path);
            course.photo.contentType = files.photo.type;
        }

        course.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};


//REMOVE COURSE
exports.remove = (req, res) => {
    let course = req.course;
    course.remove((err, deleteCourse) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Course deleted successfully"
        });
    });
};


//UPDATE COURSE
exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }

        let course = req.course;
        course = _.extend(course, fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            course.photo.data = fs.readFileSync(files.photo.path);
            course.photo.contentType = files.photo.type;
        }

        course.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

//LIST COURSE
exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Course.find()
      
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, course) => {
            if (err) {
                return res.status(400).json({
                    error: "Course not found"
                });
            }
            res.json(course);
        });
};

