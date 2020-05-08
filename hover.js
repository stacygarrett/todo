const hover = document.querySelector('.hover');
const show = document.querySelector('.show');

module.exports.show = function() {
	exports.show = function() {
		show.hover(function() {
			hover.fadeIn();
		});

		show.hover(
			function() {
				$(this).addClass('show');
			},
			function() {
				$(this).removeClass('show').fadeOut();
			}
		);
	};
};

// module.exports.getDate = function() {
/*     exports.getDate = function() {
        const today = new Date();
        const options = {
            weekday : 'long',
            day     : 'numeric',
            month   : 'long'
        };
        return today.toLocaleDateString('en-US', options);
    };
    
    exports.getDay = function() {
        const today = new Date();
        const options = {
            weekday : 'long'
        };
        return today.toLocaleDateString('en-US', options);
    };
     */
