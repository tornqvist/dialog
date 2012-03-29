# jQuery dialog
A responsive, accessible dialog plugin for presenting information and prompting for user action.

## Recommended usage
```html
	<a href="ajax.html#bar" title="Important message">Read my important message</a>
```
```javascript
	$('a').dialog();
```

### Specific content
```javascript
$.dialog({
	content: 'Some important message'
});
```

### Specific url
```javascript
$.dialog({
	url: 'ajax.html'
});
```

### Inline content
```javascript
$.dialog({
	url: '#foo'
});
```

### Default options
```javascript
content		: null,				// Specific content to load into dialog
url			: null,				// Specific url to load into dialog, just like any anchor link
speed		: 400,				// Animation speed, needs to match that which is set in CSS
escape		: true,				// Whether to hijack the escape key to close dialog (only while dialog is visible)
role		: 'dialog',			// The dialogs' role (recommended: dialog/alertdialog)
closeText	: 'Dismiss',		// Text in close button
loadText	: 'Loading',		// Text to show during loading
label		: prefix + '-label',// Dialog title ID, for accessibility
appearence	: 'top',			// Direction of dialog animation (accepts: top, bottom, right, left)
applyClass	: null,				// Custom class to be applied to container (for styling or animation)
onOpen		: $.noop,			// Function to run just when dialog is created (but empty) and availible in the DOM
onLoad		: $.noop,			// Function to run when content is loaded and ready
onClose		: $.noop,			// Function to run when dialog is closed
animType	: Modernizr && Modernizr.csstransitions ? 'css' : 'animate', // Pick animation technique
visualLoad	: false,			// Whether to show dialog before content is loaded
center		: true				// Whether to vertically center dialog in window (if there's room)
```

## Depedencies
jQuery 1.7