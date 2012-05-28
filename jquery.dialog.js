/*!
 * dialog - jQuery Plugin
 * version: 1.0
 * @requires jQuery v1.7 or later
 *
 * Examples at http://tornqvist.github.com/dialog/
 * License: http://tornqvist.mit-license.org
 *
 * Copyright 2012 Carl Törnqvist - http://twitter.com/carltornqvist
 *
 */
(function ($, WIN, DOC) {
	"use strict";

	/*jslint browser: true */
	/*global jQuery, Modernizr, window, document, console */

	// For easy rebranding
	var prefix = 'dialog',

		// Default settings
		defaults = {
			content		: null,				// Specific content to load into dialog
			url			: null,				// Specific url to load into dialog, just like any anchor link
			speed		: 400,				// Animation speed, needs to match that which is set in CSS (only applicable for browsers not supporting transitionend event)
			escape		: true,				// Whether to hijack the escape key to close dialog (only while dialog is visible)
			role		: 'dialog',			// The dialogs' role (recommended: dialog/alertdialog)
			closeText	: 'Dismiss',		// Text in close button
			loadText	: 'Loading',		// Text to show during loading
			label		: prefix + '-label',// Dialog title ID, for accessibility
			appearence	: 'top',			// Direction of dialog animation (accepts: top, bottom, right, left)
			applyClass	: null,				// Custom class to be applied to container (for styling or animation)
			request		: 'GET',			// Request method used (accepts: 'GET', 'POST', object)
			onOpen		: $.noop,			// Function to run just when dialog is created (but empty) and availible in the DOM
			onLoad		: $.noop,			// Function to run when content is loaded and ready
			onClose		: $.noop,			// Function to run when dialog is closed
			animType	: WIN.Modernizr && WIN.Modernizr.csstransitions ? 'css' : 'animate', // Pick animation technique
			visualLoad	: false,			// Whether to show dialog before content is loaded
			center		: true				// Whether to vertically center dialog in window (if there's room)
		},

		// Private methods
		utils = {
			init: function (options) {

				return this.each(function () {

					var $that = $(this),
						settings = $.extend({}, defaults, options, $.data($that[0], prefix));

					$that
						.attr({
							'aria-haspopup'	: 'true',
							role			: 'button'
						})
						.off('click.' + prefix)
						.on('click.' + prefix, function (e) {
							utils.show($that, settings);
							e.preventDefault();
						});
				});
			},
			show: function (anchor, settings) {

				// Save vars for easy reference later on
				var plugin = {
					anchor		: anchor,
					dialog		: $('#' + prefix),
					close		: $('#' + prefix + '-close'),
					container	: $('#' + prefix + '-container'),
					content		: $('#' + prefix + '-content'),
					settings	: settings
				};

				// If there's no container already, create one
				if (!plugin.container.length) {
					plugin.container = utils.build('container', plugin)
						.appendTo($('body'))
						.on('click', function (event) {
							if ($(event.target).is(plugin.container)) {
								$[prefix]('close');
							}
						});
				} else {
					plugin.container.css('height', utils.calc('space', plugin, 'content'));
				}

				// If there's no dialog already, create one
				if (!plugin.dialog.length) {
					plugin.dialog = utils.build('dialog', plugin)
						.appendTo(plugin.container)
						.append(
							plugin.close = utils.build('close', plugin)
								.on('click.' + prefix, function () {
									$[prefix]('close');
								})
						);
				} else {
					plugin.dialog
						.attr('aria-busy', 'true')
						.addClass('loading');
					plugin.close.text(plugin.settings.closeText);
				}

				// If there's no content-box already, create one
				if (!plugin.content.length) {
					plugin.content = utils.build('content', plugin).prependTo(plugin.dialog);
				} else {
					plugin.content.empty().text(plugin.settings.loadText);
				}
				plugin.settings.onOpen(plugin);

				// If loading is to be done on-screen, show dialog
				if (plugin.settings.visualLoad) {
					utils.animate('reveal', plugin, 'dialog');
				}

				// Actions to take on load
				plugin.dialog.on(prefix + '_load', function () {

					// Indicate on anchor that dialog finished loading
					plugin.anchor.removeClass('loading');

					// If loading was done off-screen,
					// show now that content is loaded
					if (!plugin.settings.visualLoad) {
						utils.animate('reveal', plugin, 'dialog', function () {

							// Set focus to first interactive element for accessibility
							plugin.dialog
								.attr('aria-busy', 'false')
								.find('a,input,button,select,textarea,[tabindex]')
								.first()
								.focus();
						});
					}

					var t;
					$(WIN).on('scroll.' + prefix + ' resize.' + prefix, function (event) {

						// Use timeout to try and make the animation run only after scrolling/resizing is done
						clearTimeout(t);
						t = setTimeout(function () {
							// Set some variables for reference
							var scroll = $(WIN).scrollTop(),
								offset = plugin.dialog.offset().top,
								height = plugin.dialog.outerHeight(true),
								width = plugin.dialog.outerHeight(true),
								winHeight = utils.calc('height'),
								winWidth = utils.calc('width');

							plugin.container.css('height', utils.calc('space', plugin, 'content'));

							// Detect if dialog is out of view and adjust accordingly
							if ((scroll <= offset || (height < winHeight && scroll > offset)) && scroll > -1) {
								utils.animate('align', plugin, 'dialog');
							} else if (((scroll +  winHeight) > (offset + height)) && (height > winHeight) && scroll > -1) {
								utils.animate(scroll - (height - winHeight), plugin, 'dialog');
							}

						}, 100);
					});

					// Trigger load function as declared in settings
					plugin.settings.onLoad(plugin);

				});

				// Initiate loading of content
				utils.load(plugin.settings.url || anchor.attr('href'), plugin);

				// Attach listener for close event
				plugin.dialog.on(prefix + '_close', function () {

					// Trigger close function as declared in settings
					plugin.settings.onClose(plugin);

					// Remove listeners for a clean start next time
					plugin.dialog.off(prefix + '_load ' + prefix + '_close');
				});

				// If close with escape option
				if (plugin.settings.escape) {

					$(DOC).on('keydown.' + prefix, function (e) {

						// Store key code
						var key_code = e.keyCode || e.which;

						// If escape
						if (key_code === 27) {
							$[prefix]('close');
						}
					});
				}

				// Finally append all info to the element for later reference
				$.data(plugin.dialog[0], prefix, plugin);
			},
			load: function (url, plugin) {

				// Throw error if URL and content is missing
				if (!url && !plugin.settings.content) {
					$.error(prefix + '-error: Niether URL nor content was defined');
					return;
				}

				// Indicate on anchor that dialog is loading
				plugin.anchor.addClass('loading');

				// Set dialog label for accessibility
				function setLabel(html) {

					var pattern = 'h1,h2,h3,h4,h5,h6,legend,label,p',
						$label = $(html).is(pattern) ? $(html) : $(html).find(pattern).first();

					$label.attr('id', $label.attr('id') ? plugin.settings.label = $label.attr('id') : plugin.settings.label);

					plugin.dialog.attr('aria-labelledby', plugin.settings.label);

					return $(html).is(pattern) ? $label : $(html).length ? $(html) : html;
				}

				// If content was defined by settings
				if (plugin.settings.content) {
					plugin.content
						.html(setLabel(
							plugin.settings.content
						));
					plugin.dialog
						.removeClass('loading')
						.triggerHandler(prefix + '_load');


				// If url doesn't start w/ a hash, it's external
				} else if (url.substr(0, 1) !== '#') {

					// Format url for .load function
					url = url.indexOf('#') > 0 ? (url.split('#')[0] + ' ' + '#' + url.split('#')[1]) : url;

					// Load function interprets an object as 'POST' method
					if (plugin.settings.request === 'POST') {
						plugin.settings.request = {};
					}

					// .load content
					plugin.content.load(url, plugin.settings.request, function (data) {
						setLabel(plugin.content.show());
						plugin.dialog
							.removeClass('loading')
							.triggerHandler(prefix + '_load');
					});

				// If element is found in the document, clone it
				} else if ($(url).length) {
					plugin.content
						.html(setLabel(
							$(url).clone(true).show()
						));
					plugin.dialog
						.removeClass('loading')
						.triggerHandler(prefix + '_load');

				// Else, throw error message
				} else {
					$.error(prefix + '-error: Invalid reference, element could not be found in document. Check you URL and ' + prefix + ' settings');
					return;
				}
			},
			animate: function (animation, plugin, node, callback) {

				switch (animation) {

				case 'show':
					plugin[node].show(function () {
						plugin[node].addClass('show');
						if ($.type(callback) === 'function') {
							callback();
						}
					});
					break;

				case 'hide':
					plugin[node].removeClass('show');
					utils.when_done(plugin[node], plugin.settings, function () {
						plugin[node].hide();
						if ($.type(callback) === 'function') {
							callback();
						}
					});
					break;

				case 'align':
					plugin[node].show(function () {
						var top,
							scroll = $(WIN).scrollTop(),
							nodeHeight = plugin[node].outerHeight(true),
							winHeight = utils.calc('height');

						plugin.container.css('height', utils.calc('space', plugin, 'content'));

						if ((nodeHeight < winHeight) && plugin.settings.center) {
							top	= scroll + ((winHeight - nodeHeight) / 2);
						} else {
							top = scroll;
						}

						plugin[node]
							.addClass('show')[plugin.settings.animType]({
								top: top,
								left: 0
							}, plugin.settings.speed);

						utils.when_done(plugin[node], plugin.settings, function () {
							if ($.type(callback) === 'function') {
								callback();
							}
						});
					});
					break;

				case 'slideOut':
					plugin[node][plugin.settings.animType](
						utils.calc('appearence', plugin, node),
						plugin.settings.speed
					).addClass('hiding');

					utils.when_done(plugin[node], plugin.settings, function () {
						plugin[node]
							.removeClass('show hiding')
							.hide();
						plugin.content.empty();
						plugin[node].attr('aria-hidden', 'true');
						if ($.type(callback) === 'function') {
							callback();
						}
					});
					break;

				case 'reveal':
					plugin.container.attr('class', plugin.settings.applyClass);
					utils.animate('show', plugin, 'container');
					plugin[node].css(utils.calc('appearence', plugin, node));
					utils.animate('align', plugin, 'dialog', callback);
					plugin.dialog.attr('aria-hidden', 'false');
					break;

				default:
					plugin[node][plugin.settings.animType]({
						top: animation
					}, plugin.settings.speed);

					utils.when_done(plugin[node], plugin.settings, function () {
						if ($.type(callback) === 'function') {
							callback();
						}
					});
				}
			},
			calc: function (label, plugin, node) {
				var pos, scroll, centerOrNot, winHeight,
					docHeight = $(DOC).height(),
					nodeHeight = !!plugin ? plugin[node].outerHeight(true) : null;

				switch (label) {

				// return window.inner_width for those who support it - needed for iphone
				// if its undefined - return $(window).width() - good for all desktop browsers
				case 'width':
					return WIN.innerWidth || $(WIN).width();

				// return window.inner_height for those who support it - needed for iphone
				// if its undefined - return $(window).height() - good for all desktop browsers
				case 'height':
					return WIN.innerHeight || $(WIN).height();

				case 'space':
					return nodeHeight > docHeight ? 'auto' : docHeight;

				case 'appearence':
					pos = {};
					winHeight = utils.calc('height');
					scroll = $(WIN).scrollTop();
					centerOrNot = function () {
						if ((nodeHeight < winHeight) && plugin.settings.center) {
							return scroll + ((winHeight - nodeHeight) / 2);
						} else {
							return scroll;
						}
					};

					switch (plugin.settings.appearence) {

					case 'top':
						pos.left = 0;
						pos.top = scroll - nodeHeight;
						break;

					case 'bottom':
						pos.left = 0;
						pos.top = scroll + winHeight;
						break;

					case 'left':
						pos.left = '-100%';
						pos.top = centerOrNot();
						break;

					case 'right':
						pos.left = '100%';
						pos.top = centerOrNot();
						break;

					default:
						pos.left = 0;
						pos.top = centerOrNot();
					}

					return pos;
				}
			},
			build: function (req, plugin) {

				switch (req) {

				case 'close':
					return $('<button />', {
						'id'			: prefix + '-close',
						'text'			: plugin.settings.closeText,
						'role'			: 'button',
						'aria-controls'	: prefix
					});

				case 'container':
					return $('<div />', {
						'id'	: prefix + '-container',
						'class' : plugin.settings.applyClass
					});

				case 'dialog':
					return $('<div />', {
						'id'		: prefix,
						'class'		: 'loading',
						'css'		: {
							left	: $(DOC).width() * -1,
							top		: $(DOC).height() * -1
						},
						'role'		: plugin.settings.role,
						'aria-busy'	: 'true',
						'aria-live'	: 'assertive'
					});

				case 'content':
					return $('<div />', {
						'id'	: prefix + '-content',
						'text'	: plugin.settings.loadText
					});
				}
			},
			when_done: function ($el, settings, callback) {
				var transitionend,
					vendors = ['webkit', 'ms', 'o', ''];

				$.each(vendors, function (i, val) {
					if (WIN.hasOwnProperty && WIN.hasOwnProperty('on' + val + 'transitionend')) {
						transitionend = ((val) ? val + "T" : "t") + "ransitionEnd";
					}
				});

				// Replace self once we have figured out what method to use
				utils.when_done = function ($el, settings, callback) {

					if (transitionend && settings.animType === 'css') {
						$el.one(transitionend, callback);
					} else {
						WIN.setTimeout(callback, settings.speed);
					}
				};

				utils.when_done($el, settings, callback);
			}
		},
		// Public methods
		methods = {
			close: function () {
				utils.animate('hide', $.data($('#' + prefix)[0], prefix), 'container');
				utils.animate('slideOut', $.data($('#' + prefix)[0], prefix), 'dialog');
				$(WIN).off('scroll.' + prefix);

				$('#' + prefix).triggerHandler(prefix + '_close');

				// If close with escape option
				if ($.data($('#' + prefix)[0], prefix).settings.escape) {
					$(DOC).off('keydown.' + prefix);
				}
			},
			align: function () {
				utils.animate('align', $.data($('#' + prefix)[0], prefix), 'dialog');
			},
			destroy: function () {
				$('#' + prefix + '-container').remove();

				// If close with escape option
				if ($.data($('#' + prefix)[0], prefix).settings.escape) {
					$(DOC).off('keydown.' + prefix);
				}
			},
			settings: function (settings) {
				var before = $.data($('#' + prefix)[0], prefix).settings;
				$.data($('#' + prefix)[0], prefix).settings = $.extend({}, before, settings);
			}
		};

	$.fn[prefix] = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ($.type(method) === 'object' || !method) {
			return utils.init.apply(this, arguments);
		} else {
			$.error(prefix + '-error: Method ' +  method + ' does not exist on jQuery.' + prefix);
		}
	};

	$[prefix] = function (method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ($.type(method) === 'object' || !method) {
			utils.show($('body'), $.extend({}, defaults, method));
		} else {
			$.error(prefix + '-error: Method ' +  method + ' does not exist on jQuery.' + prefix);
		}
	};

}(jQuery, window, document));