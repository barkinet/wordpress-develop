/* global wp */
jQuery( function( $ ) {

	var api = wp.customize,
        settings = window._wpCustomizeNavMenusSettings,
        navMenu = window.wpNavMenu,
        customizeSettings = window._wpCustomizeSettings;
        
	module( 'Customize Nav Menus', {
		setup: function() {
            window._wpCustomizeNavMenusSettings = settings; 
            window.wpNavMenu = navMenu;
            wp.customize.trigger( 'ready' );
		},
		teardown: function() {
			// restore defaults
            window._wpCustomizeNavMenusSettings = {}; 
            window.wpNavMenu = {};
            window._wpCustomizeSettings = customizeSettings;
        
		}
	});


	/**
	 * Generate 20 ids and verify they are all unique.
	 */
	test( 'generatePlaceholderAutoIncrementId generates unique IDs', function() {
		var testIterations = 20,
			ids = [ api.Menus.generatePlaceholderAutoIncrementId() ];

		while( testIterations-- > 0 ) {
			var placeholderID = api.Menus.generatePlaceholderAutoIncrementId();


			ok( -1 === ids.indexOf( placeholderID ) );
			ids.push( placeholderID );
		}

	} );

	test( 'it should parse _wpCustomizeMenusSettings.defaults into itself', function() {
		deepEqual( window._wpCustomizeNavMenusSettings, api.Menus.data );
	});

    test( 'empty menus should have no Menu Item Controls', function() {
        equal( $.isEmptyObject( wp.customize.Menus.getMenuControl( "2" ).getMenuItemControls() ) , true, 'empty menus' );
    });


});
