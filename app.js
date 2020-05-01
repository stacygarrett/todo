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

const pagesSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [ 1 ]
	},
	lists: [ listSchema ],
	status: Boolean
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);
const Page = mongoose.model('Page', pagesSchema);

const item1 = new Item({ name: 'Welcome to your To-Do List!' });
const item2 = new Item({ name: 'Add a new item with the + button.' });
const item3 = new Item({ name: '<-- Select the box to delete one.' });

const defaultItems = [ item1, item2, item3 ];

const page1 = new Page({ name: 'Today' });
const page2 = new Page({ name: 'Work' });
const page3 = new Page({ name: 'School' });

const defaultPages = [ page1, page2, page3 ];

const dateFunc = function() {
	return date.getDate();
};

app.use(express.static('public'));
app.use(express.static('views'));

/* app.get('/', function(req, res) {
	Page.find({}, function(err, foundPages) {
		if (foundPages.length === 0) {
			Page.insertMany(defaultPages, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('Successfully added new pages to the PagesDB');
				}
			});
			res.redirect('/');
		} else {
			res.render('page', { pageName: foundPages });
		}
	});
}); */

app.get('/', function(req, res) {
	Item.find({}, function(err, foundItems) {
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

app.get('/about', function(req, res) {
	res.render('about');
});

app.get('/:customListName', function(req, res) {
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({ name: customListName }, function(err, foundList) {
		if (!err) {
			if (!foundList) {
				const list = new List({
					name: customListName,
					items: defaultItems
				});
				list.save();
				res.redirect('/' + customListName);
			} else if (foundList === 'about') {
				res.redirect('/about');
			} else {
				res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
			}
		}
	});
});

app.post('/', function(req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;
	const pageName = req.body.pageName;
	console.log(pageName);
	const item = new Item({ name: itemName });
	const newPage = new Page({ name: pageName });
	if (listName === dateFunc()) {
		item.save();
		res.redirect('/');
	} else {
		List.findOne({ name: listName }, function(err, foundList, foundPages) {
			foundList.items.push(item);
			foundList.save();
			foundPages.newPage.push(newPage);
			foundPages.save();
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

let port = process.env.PORT;
if (port == null || port == '') {
	port = 3000;
}

app.listen(port, function() {
	console.log('Server started on port 3000');
});
