/*global _twentyfifteenCustomizerExports */
/*exported TwentyFifteenCustomizer */

/**
 * Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Customizer preview reload changes asynchronously.
 */
var TwentyFifteenCustomizer = ( function( $ ) {
	var self;

	self = {
		inlineStyleSettings: [],
		nonce: '',
		theme: '',
		debounceDelay: 100
	};
	$.extend( self, _twentyfifteenCustomizerExports );

	// Site title and description.
	wp.customize( 'blogname', function( value ) {
		value.bind( function( to ) {
			$( '.site-title a' ).text( to );
		} );
	} );
	wp.customize( 'blogdescription', function( value ) {
		value.bind( function( to ) {
			$( '.site-description' ).text( to );
		} );
	} );

	// Update inline styles
	self.refreshCss = function () {
		var customized = {};
		$.each( self.inlineStyleSettings, function ( i, name ) {
			customized[ name ] = wp.customize( name ).get();
		});

		wp.ajax.send( 'twentyfifteen_inline_styles', {
			data: {
				wp_customize: 'on',
				customized: JSON.stringify( customized ),
				theme: self.theme,
				nonce: self.nonce
			},
			success: function ( data ) {
				$.each( data.inlineStyles, function ( handle, css ) {
					var id = 'wp-inline-style-' + handle;
					$( '#' + id ).text( css );
				} );

				if ( data.nonce ) {
					self.nonce = data.nonce;
				}
			}
		} );
	};

	self.refreshCss = _.debounce( self.refreshCss, self.debounceDelay );

	$.each( self.inlineStyleSettings, function ( i, setting ) {
		wp.customize( setting, function ( value ) {
			value.bind( self.refreshCss );
		});
	});

	return self;
} )( jQuery );
