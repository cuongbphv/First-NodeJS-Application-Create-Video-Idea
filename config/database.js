if(process.env.NODE_ENV === 'prodcution'){
    module.exports = {
        mongoURI: 'mongodb://bphvcg:1234567890@ds239029.mlab.com:39029/video-idea-bphvcg'
    };
}
else{
    module.exports = {
        mongoURI: 'mongodb://localhost/vidjot'
    };
}