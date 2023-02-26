const express = require('express');
const bodyParser = require('body-parser');
const { getDay } = require('./date');
const mongoose = require('mongoose');
const { name } = require('ejs');
const app = express();
const _ = require('lodash');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'ejs');


mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://rizkythegreat:rizkythegreat@cluster0.6eoovl7.mongodb.net/todolistDB');

const itemsSchema = {
    name: {
        type: String,
        required: [true, "Nothing to add"]
    }
};

const Item = mongoose.model('Item', itemsSchema);

const item = [{ name: "Welcome to your todolist!" }, { name: "Hit the + button to add a new item." }, { name: "<- Hit this to delete an item." }];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(item, function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Succes insert data");
//     }
// });

// Item.deleteMany({ name: "Eat Food" }, function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Deleted");
//     }
// });

app.get('/', (req, res) => {
    Item.find({}, function (err, foundItems) {
        if (!foundItems.length) {
            Item.insertMany(item, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succes insert data");
                }
            });
            res.redirect('/');
        } else {
            res.render('list', { listTitle: "Today", newItems: foundItems });
        }

    });

});

app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //create a new list
                const list = new List({
                    name: customListName,
                    items: item
                });
                list.save();
                res.redirect('/' + customListName);
            } else {
                //show existing list
                res.render('list', { listTitle: foundList.name, newItems: foundList.items })
            }
        }
    });


});

app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.deleteOne({ _id: checkedItemId }, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect('/' + listName);
            }
        });
    }

});

app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName)
        });
    }


});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log('Server has started successfully');
})