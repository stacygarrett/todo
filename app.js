//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const _ = require('lodash');

const app = express();
const connectionString = 'mongodb+srv://admin-stacy:Test-123@cluster0-zj8ei.mongodb.net/todolistDB';

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

const itemsSchema = new mongoose.Schema({
	name: { type: String, required: [ 1 ] }
});

const listSchema = new mongoose.Schema({
	name: String,
	items: [ itemsSchema ]
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

const item1 = new Item({ name: 'Buy Vegetables' });
const item2 = new Item({ name: 'Make Dinner' });
const item3 = new Item({ name: 'Do the Dishes' });

const defaultItems = [ item1, item2, item3 ];

const dateFunc = function() {
	return date.getDate();
};

app.use(express.static('public'));

app.get('/', function(req, res) {
	Item.find({}, function(err, foundItems) {
		// console.log(foundItems);
		if (foundItems.length === 0) {
			Item.insertMany(defaultItems, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('Successfully added new items to the ItemsDB');
				}
			});
			res.redirect('/');
		} else {
			res.render('list', { listTitle: dateFunc(), newListItems: foundItems });
		}
	});
});

app.post('/', function(req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;
	// console.log(listName);
	const item = new Item({ name: itemName });
	if (listName === dateFunc()) {
		item.save();
		res.redirect('/');
	} else {
		List.findOne({ name: listName }, function(err, foundList) {
			foundList.items.push(item);
			foundList.save();
			res.redirect('/' + listName);
		});
	}
});

app.post('/delete', function(req, res) {
	// console.log(req.body.checkbox);
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;
	if (listName === dateFunc()) {
		Item.findByIdAndRemove(checkedItemId, function(err, foundList) {
			if (!err) {
				console.log('Successfully deleted checked item');
				res.redirect('/');
			}
		});
	} else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(
			err,
			foundList
		) {
			if (!err) {
				res.redirect('/' + listName);
			}
		});
	}
});

/* app.get('/work', function(req, res) {
	res.render('list', { listTitle: 'Work List', newListItems: workItems });
}); */

app.get('/:customListName', function(req, res) {
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({ name: customListName }, function(err, foundList) {
		// console.log(list);
		if (!err) {
			if (!foundList) {
				const list = new List({
					name: customListName,
					items: defaultItems
				});
				list.save();
				res.redirect('/' + customListName);
			} else {
				res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
			}
		}
	});
});

app.get('/about', function(req, res) {
	res.render('about');
});

app.listen(3000, function() {
	console.log('Server started on port 3000');
});
