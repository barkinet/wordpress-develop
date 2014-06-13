( function( $ ){

	$( document ).ready( function () {

		// Expand/Collapse on click
		$( 'body' ).on( 'click keydown', '.accordion-section-title', function( e ) {
			if ( e.type === 'keydown' && 13 !== e.which ) // "return" key
					return;
			e.preventDefault(); // Keep this AFTER the key filter above

			accordionSwitch( $( this ) );
		});

		// Back to top-level of pages
		$( '.accordion-container' ).on( 'click keydown', '.control-page-back', function( e ) {
			if ( e.type === 'keydown' && 13 !== e.which ) // "return" key
					return;
			e.preventDefault(); // Keep this AFTER the key filter above

			pageSwitch( $( this ) );
		});

		// Re-initialize accordion when screen options are toggled
		$( '.hide-postbox-tog' ).click( function () {
			accordionInit();
		});

	});

	var accordionOptions = $( '.accordion-container li.accordion-section' ),
		sectionContent   = $( '.accordion-section-content' );

	function accordionInit () {
		// Rounded corners
		accordionOptions.removeClass( 'top bottom' );
		accordionOptions.filter( ':visible' ).first().addClass( 'top' );
		accordionOptions.filter( ':visible' ).last().addClass( 'bottom' ).find( sectionContent ).addClass( 'bottom' );
	}

	function accordionSwitch ( el ) {
		var section = el.closest( '.accordion-section' ),
			siblings = section.closest( '.accordion-container' ).find( '.open' ),
			content = section.find( sectionContent );

		if ( section.hasClass( 'cannot-expand' ) )
			return;

		if ( section.hasClass( 'control-page' ) ) {
			pageSwitch( section );
			return;
		}

		if ( 0 == content.length ) {
			return;
		}

		if ( section.hasClass( 'open' ) ) {
			section.toggleClass( 'open' );
			content.toggle( true ).slideToggle( 150 );
		} else {
			siblings.removeClass( 'open' );
			siblings.find( sectionContent ).show().slideUp( 150 );
			content.toggle( false ).slideToggle( 150 );
			section.toggleClass( 'open' );
		}

		accordionInit();
	}

	function pageSwitch( page ) {
		var section = page.closest( '.accordion-section' ),
			container = section.closest( '.wp-full-overlay' );
			siblings = container.find( '.accordion-section.open' );
			content = section.find( '.control-page-content' );

		if ( section.hasClass( 'current-page' ) ) {
			section.toggleClass( 'current-page' );
			container.toggleClass( 'in-page' );
			content.hide();
		} else {
			siblings.removeClass( 'open' );
			content.show( 0, function() {
				section.toggleClass( 'current-page' );
				container.toggleClass( 'in-page' );
			} );
		}
	}

	// Initialize the accordion (currently just corner fixes)
	accordionInit();

})(jQuery);
