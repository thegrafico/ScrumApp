var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  let params = {title: "Projects", "createProjectFormRedirect": "/"};

  res.render('projects', params);
});

module.exports = router;
