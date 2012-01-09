(function() {
  var Comment, User, fs;
  User = require('../models/user');
  Comment = require('../models/comment');
  fs = require('fs');
  module.exports = function(app) {
    app.get('/profiles', function(req, res) {
      return User.find({
        type: 'daycare'
      }).desc('created_at').run(function(err, users) {
        return res.json(users);
      });
    });
    app.get('/profiles/:id', function(req, res) {
      return User.findOne({
        _id: req.params.id
      }).run(function(err, user) {
        var currentUser;
        currentUser = req.user ? req.user : {};
        return res.json(user.filterPrivateDataByUserId(currentUser._id));
      });
    });
    app.put('/profiles/:id', function(req, res) {
      var currentUser, data;
      currentUser = req.user ? req.user : {};
      data = req.body;
      delete data._id;
      return User.update({
        _id: req.params.id,
        _id: currentUser._id
      }, data, {}, function(err, user) {
        return res.json({
          success: true
        });
      });
    });
    app.get('/profiles/picture-set/:id', function(req, res) {
      var currentUser, pictureSetId;
      pictureSetId = req.params.id;
      currentUser = req.user ? req.user : {};
      return User.findOne({
        'picture_sets._id': pictureSetId
      }).run(function(err, user) {
        var pictureSet;
        pictureSet = user.picture_sets.id(pictureSetId);
        pictureSet = User.filterPrivatePictureSetsByUserId(currentUser._id, user.user_id, [pictureSet])[0];
        pictureSet.user_id = user._id;
        return res.json(pictureSet);
      });
    });
    app.put('/profiles/picture-set/:id', function(req, res) {
      var pictureSetId;
      pictureSetId = req.params.id;
      return User.findOne({
        'picture_sets._id': pictureSetId,
        _id: req.user._id
      }).run(function(err, user) {
        var key, pictureSet, pictureSetIndexToEdit, value, _i, _len, _ref, _ref2;
        if (user) {
          pictureSetIndexToEdit = -1;
          _ref = user.picture_sets;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pictureSet = _ref[_i];
            pictureSetIndexToEdit++;
            if (pictureSet._id + "" === pictureSetId + "") {
              break;
            }
          }
          delete req.body._id;
          _ref2 = req.body;
          for (key in _ref2) {
            value = _ref2[key];
            user.picture_sets[pictureSetIndexToEdit][key] = value;
          }
          user.save();
          return res.json({
            success: true
          });
        } else {
          return res.json({
            success: false
          });
        }
      });
    });
    app.del('/profiles/picture-set/:id', function(req, res) {
      var pictureSetId;
      pictureSetId = req.params.id;
      return User.findOne({
        'picture_sets._id': pictureSetId,
        _id: req.user._id
      }).run(function(err, user) {
        var filePath, picture, pictureSet, _i, _len, _ref;
        if (user) {
          pictureSet = user.picture_sets.id(pictureSetId);
          pictureSet.remove();
          user.save();
          _ref = pictureSet.pictures;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            picture = _ref[_i];
            filePath = './public/' + picture.url;
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              console.error(e);
            }
          }
          filePath = './public/users/' + pictureSetId;
          try {
            fs.rmdirSync(filePath);
          } catch (e) {
            console.error(e);
          }
          return res.json({
            success: true
          });
        } else {
          return res.json({
            success: false
          });
        }
      });
    });
    app.get('/profiles/pictures/:pictureSetId', function(req, res) {
      var currentUser, pictureSetId;
      pictureSetId = req.params.pictureSetId;
      currentUser = req.user ? req.user : {};
      return User.findOne({
        'picture_sets._id': pictureSetId
      }).run(function(err, user) {
        var pictureSet, pictures;
        pictureSet = user.picture_sets.id(pictureSetId);
        pictureSet = User.filterPrivatePictureSetsByUserId(currentUser._id, user.user_id, [pictureSet])[0] || {};
        pictures = pictureSet.pictures;
        return res.json(pictures);
      });
    });
    app.del('/profiles/picture/:pictureId', function(req, res) {
      var pictureId;
      pictureId = req.params.pictureId;
      return User.findOne({
        'picture_sets.pictures._id': pictureId,
        _id: req.user._id
      }).run(function(err, user) {
        var bigFilePath, filePath, mediumFilePath, picture, pictureIndex, pictureIndexToGo, pictureSet, pictureSetIndex, pictureSetIndexToGo, pictureToRemove, thumbFilePath, _i, _j, _len, _len2, _ref, _ref2;
        if (user) {
          pictureSetIndex = -1;
          pictureIndex = -1;
          pictureSetIndexToGo = -1;
          pictureIndexToGo = -1;
          _ref = user.picture_sets;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pictureSet = _ref[_i];
            pictureSetIndex++;
            pictureIndex = -1;
            _ref2 = pictureSet.pictures;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              picture = _ref2[_j];
              pictureIndex++;
              if (("" + picture._id) === ("" + pictureId)) {
                pictureSetIndexToGo = pictureSetIndex;
                pictureIndexToGo = pictureIndex;
                break;
              }
            }
          }
          pictureToRemove = user.picture_sets[pictureSetIndexToGo].pictures[pictureIndexToGo];
          filePath = './public/' + pictureToRemove.url;
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error(e);
          }
          thumbFilePath = './public/' + pictureToRemove.thumb_url;
          try {
            fs.unlinkSync(thumbFilePath);
          } catch (e) {
            console.error(e);
          }
          mediumFilePath = './public/' + pictureToRemove.medium_url;
          try {
            fs.unlinkSync(mediumFilePath);
          } catch (e) {
            console.error(e);
          }
          bigFilePath = './public/' + pictureToRemove.big_url;
          try {
            fs.unlinkSync(bigFilePath);
          } catch (e) {
            console.error(e);
          }
          user.picture_sets[pictureSetIndexToGo].pictures[pictureIndexToGo].remove();
          user.save();
          Comment.findOne({
            "content.picture._id": pictureToRemove._id
          }).run(function(err, comment) {
            return comment.remove();
          });
          return res.json({
            success: true
          });
        } else {
          return res.json({
            success: false
          });
        }
      });
    });
    app.put('/profiles/picture/:pictureId', function(req, res) {
      var pictureId;
      pictureId = req.params.pictureId;
      return User.findOne({
        'picture_sets.pictures._id': pictureId,
        _id: req.user._id
      }).run(function(err, user) {
        var key, picture, pictureIndex, pictureIndexToGo, pictureSet, pictureSetIndex, pictureSetIndexToGo, value, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
        if (user) {
          pictureSetIndex = -1;
          pictureIndex = -1;
          pictureSetIndexToGo = -1;
          pictureIndexToGo = -1;
          _ref = user.picture_sets;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pictureSet = _ref[_i];
            pictureSetIndex++;
            pictureIndex = -1;
            _ref2 = pictureSet.pictures;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              picture = _ref2[_j];
              pictureIndex++;
              if (("" + picture._id) === ("" + pictureId)) {
                pictureSetIndexToGo = pictureSetIndex;
                pictureIndexToGo = pictureIndex;
                break;
              }
            }
          }
          _ref3 = user.picture_sets[pictureSetIndexToGo].pictures;
          for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
            picture = _ref3[_k];
            picture.primary = false;
          }
          delete req.body._id;
          _ref4 = req.body;
          for (key in _ref4) {
            value = _ref4[key];
            user.picture_sets[pictureSetIndexToGo].pictures[pictureIndexToGo][key] = value;
          }
          user.save();
          return res.json({
            success: true
          });
        } else {
          return res.json({
            success: false
          });
        }
      });
    });
    return app.post('/profiles/upload', function(req, res) {
      var bigFilePath, bigRelativeFilePath, currentUser, description, dirPath, fileExtension, fileName, filePath, mediumFilePath, mediumRelativeFilePath, newPicture, newPictureData, pictureSetId, relativeDirPath, relativeFilePath, thumbFilePath, thumbRelativeFilePath, ws;
      currentUser = req.user ? req.user : {};
      pictureSetId = req.query.setId;
      fileName = req.query.qqfile;
      description = req.query.description;
      fileExtension = fileName.substring(fileName.length - 3).toLowerCase();
      fileName = new Date().getTime();
      dirPath = './public/users/' + pictureSetId + '/';
      relativeDirPath = '/users/' + pictureSetId + '/';
      filePath = dirPath + fileName + '.' + fileExtension;
      thumbFilePath = dirPath + fileName + '_thumb.' + fileExtension;
      mediumFilePath = dirPath + fileName + '_medium.' + fileExtension;
      bigFilePath = dirPath + fileName + '_big.' + fileExtension;
      relativeFilePath = relativeDirPath + fileName + '.' + fileExtension;
      thumbRelativeFilePath = relativeDirPath + fileName + '_thumb.' + fileExtension;
      mediumRelativeFilePath = relativeDirPath + fileName + '_medium.' + fileExtension;
      bigRelativeFilePath = relativeDirPath + fileName + '_big.' + fileExtension;
      newPictureData = {
        url: relativeFilePath,
        thumb_url: thumbRelativeFilePath,
        medium_url: mediumRelativeFilePath,
        big_url: bigRelativeFilePath,
        description: description
      };
      newPicture = null;
      if (req.xhr) {
        try {
          fs.statSync(dirPath);
        } catch (e) {
          fs.mkdirSync(dirPath, 0777);
        }
        ws = fs.createWriteStream(filePath);
        try {
          fs.chmodSync(filePath, 777);
        } catch (e) {

        }
        req.on('data', function(data) {
          return ws.write(data);
        });
        return req.on('end', function() {
          return User.findOne({
            'picture_sets._id': pictureSetId,
            _id: req.user._id
          }).run(function(err, user) {
            var im, newPicturePosition, pictureSet, pictureSetIndex, pictureSets, _i, _len;
            if (user) {
              pictureSets = user.picture_sets;
              newPicturePosition = null;
              pictureSetIndex = -1;
              for (_i = 0, _len = pictureSets.length; _i < _len; _i++) {
                pictureSet = pictureSets[_i];
                pictureSetIndex++;
                if ("" + pictureSet._id === "" + pictureSetId) {
                  if (!pictureSet.pictures.length) {
                    newPictureData.primary = true;
                  }
                  newPicturePosition = pictureSet.pictures.push(newPictureData);
                  break;
                }
              }
              user.picture_sets = pictureSets;
              user.save();
              newPicture = user.picture_sets[pictureSetIndex].pictures[newPicturePosition - 1];
              newPicture.success = true;
              im = require('imagemagick');
              return im.crop({
                srcPath: filePath,
                dstPath: thumbFilePath,
                width: 110,
                height: 85,
                quality: 1
              }, function(err, stdout, stderr) {
                if (err) {
                  console.log(err);
                }
                if (err) {
                  console.log(stderr);
                }
                return im.crop({
                  srcPath: filePath,
                  dstPath: mediumFilePath,
                  width: 420,
                  height: 290,
                  quality: 1
                }, function(err, stdout, stderr) {
                  if (err) {
                    console.log(err);
                  }
                  if (err) {
                    console.log(stderr);
                  }
                  return im.resize({
                    srcPath: filePath,
                    dstPath: bigFilePath,
                    width: 800,
                    height: 600,
                    quality: 1
                  }, function(err, stdout, stderr) {
                    var comment;
                    if (err) {
                      console.log(err);
                    }
                    if (err) {
                      console.log(stderr);
                    }
                    comment = new Comment({
                      from_id: currentUser._id,
                      to_id: user._id,
                      wall_id: user._id,
                      type: "status",
                      content: {
                        type: "new_picture",
                        picture_set_id: user.picture_sets[pictureSetIndex]._id,
                        picture_set_name: user.picture_sets[pictureSetIndex].name,
                        picture: newPicture
                      }
                    });
                    comment.save();
                    return res.json(newPicture);
                  });
                });
              });
            } else {
              return res.json({
                success: false
              });
            }
          });
        });
      } else {
        return res.json({
          success: false
        });
      }
    });
  };
}).call(this);