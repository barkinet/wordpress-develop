/*global wp, _, jQuery */
(function( exports, $ ){
	var api = wp.customize;

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
			this.nonce = params.nonce;
			this.theme = params.theme;
			this.transactionUuid = params.transactionUuid;
			this.allowedUrls = params.allowedUrls;

			this.add( 'scheme', this.origin() ).link( this.origin ).setter( function( to ) {
				var match = to.match( /^https?/ );
				return match ? match[0] : '';
			});

			// TODO: self.send( 'url', wp.customize.settings.requestUri );

			this.body = $( document.body );

			/*
			 * Limit the URL to internal, front-end links.
			 *
			 * If the frontend and the admin are served from the same domain, load the
			 * preview over ssl if the Customizer is being loaded over ssl. This avoids
			 * insecure content warnings. This is not attempted if the admin and frontend
			 * are on different domains to avoid the case where the frontend doesn't have
			 * ssl certs.
			 */
			this.body.on( 'click.preview', 'a', function( event ) {
				var to = $( this ).prop( 'href' );

				// @todo Instead of preventDefault and bailing, should we instead show an AYS/confirm dialog?

				if ( ! self.isAllowedUrl( to ) ) {
					event.preventDefault();
				}
			});

			$( 'form[action], a[href]' ).each( function () {
				var url, el = $( this );
				url = el.prop( 'href' ) || el.prop( 'action' );
				if ( url && ! self.isAllowedUrl( url ) ) {
					el.addClass( 'customize-preview-not-allowed' );
					el.prop( 'title', api.settings.l10n.previewNotAllowed );
				}
			});

			this.body.on( 'submit.preview', 'form', function( event ) {
				var form = $( this );
				if ( ! self.isAllowedUrl( this.action ) ) {
					event.preventDefault();
					return;
				}

				// Inject the needed query parameters into the form
				_.each( self.getPersistentQueryVars(), function ( value, name ) {
					var input;
					if ( ! form[ name ] ) {
						input = $( '<input>', { type: 'hidden', name: name, value: value } );
						form.append( input );
					}
				});
			});

			// Inject persistent query vars into the Ajax request data
			$.ajaxPrefilter( function ( options ) {
				var a, query;
				a = $( '<a>', { href: options.url } );
				if ( self.isAllowedUrl( a.prop( 'href' ) ) && 'javascript' !== a.prop( 'protocol' ) ) {
					query = a.prop( 'search' );
					if ( query && '?' !== query ) {
						query += '&';
					}
					query += $.param( self.getPersistentQueryVars() );
					a.prop( 'search', query );
					options.url = a.prop( 'href' );
				}
			} );

			this.window = $( window );
		},

		/**
		 * Return whether the supplied URL is among those allowed to be previewed.
		 *
		 * @since 4.2.0
		 *
		 * @param {string} url
		 * @returns {boolean}
		 */
		isAllowedUrl: function ( url ) {
			var self = this, result;
			// @todo Instead of preventDefault and bailing, should we instead show an AYS/confirm dialog?

			if ( /^javascript:/i.test( url ) ) {
				return true;
			}

			// Check for URLs that include "/wp-admin/" or end in "/wp-admin", or which are for /wp-login.php
			// Strip hashes and query strings before testing.
			if ( /\/wp-admin(\/(?!admin-ajax\.php)|$)|\/wp-login\.php/.test( url.replace( /[#?].*$/, '' ) ) ) {
				return false;
			}

			// Attempt to match the URL to the control frame's scheme
			// and check if it's allowed. If not, try the original URL.
			$.each([ url.replace( /^https?/, self.scheme() ), url ], function( i, url ) {
				$.each( self.allowedUrls, function( i, allowed ) {
					var path;

					allowed = allowed.replace( /#.*$/, '' ); // Remove hash
					allowed = allowed.replace( /\?.*$/, '' ); // Remove query
					allowed = allowed.replace( /\/+$/, '' ); // Untrailing-slash
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

			return !! result;
		},

		/**
		 * Get the query params that need to be included with each preview request.
		 *
		 * @returns {{wp_customize: string, theme: string, customize_messenger_channel: string}}
		 */
		getPersistentQueryVars: function () {
			return {
				'wp_customize': 'on',
				'theme': this.theme,
				'customize_messenger_channel': this.channel(),
				'customize_transaction_uuid': this.transactionUuid
			};
		}
	});

	$( function() {
		// @todo DOM Ready may be too late to intercept Ajax initial requests
		api.settings = window._wpCustomizeSettings;
		if ( ! api.settings ) {
			return;
		}

		var bg;

		api.preview = new api.Preview({
			url: window.location.href,
			channel: api.settings.channel,
			theme: api.settings.theme,
			allowedUrls: api.settings.url.allowed,
			transactionUuid: api.settings.transaction.uuid
		});
		if ( api.settings.error ) {
			api.preview.send( 'error', api.settings.error );
			return;
		}

		api.preview.bind( 'settings', function( values ) {
			$.each( values, function( id, value ) {
				if ( api.has( id ) ) {
					api( id ).set( value );
				} else {
					api.create( id, value );
				}
			});
		});

		api.preview.trigger( 'settings', api.settings.values );

		api.preview.bind( 'setting', function( args ) {
			var value;

			args = args.slice();

			if ( value = api( args.shift() ) ) {
				value.set.apply( value, args );
			}
		});

		api.preview.bind( 'sync', function( events ) {
			$.each( events, function( event, args ) {
				api.preview.trigger( event, args );
			});
			api.preview.send( 'synced' );
		});

		api.preview.bind( 'active', function() {
			api.preview.send( 'nonce', api.settings.nonce );
			api.preview.send( 'documentTitle', document.title );
		});

		api.preview.send( 'ready', {
			activePanels: api.settings.activePanels,
			activeSections: api.settings.activeSections,
			activeControls: api.settings.activeControls
		} );

		api.preview.bind( 'reload', function () {
			window.location.reload();
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

				if ( color() ) {
					css += 'background-color: ' + color() + ';';
				}

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
