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

mongoose.connect('mongodb://localhost:27017/todolistDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

/* mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}); */

const itemsSchema = new mongoose.Schema({
	name: { type: String, required: [ 1 ] }
});

const listSchema = new mongoose.Schema({
	name: String,
	items: [ itemsSchema ]
});

const pagesSchema = new mongoose.Schema({
	lists: [ listSchema ]
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);
const Page = mongoose.model('Page', pagesSchema);

const item1 = new Item({ name: 'Welcome to your To-Do List!' });
const item2 = new Item({ name: 'Add a new item with the + button.' });
const item3 = new Item({ name: '<-- Select the box to delete one.' });

const defaultItems = [ item1, item2, item3 ];

// const pages = new Page({ list: list });

const page1 = new Page({ name: 'Today' });
const page2 = new Page({ name: 'Work' });
const page3 = new Page({ name: 'School' });

const defaultPages = [ page1, page2, page3 ];
// const pages = [];
const day = date.getDate();

app.use(express.static('public'));
// app.use(express.static('views'));

app.get('/', function(req, res) {
	// List.find({}, function(err, lists) {
	// lists.forEach(function(list) {
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
			Item.find({}, function(err, foundItems) {
				res.render('list', {
					listTitle: day,
					newListItems: foundItems
				});
			});
		}
		// });
	});
});

/* Page.insertMany(defaultPages, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Successfully added new items to the PagesDB');
	}
}); */

/* app.get('/pages', function(req, res) {
	Page.find({}, function(err, foundPages) {
		// res.render('page', { pageTitle: pageName, newPageList: newPageList });
		if (foundPages.length === 0) {
			Page.insertMany(defaultPages, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('Successfully added new items to the PagesDB');
				}
			});
			res.redirect('/');
		} else {
			Page.find({}, function(err, pages) {
				res.render('pages', {
					pageTitle: pageName,
					newPageList: foundPages
				});
			});
		}
	});
}); */
app.get('/favicon.ico', (req, res) => res.status(204));
app.get('/about', function(req, res) {
	res.render('about');
});

app.get('/:customListName', function(req, res) {
	const customListName = _.capitalize(req.params.customListName);
	List.find({}, function(err, lists) {
		lists.forEach(function(list) {
			console.log('list.name', list.name);
		});
		List.findOne({ name: customListName }, function(err, foundList) {
			if (!err) {
				if (!foundList) {
					const list = new List({
						name: customListName,
						items: defaultItems
						// pages: pagesList
					});
					// foundList.list.push(list);
					list.save();
					res.redirect('/' + customListName);
				} else if (foundList === 'about') {
					res.redirect('/about');
				} else if (foundList === 'Today') {
					res.redirect('/');
				} else {
					res.render('list', {
						listTitle: foundList.name,
						newListItems: foundList.items,
						// newPageList: newPageList
						lists: lists
					});
				}
			}
			// });
		});
	});

	app.post('/', function(req, res) {
		const itemName = req.body.newItem;
		const listName = req.body.list;
		const item = new Item({ name: itemName });
		if (listName === day) {
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

	app.post('/newpage', function(req, res) {
		const newPage = req.body.newPage;
		List.find({}, function(err, lists) {
			console.log(newPage);
			lists.forEach((list) => {
				const pageName = list.name;
				if (newPage === !pageName) {
					res.redirect('/' + newPage);
				}
			});
		});
	});

	// Delete item
	app.post('/delete', function(req, res) {
		// console.log(req.body.checkbox);
		const checkedItemId = req.body.checkbox;
		const listName = req.body.listName;
		if (listName === day) {
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

	// Delete Page List
	app.post('/deletePages', function(req, res) {
		const checkedPagesId = req.body.checkbox;
		const pageName = req.body.pageName;
		// console.log(pageTitle);
		if (pageName) {
			Item.findByIdAndRemove(checkedPagesId, function(err, foundList) {
				if (!err) {
					console.log('Successfully deleted checked item');
					res.redirect('/');
				}
			});
		} else {
			List.findOneAndUpdate({ name: pageName }, { $pull: { items: { _id: checkedPagesId } } }, function(
				err,
				foundList
			) {
				if (!err) {
					res.redirect('/' + pageName);
				}
			});
		}
	});
});

let port = process.env.PORT;
if (port == null || port == '') {
	port = 3000;
}

app.listen(port, function() {
	console.log('Server started on port 3000');
});
