function changeColor() {
	var a = document.querySelector('.item');
	a.style.color = 'pink';
}
import Sortable from 'sortablejs/modular/sortable.core.esm.js';

var el = document.querySelectorAll('.item');
// var sortable = Sortable.create(el);

var sortable = new Sortable(el, {
	group: 'name', // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
	sort: true, // sorting inside list
	delay: 0, // time in milliseconds to define when the sorting should start
	delayOnTouchOnly: false, // only delay if user is using touch
	touchStartThreshold: 0, // px, how many pixels the point should move before cancelling a delayed drag event
	disabled: false, // Disables the sortable if set to true.
	store: null, // @see Store
	animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
	easing: 'cubic-bezier(1, 0, 0, 1)', // Easing for animation. Defaults to null. See https://easings.net/ for examples.
	handle: '.my-handle', // Drag handle selector within list items
	filter: '.ignore-elements', // Selectors that do not lead to dragging (String or Function)
	preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
	draggable: '.item' // Specifies which items inside the element should be draggable
});

Sortable.create(sortableList, { sortable });
