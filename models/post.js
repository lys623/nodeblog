var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  name: String,
  password: String,
  time: {
    type: Date,
    default: Date.now
  },
  title: String,
  tags: String,
  post: String,
  comments: [],
  reprint_info: {},
  pv: 0
}, {
  collection: 'posts'
});

var PostModle = mongoose.model('Post', PostSchema);

function Post(name, head, title, tags, post) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.tags = tags;
  this.post = post;
}

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year: date.getFullYear(),
      month: date.getFullYear() + "-" + (date.getMonth() + 1),
      day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
  var post = {
    name: this.name,
    head: this.head,
    time: time,
    title: this.title,
    tags: this.tags,
    post: this.post,
    comments: [],
    reprint_info: {},
    pv: 0
  };
  //打开数据库
  var newPost = new PostModle(post);

  newPost.save(function(err, post) {
    if (err) {
      return callback(err);
    };
    callback(null, post);
  })
};
//一次获取十篇文章
Post.getTen = function(name, page, callback) {
  //打开数据库
  var query = {};
  if (name) {
    query.name = name;
  }
  PostModle.count(query, function(err, total) {

    PostModle.find(query, null, {
      skip: (page - 1) * 10,
      limit: 10
    }).sort({
      time: -1
    }).exec(function(err, docs) {
      if (err) {
        return callback(err);
      }
      callback(null, docs, total);
    });

  })

};

Post.getOne=function(name, day, title, callback){
  PostModle.find({
        "name": name,
        "time.day": day,
        "title": title
      },function (err, doc) {
        if (err) {
          return callback(err);
        }
        if (doc) {
          //每访问 1 次，pv 值增加 1
          PostModle.update({
            "name": name,
            "time.day": day,
            "title": title
          }, {
            $inc: {"pv": 1}
          }, function (err) {
            if (err) {
              return callback(err);
            }
          });
          //解析 markdown 为 html
          // doc.post = markdown.toHTML(doc.post);
          // doc.comments.forEach(function (comment) {
          //   comment.content = markdown.toHTML(comment.content);
          // });
          callback(null, doc);//返回查询的一篇文章
        }
      });
}
module.exports = Post;
