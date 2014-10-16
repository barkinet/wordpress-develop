/* global colorScheme */
/**
 * Customizer enhancements for a better user experience.
 *
 * Adds listener to Color Scheme control to update other color controls with new values/defaults
 */

( function( customize ) {
	customize.controlConstructor.colorScheme = customize.Control.extend( {
		ready: function() {

			this.setting.bind( 'change', function( value ) {
				// if Header Text is not hidden, update value
				if ( 'blank' !== customize( 'header_textcolor' ).get() ) {
					customize( 'header_textcolor' ).set( colorScheme[value].colors[4] );
					customize.control( 'header_textcolor' ).container.find( '.color-picker-hex' )
						.data( 'data-default-color', colorScheme[value].colors[4] )
						.wpColorPicker( 'defaultColor', colorScheme[value].colors[4] );
				}

				// update Background Color
				customize( 'background_color' ).set( colorScheme[value].colors[0] );
				customize.control( 'background_color' ).container.find( '.color-picker-hex' )
					.data( 'data-default-color', colorScheme[value].colors[0] )
					.wpColorPicker( 'defaultColor', colorScheme[value].colors[0] );

				// update Header/Sidebar Background Color
				customize( 'header_background_color' ).set( colorScheme[value].colors[1] );
				customize.control( 'header_background_color' ).container.find( '.color-picker-hex' )
					.data( 'data-default-color', colorScheme[value].colors[1] )
					.wpColorPicker( 'defaultColor', colorScheme[value].colors[1] );

				// update Sidebar Text Color
				customize( 'sidebar_textcolor' ).set( colorScheme[value].colors[4] );
				customize.control( 'sidebar_textcolor' ).container.find( '.color-picker-hex' )
					.data( 'data-default-color', colorScheme[value].colors[4] )
					.wpColorPicker( 'defaultColor', colorScheme[value].colors[4] );
			} );
		}
	} );
} )( this.wp.customize );
