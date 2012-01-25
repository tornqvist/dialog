describe('The dialog in its\' simplest form',function(){

	beforeEach(function(){
		loadFixtures('fixture.html');
	});

	it('is defined',function(){
		expect(typeof $.dialog).toBe('function');
	});

	it('throws an error when a bogus method is called',function(){

		expect(function(){
			$.dialog('bogus_method');
		}).toThrow('dialog-error: Method bogus_method does not exist on jQuery.dialog');
	});

	it('can be initiated on it self',function(){

		this.after(function() { $.dialog('destroy'); });

		$.dialog({
			content: 'Test'
		});

		expect($('#dialog')).toExist();
	});

	it('supports custom text for the close button',function(){

		this.after(function() { $.dialog('destroy'); });

		var custom = 'Some custom text';

		$.dialog({
			content		: 'Test',
			closeText	: custom
		});

		expect($('#dialog-close')).toHaveText(custom);
	});

	it('supports custom loading text',function(){

		this.after(function() { $.dialog('destroy'); });

		var custom = 'Some custom text',
			found;

		$.dialog({
			content		: 'Test',
			loadText	: custom,
			onOpen		: function(){
							found = $('#dialog-content').text();
			}
		});

		expect(found).toBe(custom);
	});

	it('has the content handed to it',function(){

		$.dialog({
			content: 'Test'
		});

		expect($('#dialog-content')).toHaveText('Test');
	});

	it('can accept some new content',function(){

		this.after(function() { $.dialog('destroy'); });

		if( !$('#dialog-container').length ){
			$.dialog({
				content: 'Test'
			});
		}

		$.dialog({ url: '../ajax.html#header' });

		waits(200);

		runs(function(){
			expect($('#dialog-content')).toHaveHtml('<h1 id="header">Test header</h1>');
		});
	});

	it('can accept new settings and apply it to currently visible dialog',function(){

		this.after(function() { $.dialog('destroy'); });

		$.dialog({
			content: 'Test',
			appearence: 'right'
		});

		$.dialog('settings',{ appearence: 'left' });

		expect($('#dialog').data('dialog').settings.appearence).toBe('left');

	});

	it('can apply a custom class to the container',function(){

		this.after(function() { $.dialog('destroy'); });

		$.dialog({
			content		: 'Test',
			applyClass	: 'test'
		});

		expect($('#dialog-container')).toBe($('.test'));
	});

	it('calls the onOpen callback function',function(){

		this.after(function() { $.dialog('destroy'); });

		var test;

		$.dialog({
			content	: 'Test',
			onOpen	: function(){
				test = 'test';
			}
		});

		expect(test).toBe('test');
	});

	it('calls the onLoad callback function',function(){

		this.after(function() { $.dialog('destroy'); });

		var test;

		$.dialog({
			content	: 'Test',
			onLoad	: function(){
				test = 'test';
			}
		});

		expect(test).toBe('test');
	});

	it('calls the onClose callback function',function(){

		this.after(function() { $.dialog('destroy'); });

		var test;

		$.dialog({
			content	: 'Test',
			onClose	: function(){
				test = 'test';
			}
		});

		$.dialog('close');

		expect(test).toBe('test');
	});

	it('is still there when closed',function(){

		this.after(function() { $.dialog('destroy'); });

		$.dialog({
			content: 'Test'
		});

		$.dialog('close');

		expect($('#dialog-content')).toExist();
	});

	it('is empty when closed',function(){

		this.after(function() { $.dialog('destroy'); });

		$.dialog({
			content: 'Test'
		});

		$.dialog('close');

		waits($('#dialog').data('dialog').settings.speed);

		runs(function(){
			expect($('#dialog-content')).toBeEmpty();
		});
	});

	it('is gone when destroyed',function(){

		$.dialog({
			content: 'Test'
		});

		$.dialog('destroy');

		expect($('#dialog-container').length).toBe(0);
	});
});

describe('When the user',function(){

	jasmine.getFixtures().fixturesPath = 'lib';

	beforeEach(function(){
		loadFixtures('fixture.html');
		$('#foo').dialog().click();
	});

	afterEach(function(){
		$.dialog('destroy');
	});

	it('clicks the anchor, a dialog is created',function(){

		expect($('#dialog')).toExist();
	});

	it('is presented with a dialog, the first interactive element has focus',function(){

		var $first = $('#dialog').find('a,input,button,select,textarea,[tabindex]').first();

		waits(1000);

		runs(function(){
			expect($first.is(':focus')).toBeTruthy();
		});
	});

	it('wants to dissmiss the dialog, a close button is present',function(){

		expect($('#dialog-close').length).toBeTruthy();
	});

	it('clicks the close button, the dialog is closed',function(){

		runs(function(){
			$('#dialog-close').click();
		});

		waits($('#dialog').data('dialog').settings.speed);

		runs(function(){
			expect($('#dialog')).toBeHidden();
		});
	});

	it('clicks the background, the dialog is closed',function(){

		runs(function(){
			$('#foo').click();

			$('#dialog-container').click();
		});

		waits($('#dialog').data('dialog').settings.speed);

		runs(function(){
			expect($('#dialog')).toBeHidden();
		});
	});
});

describe('For accessibility reasons',function(){

	jasmine.getFixtures().fixturesPath = 'lib';

	beforeEach(function(){
		loadFixtures('fixture.html');
		$('#foo').dialog().click();
	});

	afterEach(function(){
		$.dialog('destroy');
	});

	it('the anchor has the role of "button"',function(){

		expect($('#foo')).toHaveAttr('role', 'button');

	});

	it('the anchor caries the information that it has a pop up',function(){

		expect($('#foo')).toHaveAttr('aria-haspopup', 'true');

	});

	it('the dialog (by default) caries the information that it has the role of "dialog"',function(){

		expect($('#dialog')).toHaveAttr('role','dialog');
	});

	it('the dialog has a title',function(){

		var pattern = 'h1,h2,h3,h4,h5,h6,legend,label,p';

		waits(0); // IE7 is kinda slow and needs some time to get around to things

		runs(function(){

			expect($('#dialog')).toHaveAttr('aria-labelledby', $('#dialog').find(pattern).first().attr('id') );
		});
	});

	it('the close button caries the information that it controls the dialog',function(){

		expect($('#dialog-close')).toHaveAttr('aria-controls',$('#dialog').attr('id'));
	});

	it('the close button has the role of "button"',function(){

		expect($('#dialog-close')).toHaveAttr('role','button');
	});

	it('when closed, the dialog is marked as hidden',function(){

		$.dialog('close');

		waits($('#dialog').data('dialog').settings.speed);

		runs(function(){
			expect($('#dialog')).toHaveAttr('aria-hidden','true');
		});
	});
});







