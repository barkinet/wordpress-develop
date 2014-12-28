(function( exports, $ ){
	var api = wp.customize,
		debounce;

	/**
	 * Returns a debounced version of the function.
	 *
	 * @todo Require Underscore.js for this file and retire this.
	 */
	debounce = function( fn, delay, context ) {
		var timeout;
		return function() {
			var args = arguments;

			context = context || this;

			clearTimeout( timeout );
			timeout = setTimeout( function() {
				timeout = null;
				fn.apply( context, args );
			}, delay );
		};
	};

	/**
	 * @constructor
	 * @augments wp.customize.Messenger
	 * @augments wp.customize.Class
	 * @mixes wp.customize.Events
	 */
	api.Preview = api.Messenger.extend({
		/**
		 * Requires params:
		 *  - url    - the URL of preview frame
		 */
		initialize: function( params, options ) {
			var self = this;

			api.Messenger.prototype.initialize.call( this, params, options );

			// TODO: self.send( 'url', wp.customize.settings.requestUri );

			this.body = $( document.body );

			// Limit the URL to internal, front-end links.
			//
			// If the frontend and the admin are served from the same domain, load the
			// preview over ssl if the Customizer is being loaded over ssl. This avoids
			// insecure content warnings. This is not attempted if the admin and frontend
			// are on different domains to avoid the case where the frontend doesn't have
			// ssl certs.
			this.body.on( 'click.preview', 'a', function( event ) {
				var result, to = $( this ).prop( 'href' );

				// @todo Instead of preventDefault and bailing, should we instead show an AYS/confirm dialog?

				// Check for URLs that include "/wp-admin/" or end in "/wp-admin".
				// Strip hashes and query strings before testing.
				if ( /\/wp-admin(\/|$)/.test( to.replace( /[#?].*$/, '' ) ) ) {
					event.preventDefault();
					return;
				}

				// Attempt to match the URL to the control frame's scheme
				// and check if it's allowed. If not, try the original URL.
				$.each([ to.replace( /^https?/, self.scheme() ), to ], function( i, url ) {
					$.each( self.allowedUrls, function( i, allowed ) {
						var path;

						allowed = allowed.replace( /\/+$/, '' );
						path = url.replace( allowed, '' );

						if ( 0 === url.indexOf( allowed ) && /^([/#?]|$)/.test( path ) ) {
							result = url;
							return false;
						}
					});
					if ( result ) {
						return false;
					}
				});

				// If we found a matching result, return it. If not, bail.
				if ( ! result ) {
					event.preventDefault();
				}
			});

			this.body.on( 'submit.preview', 'form', function( event ) {
				// @todo If this.action is going to another domain, then we should abort.
				// @todo: inject form fields for persistent Customizer query vars before submission
			});

			// @todo: hook into jQuery's Ajax beforeSend to inject the persistent query vars

			this.window = $( window );
		}
	});

	$( function() {
		api.settings = window._wpCustomizeSettings;
		if ( ! api.settings )
			return;

		var bg;

		api.preview = new api.Preview({
			url: window.location.href,
			channel: api.settings.channel
		});

		if ( api.settings.error ) {
			api.preview.send( 'error', api.settings.error );
			return;
		}

		api.preview.bind( 'settings', function( values ) {
			$.each( values, function( id, value ) {
				if ( api.has( id ) )
					api( id ).set( value );
				else
					api.create( id, value );
			});
		});

		api.preview.trigger( 'settings', api.settings.values );

		api.preview.bind( 'setting', function( args ) {
			var value;

			args = args.slice();

			if ( value = api( args.shift() ) )
				value.set.apply( value, args );
		});

		api.preview.bind( 'sync', function( events ) {
			$.each( events, function( event, args ) {
				api.preview.trigger( event, args );
			});
			api.preview.send( 'synced' );
		});

		api.preview.bind( 'active', function() {
			if ( api.settings.nonce ) {
				api.preview.send( 'nonce', api.settings.nonce );
			}

			api.preview.send( 'documentTitle', document.title );
		});

		api.preview.send( 'ready', {
			activePanels: api.settings.activePanels,
			activeSections: api.settings.activeSections,
			activeControls: api.settings.activeControls
		} );

		api.preview.bind( 'reload', function () {
			window.location.reload( true );
		});

		/* Custom Backgrounds */
		bg = $.map(['color', 'image', 'position_x', 'repeat', 'attachment'], function( prop ) {
			return 'background_' + prop;
		});

		api.when.apply( api, bg ).done( function( color, image, position_x, repeat, attachment ) {
			var body = $(document.body),
				head = $('head'),
				style = $('#custom-background-css'),
				update;

			update = function() {
				var css = '';

				// The body will support custom backgrounds if either
				// the color or image are set.
				//
				// See get_body_class() in /wp-includes/post-template.php
				body.toggleClass( 'custom-background', !! ( color() || image() ) );

				if ( color() )
					css += 'background-color: ' + color() + ';';

				if ( image() ) {
					css += 'background-image: url("' + image() + '");';
					css += 'background-position: top ' + position_x() + ';';
					css += 'background-repeat: ' + repeat() + ';';
					css += 'background-attachment: ' + attachment() + ';';
				}

				// Refresh the stylesheet by removing and recreating it.
				style.remove();
				style = $('<style type="text/css" id="custom-background-css">body.custom-background { ' + css + ' }</style>').appendTo( head );
			};

			$.each( arguments, function() {
				this.bind( update );
			});
		});

		api.trigger( 'preview-ready' );
	});

})( wp, jQuery );
