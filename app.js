const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const _ = require('lodash');

let port = process.env.PORT;
if (port == null || port == '') {
	port = 3000;
}
const connectionString =
	'mongodb+srv://admin-stacy:FaHq0YY069fl6gqS@cluster0-zj8ei.mongodb.net/todolistDB?retryWrites=true&w=majority';
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

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
const List = mongoose.model('Lists', listSchema);

const item1 = new Item({ name: 'Welcome to your To-Do List!' });
const item2 = new Item({ name: 'Add a new item with the + button.' });
const item3 = new Item({ name: '<-- Select the box to delete one.' });
const item4 = new Item({ name: '<-- Select the box to delete one.' });

const defaultItems = [ item1, item2, item3, item4 ];

const day = date.getDate();

app.use(express.static('public'));

app.use(function(req, res, next) {
	if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
		return res.sendStatus(204);
	}
	return next();
});

app.get('/', function(req, res) {
	let newPageInput = '';
	List.find({}, function(err, lists) {
		Item.find({}, function(err, foundItems) {
			// console.log('item.find --', foundItems);
			if (foundItems.length === 0) {
				Item.insertMany(defaultItems, function(err) {
					if (err) {
						console.log(err);
					} else {
						console.log('Successfully added new items to the ItemsDB');
						res.redirect('/');
					}
				});
			} else {
				Item.find({}, function(err, items) {
					console.log(items);
					console.log('list.find - app.get', lists);
					res.render('list', {
						listTitle: day,
						newListItems: items,
						pageLists: lists,
						newPageInput: newPageInput
					});
				});
			}
		});
		// }
	});
});

app.get('/about', function(req, res) {
	res.render('about');
});

app.get('/:customListName', function(req, res) {
	const customListName = _.capitalize(req.params.customListName);
	let newPageInput = '';
	List.find({}, function(err, lists) {
		List.findOne({ name: customListName }, function(err, foundList) {
			console.log('foundList - app.get /customListName', foundList);
			if (!err) {
				if (!foundList) {
					const list = new List({
						name: customListName
					});
					list.save();
					res.redirect('/' + customListName);
				} else if (foundList === 'about') {
					res.redirect('/about');
				} else {
					console.log('foundList - /customListName', foundList);
					res.render('list', {
						listTitle: foundList.name,
						newListItems: foundList.items,
						lists: lists,
						pageLists: lists,
						newPageInput: newPageInput
					});
				}
			}
		});
	});
});

app.post('/', function(req, res) {
	console.log(req.body);
	const itemName = _.upperFirst(req.body.newItem);
	console.log('itemName:', req.body.newItem);
	const listName = req.body.list;
	console.log('listName', listName);
	const item = new Item({ name: itemName });
	if (listName === day) {
		item.save();
		res.redirect('/');
	} else {
		List.findOne({ name: listName }, function(err, foundList) {
			console.log('foundList - post /', foundList);
			console.log('foundList.items', foundList.items);
			foundList.items.push(item);
			foundList.save();
			res.redirect('/' + listName);
		});
	}
});

app.post('/newpage', function(req, res) {
	const newPage = _.capitalize(req.body.newPageInput);
	const page = new List({ name: newPage, items: [ itemsSchema ] });
	List.find({}, function(err, list) {
		const pageName = list.name;
		if (newPage !== pageName) {
			page.save();
			return res.redirect('/' + newPage);
		} else {
			console.log(`${pageName}: this List exists already`);
		}
	});
});

// Delete item
app.post('/delete', function(req, res) {
	console.log('delete route', req.body);
	const checkedItemId = req.body.checkbox;
	console.log('app.delete: checkedItemId', checkedItemId);
	const listName = req.body.listName;
	if (listName === day) {
		Item.findByIdAndRemove(checkedItemId, function(err) {
			if (!err) {
				console.log('Successfully deleted checked item');
				res.redirect('/');
			}
		});
	} else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err) {
			if (!err) {
				res.redirect('/' + listName);
			}
		});
	}
});

// Delete Page List
app.post('/deletePages', function(req, res) {
	const deletedList = req.body.pageName;
	if (deletedList === day) {
		res.redirect('/');
	} else {
		List.find({}, function(err, lists) {
			lists.forEach(function(list) {
				const listName = list.name;
				if (deletedList === listName) {
					List.deleteOne({ name: deletedList }, function(err) {
						console.log(err);
					});
					res.redirect('/');
				} else {
					console.log('Not able to delete List');
				}
			});
		});
	}
});

app.listen(port, function() {
	console.log('Server started on port 3000');
});
