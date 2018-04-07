const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


//Load helpers
const {ensureAuthenticated} = require('../helpers/auth');

//Load model into app
require('../models/Idea');
const Idea = mongoose.model('ideas');

//Ideas index
router.get("/", ensureAuthenticated, (req, res) => {
    Idea.find({user_id: req.user.id})
        .sort({
            date: 'desc'
        })
        .then(ideas => res.render('ideas/ideas', {
            ideas_Object: ideas,
            title: 'Your Ideas'
        }));
});

//Form add new video idea
router.get("/add", ensureAuthenticated, (req, res) => {
    res.render('ideas/add-idea',{
        title: 'Add New Video Idea'
    });
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            if(idea.user_id != req.user.id){
                req.flash('error_msg','You are not authenticated');
                res.redirect('/ideas');
            }
            else{
                res.render('ideas/edit-idea', {
                    idea: idea,
                    title: 'Edit Video Idea'
                });
            }
        });
});

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            // new values
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(idea => {
                    req.flash('success_msg','Video idea edited successfully');
                    res.redirect('/ideas');
                });
        });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.deleteOne({
            _id: req.params.id
        })
        .then(() => {
            req.flash('success_msg','Video idea removed successfully');
            res.redirect('/ideas');
        });
});


router.post('/', (req, res) => {
    let errors = [];

    if (!req.body.title)
        errors.push({
            text: 'Please add a title for idea'
        });
    if (!req.body.details)
        errors.push({
            text: 'Please add more details'
        });

    if (errors.length > 0) {
        res.render('ideas/add-idea', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newIdea = {
            title: req.body.title,
            details: req.body.details,
            user_id: req.user.id
        };
        new Idea(newIdea)
            .save()
            .then(idea => {
                req.flash('success_msg','Create new video idea successfully');
                res.redirect('/ideas');
            });
    }
});

module.exports = router;

