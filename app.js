const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
const ejs = require("ejs");
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const app = express ();

//MongoDB user pword - IZ3S8WopisANsllE
//URL - https://todolist-udemy.onrender.com


main().catch(err => console.log(err));
async function main() {

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB'); 

//Connect to MongoDB cloud DB server
await mongoose.connect("mongodb+srv://thomasjwrightmain:IZ3S8WopisANsllE@cluster0.knxcnqe.mongodb.net/ToDoList-V2-Mongo")

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A fruit name is required']
    },
  });

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: 'Check calendar'
});

const item2 = new Item({
    name: 'Check calendar again'
});

const item3 = new Item({
    name: 'Check calendar one more time'
});

const itemArray = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A fruit name is required']
    },
    items: [itemsSchema]
  });

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
    
    Item.find({})
    .then((items) => {
        //if items array is empty then add the default list items
        if (items.length === 0) {
            Item.insertMany(itemArray)
            .then(function () {
                console.log("Successfully saved defult items to DB");
            })
            .catch(function (err) {
                console.log(err);
            });
            // if items are added we redirect back to this function, the if statement = False so the list values are rendered on the web page
            res.redirect("/");
        } else {
            //if the list array is not empty then render its contents on the web page
        res.render('list', {listTitle: "Today", newListValues: items});
        }
      })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/:customListName", function(req, res) {
    customList = _.capitalize(req.params.customListName);
    //console.log(customList)

    List.findOne({ name: customList })
    .then(function(foundList){
        if (!foundList) {
            const newList = new List({
                name: customList,
                items: itemArray
        });
        newList.save();
        console.log("new list saved");
        res.redirect("/"+customList);
        } else {
            res.render('list', {listTitle: foundList.name, newListValues: foundList.items});
        }
    })
    .catch(function(err){});
    });

app.post("/",  async function (req, res) {

    const itemName = req.body.newValue;
    const listName = req.body.list;
    //console.log(req.body);

    const newItem = new Item({
        name: itemName
    });


    if (listName === "Today") {
        newItem.save()
        .then(function() {
          console.log('Successful save');
          res.redirect("/");
        })
        .catch(function(err) {
            console.log(err);
        })
    } else {
        List.findOne({ name: listName })
        .then(function(foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",  async function (req, res) {

    const checkedId = req.body.completedValue;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedId)
        .then(function() {
            console.log('Today list value delete successful');
                })
        .catch(function(err) {
            console.log(err);
        });
        res.redirect("/");
    } else {
        List.findOneAndDelete({name: listName}, {$pull: {items: {_id: checkedId}}}, {new: true})
        .then(function() {
            console.log('Custom list delete successful');
            res.redirect("/"+listName);
        })
        .catch(function(err) {
                console.log(err);
        })
    }
    });

app.get("/about", function(req, res) { 
    res.render('about');
});


app.listen(PORT, function(){
    console.log("Server started on port " + PORT);
});

};
