const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();



console.log(date());



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//creating a database "todoDB".
mongoose.connect('mongodb+srv://Daksh:17121975@cluster0-dxyxg.mongodb.net/todoDB', {useNewUrlParser: true, useUnifiedTopology: true});

// SCHEMA of todoDB : itemsSchema.
const itemsSchema = {name: String};

//creating a mongoose model with collection's name: "Collection".
const Item = mongoose.model("Collection", itemsSchema);


//creating 3 default documents to be displayed.
const item1 = new Item({name: "Welcome to your own ToDo List..."});
const item2 = new Item({name: "Hit the + to add a new item"});
const item3 = new Item({name: "By Daksh Doshi"});
console.log(mongoose.connection.readyState);

//putting all 3 into an array.
const defaultItems = [item1, item2, item3];


//creating a new schema for any list to be generated with name("TITLE") and ITEMS.
const listSchema = {name: String, items: [itemsSchema]};

//creating the model for a new collection: Lists, named "List".
const List = mongoose.model("List", listSchema);



app.get('/', (req, res) =>{


    //Using "find" method to use the objects(items) from database in app.js .
    //"foundItems" is the resultant array of our findings.
    Item.find({}, (err,foundItems)=>{

        console.log(foundItems);
        //to avoid inserting the default items every single time of reload by insertMany method.
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err)=>{
                if(err){console.log(err);}
                else{console.log("Successfully added deafult items to the DataBase.");}
            });
            //automatically redirecting the app to home("/") route after adding.
            res.redirect("/");
        }
        else{
            res.render("list", {kindofday: "Today", newItems: foundItems});
        }
    });
});


//for express routing parameters.
app.get("/:randomList", (req,res)=>{
    //capitalize method used of lodash to avoid case specificness.
    const newListName = _.capitalize(req.params.randomList);
    console.log(newListName);
    //to find whether list already exists or not.
    List.findOne({name: newListName}, (err, foundList)=>{
        if(!err){
            if(!foundList){
                //create a new list if entered list does not exist till the moment.
                const newList = new List({
                    name: newListName,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + newListName);
            }
            else{
                //diplay the existing list.
                res.render("list",{kindofday: foundList.name, newItems: foundList.items});
            }
        }
    });

});




app.post("/", (req,res) =>{
    //declaring the new input to be added on hitting the + button.
    const newInput = req.body.newInput;
    const listName = req.body.inputButton;
    console.log(listName);
    //new item document created.
    const newItem = new Item({name: newInput});

    if(listName === "Today"){
        newItem.save();
        //redirecting to the home route after adding the new Input.
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, (err,foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

//to delete the item on hitting the checkbox.
app.post("/delete", (req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.hiddenInput;
    //check if the delete POST request is coming from original page or some random LIST page.
    if(listName === "Today"){
        //using findByIdAndRemove method to remove the item with checkedItemID. (PS: callback is compulsory to execute the removal...)
        Item.findByIdAndRemove(checkedItemId, (err)=>{
            if(err){
            console.log(err);
            }else{
            console.log("Succesfully deleted");
            res.redirect("/");
            }
        });
    }
    else{
        //finding the particular list from which delete POST request is made.
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, (err, foundList)=>{
            if(!err){
              res.redirect("/" + listName);
            }
          });
    }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


//server on localhost:3000.
app.listen(port, function(){
    console.log("Server is up and Running!!!");
});
