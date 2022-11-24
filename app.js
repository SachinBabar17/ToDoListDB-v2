



const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost/todolistDB", {useNewUrlParser: true});

mongoose.connect("mongodb+srv://admin-todolist:babar17@cluster0.brfr8zg.mongodb.net/todolistDB", {useNewUrlParser: true});

// mongodb+srv://<username>:<password>@cluster0.brfr8zg.mongodb.net/?retryWrites=true&w=majority

/*
ToDoListDB-v2
ToDoListDB-17
*/

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



// Database query

/*

> show dbs
admin       0.000GB
config      0.000GB
local       0.000GB
shopDB      0.000GB
todolistDB  0.000GB

> use todolistDB
switched to db todolistDB

> show collections
items
lists

> db.lists.find()
{ "_id" : ObjectId("637cd39a55abf83c140a6a14"), "name" : "Favicon.ico", "items" : [ { "_id" : ObjectId("637cd37855abf83c140a6a11"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd37855abf83c140a6a12"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd37855abf83c140a6a13"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }
{ "_id" : ObjectId("637cd3b355abf83c140a6a18"), "name" : "Home", "items" : [ { "_id" : ObjectId("637cd4ce402d9d3324b1d33f"), "name" : "Eat" }, { "_id" : ObjectId("637cd4d1402d9d3324b1d341"), "name" : "Code" }, { "_id" : ObjectId("637cd4d5402d9d3324b1d343"), "name" : "Sleep" }, { "_id" : ObjectId("637cd4dd402d9d3324b1d345"), "name" : "Repeat" } ], "__v" : 4 }
{ "_id" : ObjectId("637cd43c51494451e8e6a3ef"), "name" : "Work", "items" : [ { "_id" : ObjectId("637cd42651494451e8e6a3ec"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd42651494451e8e6a3ed"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd42651494451e8e6a3ee"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }
{ "_id" : ObjectId("637cd4e4402d9d3324b1d347"), "name" : "Hiiii", "items" : [ { "_id" : ObjectId("637cd46b402d9d3324b1d339"), "name" : "Hit the + button to add a new item." } ], "__v" : 0 }
{ "_id" : ObjectId("637cd85d402d9d3324b1d34b"), "name" : "School", "items" : [ { "_id" : ObjectId("637cd46b402d9d3324b1d338"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd46b402d9d3324b1d339"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd46b402d9d3324b1d33a"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }

> db.lists.remove({name:'Hiiii'})
WriteResult({ "nRemoved" : 1 })

> db.lists.find()
{ "_id" : ObjectId("637cd39a55abf83c140a6a14"), "name" : "Favicon.ico", "items" : [ { "_id" : ObjectId("637cd37855abf83c140a6a11"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd37855abf83c140a6a12"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd37855abf83c140a6a13"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }
{ "_id" : ObjectId("637cd3b355abf83c140a6a18"), "name" : "Home", "items" : [ { "_id" : ObjectId("637cd4ce402d9d3324b1d33f"), "name" : "Eat" }, { "_id" : ObjectId("637cd4d1402d9d3324b1d341"), "name" : "Code" }, { "_id" : ObjectId("637cd4d5402d9d3324b1d343"), "name" : "Sleep" }, { "_id" : ObjectId("637cd4dd402d9d3324b1d345"), "name" : "Repeat" } ], "__v" : 4 }
{ "_id" : ObjectId("637cd43c51494451e8e6a3ef"), "name" : "Work", "items" : [ { "_id" : ObjectId("637cd42651494451e8e6a3ec"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd42651494451e8e6a3ed"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd42651494451e8e6a3ee"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }
{ "_id" : ObjectId("637cd85d402d9d3324b1d34b"), "name" : "School", "items" : [ { "_id" : ObjectId("637cd46b402d9d3324b1d338"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd46b402d9d3324b1d339"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd46b402d9d3324b1d33a"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }

> db.lists.remove({name:'Favicon.ico'})
WriteResult({ "nRemoved" : 1 })

> db.lists.find()
{ "_id" : ObjectId("637cd3b355abf83c140a6a18"), "name" : "Home", "items" : [ { "_id" : ObjectId("637cd4ce402d9d3324b1d33f"), "name" : "Eat" }, { "_id" : ObjectId("637cd4d1402d9d3324b1d341"), "name" : "Code" }, { "_id" : ObjectId("637cd4d5402d9d3324b1d343"), "name" : "Sleep" }, { "_id" : ObjectId("637cd4dd402d9d3324b1d345"), "name" : "Repeat" } ], "__v" : 4 }
{ "_id" : ObjectId("637cd43c51494451e8e6a3ef"), "name" : "Work", "items" : [ { "_id" : ObjectId("637cd42651494451e8e6a3ec"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd42651494451e8e6a3ed"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd42651494451e8e6a3ee"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }
{ "_id" : ObjectId("637cd85d402d9d3324b1d34b"), "name" : "School", "items" : [ { "_id" : ObjectId("637cd46b402d9d3324b1d338"), "name" : "Welcome to your todolist!" }, { "_id" : ObjectId("637cd46b402d9d3324b1d339"), "name" : "Hit the + button to add a new item." }, { "_id" : ObjectId("637cd46b402d9d3324b1d33a"), "name" : "<-- Hit this to delete an item." } ], "__v" : 0 }

> db.items.find()
{ "_id" : ObjectId("637cd492402d9d3324b1d33b"), "name" : "Eat", "__v" : 0 }
{ "_id" : ObjectId("637cd497402d9d3324b1d33c"), "name" : "Code", "__v" : 0 }
{ "_id" : ObjectId("637cd49e402d9d3324b1d33d"), "name" : "Sleep", "__v" : 0 }
{ "_id" : ObjectId("637cd4a4402d9d3324b1d33e"), "name" : "Repeat", "__v" : 0 }


*/