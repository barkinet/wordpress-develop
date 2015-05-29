(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/audiovideo.manifest.js":[function(require,module,exports){
/*globals wp, _ */

var media = wp.media,
	baseSettings = window._wpmejsSettings || {},
	l10n = window._wpMediaViewsL10n || {};

/**
 * @mixin
 */
wp.media.mixin = {
	mejsSettings: baseSettings,

	removeAllPlayers: function() {
		var p;

		if ( window.mejs && window.mejs.players ) {
			for ( p in window.mejs.players ) {
				window.mejs.players[p].pause();
				this.removePlayer( window.mejs.players[p] );
			}
		}
	},

	/**
	 * Override the MediaElement method for removing a player.
	 *	MediaElement tries to pull the audio/video tag out of
	 *	its container and re-add it to the DOM.
	 */
	removePlayer: function(t) {
		var featureIndex, feature;

		if ( ! t.options ) {
			return;
		}

		// invoke features cleanup
		for ( featureIndex in t.options.features ) {
			feature = t.options.features[featureIndex];
			if ( t['clean' + feature] ) {
				try {
					t['clean' + feature](t);
				} catch (e) {}
			}
		}

		if ( ! t.isDynamic ) {
			t.$node.remove();
		}

		if ( 'native' !== t.media.pluginType ) {
			t.$media.remove();
		}

		delete window.mejs.players[t.id];

		t.container.remove();
		t.globalUnbind();
		delete t.node.player;
	},

	/**
	 * Allows any class that has set 'player' to a MediaElementPlayer
	 *  instance to remove the player when listening to events.
	 *
	 *  Examples: modal closes, shortcode properties are removed, etc.
	 */
	unsetPlayers : function() {
		if ( this.players && this.players.length ) {
			_.each( this.players, function (player) {
				player.pause();
				wp.media.mixin.removePlayer( player );
			} );
			this.players = [];
		}
	}
};

/**
 * Autowire "collection"-type shortcodes
 */
wp.media.playlist = new wp.media.collection({
	tag: 'playlist',
	editTitle : l10n.editPlaylistTitle,
	defaults : {
		id: wp.media.view.settings.post.id,
		style: 'light',
		tracklist: true,
		tracknumbers: true,
		images: true,
		artists: true,
		type: 'audio'
	}
});

/**
 * Shortcode modeling for audio
 *  `edit()` prepares the shortcode for the media modal
 *  `shortcode()` builds the new shortcode after update
 *
 * @namespace
 */
wp.media.audio = {
	coerce : wp.media.coerce,

	defaults : {
		id : wp.media.view.settings.post.id,
		src : '',
		loop : false,
		autoplay : false,
		preload : 'none',
		width : 400
	},

	edit : function( data ) {
		var frame, shortcode = wp.shortcode.next( 'audio', data ).shortcode;

		frame = wp.media({
			frame: 'audio',
			state: 'audio-details',
			metadata: _.defaults( shortcode.attrs.named, this.defaults )
		});

		return frame;
	},

	shortcode : function( model ) {
		var content;

		_.each( this.defaults, function( value, key ) {
			model[ key ] = this.coerce( model, key );

			if ( value === model[ key ] ) {
				delete model[ key ];
			}
		}, this );

		content = model.content;
		delete model.content;

		return new wp.shortcode({
			tag: 'audio',
			attrs: model,
			content: content
		});
	}
};

/**
 * Shortcode modeling for video
 *  `edit()` prepares the shortcode for the media modal
 *  `shortcode()` builds the new shortcode after update
 *
 * @namespace
 */
wp.media.video = {
	coerce : wp.media.coerce,

	defaults : {
		id : wp.media.view.settings.post.id,
		src : '',
		poster : '',
		loop : false,
		autoplay : false,
		preload : 'metadata',
		content : '',
		width : 640,
		height : 360
	},

	edit : function( data ) {
		var frame,
			shortcode = wp.shortcode.next( 'video', data ).shortcode,
			attrs;

		attrs = shortcode.attrs.named;
		attrs.content = shortcode.content;

		frame = wp.media({
			frame: 'video',
			state: 'video-details',
			metadata: _.defaults( attrs, this.defaults )
		});

		return frame;
	},

	shortcode : function( model ) {
		var content;

		_.each( this.defaults, function( value, key ) {
			model[ key ] = this.coerce( model, key );

			if ( value === model[ key ] ) {
				delete model[ key ];
			}
		}, this );

		content = model.content;
		delete model.content;

		return new wp.shortcode({
			tag: 'video',
			attrs: model,
			content: content
		});
	}
};

media.model.PostMedia = require( './models/post-media.js' );
media.controller.AudioDetails = require( './controllers/audio-details.js' );
media.controller.VideoDetails = require( './controllers/video-details.js' );
media.view.MediaFrame.MediaDetails = require( './views/frame/media-details.js' );
media.view.MediaFrame.AudioDetails = require( './views/frame/audio-details.js' );
media.view.MediaFrame.VideoDetails = require( './views/frame/video-details.js' );
media.view.MediaDetails = require( './views/media-details.js' );
media.view.AudioDetails = require( './views/audio-details.js' );
media.view.VideoDetails = require( './views/video-details.js' );

},{"./controllers/audio-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/audio-details.js","./controllers/video-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/video-details.js","./models/post-media.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/models/post-media.js","./views/audio-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/audio-details.js","./views/frame/audio-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/audio-details.js","./views/frame/media-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/media-details.js","./views/frame/video-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/video-details.js","./views/media-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/media-details.js","./views/video-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/video-details.js"}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/audio-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.controller.AudioDetails
 *
 * The controller for the Audio Details state
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var State = wp.media.controller.State,
	l10n = wp.media.view.l10n,
	AudioDetails;

AudioDetails = State.extend({
	defaults: {
		id: 'audio-details',
		toolbar: 'audio-details',
		title: l10n.audioDetailsTitle,
		content: 'audio-details',
		menu: 'audio-details',
		router: false,
		priority: 60
	},

	initialize: function( options ) {
		this.media = options.media;
		State.prototype.initialize.apply( this, arguments );
	}
});

module.exports = AudioDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/video-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.controller.VideoDetails
 *
 * The controller for the Video Details state
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var State = wp.media.controller.State,
	l10n = wp.media.view.l10n,
	VideoDetails;

VideoDetails = State.extend({
	defaults: {
		id: 'video-details',
		toolbar: 'video-details',
		title: l10n.videoDetailsTitle,
		content: 'video-details',
		menu: 'video-details',
		router: false,
		priority: 60
	},

	initialize: function( options ) {
		this.media = options.media;
		State.prototype.initialize.apply( this, arguments );
	}
});

module.exports = VideoDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/models/post-media.js":[function(require,module,exports){
/*globals wp, Backbone, _ */

/**
 * wp.media.model.PostMedia
 *
 * Shared model class for audio and video. Updates the model after
 *   "Add Audio|Video Source" and "Replace Audio|Video" states return
 *
 * @class
 * @augments Backbone.Model
 */
var PostMedia = Backbone.Model.extend({
	initialize: function() {
		this.attachment = false;
	},

	setSource: function( attachment ) {
		this.attachment = attachment;
		this.extension = attachment.get( 'filename' ).split('.').pop();

		if ( this.get( 'src' ) && this.extension === this.get( 'src' ).split('.').pop() ) {
			this.unset( 'src' );
		}

		if ( _.contains( wp.media.view.settings.embedExts, this.extension ) ) {
			this.set( this.extension, this.attachment.get( 'url' ) );
		} else {
			this.unset( this.extension );
		}
	},

	changeAttachment: function( attachment ) {
		this.setSource( attachment );

		this.unset( 'src' );
		_.each( _.without( wp.media.view.settings.embedExts, this.extension ), function( ext ) {
			this.unset( ext );
		}, this );
	}
});

module.exports = PostMedia;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/audio-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.AudioDetails
 *
 * @class
 * @augments wp.media.view.MediaDetails
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var MediaDetails = wp.media.view.MediaDetails,
	AudioDetails;

AudioDetails = MediaDetails.extend({
	className: 'audio-details',
	template:  wp.template('audio-details'),

	setMedia: function() {
		var audio = this.$('.wp-audio-shortcode');

		if ( audio.find( 'source' ).length ) {
			if ( audio.is(':hidden') ) {
				audio.show();
			}
			this.media = MediaDetails.prepareSrc( audio.get(0) );
		} else {
			audio.hide();
			this.media = false;
		}

		return this;
	}
});

module.exports = AudioDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/audio-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.MediaFrame.AudioDetails
 *
 * @class
 * @augments wp.media.view.MediaFrame.MediaDetails
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var MediaDetails = wp.media.view.MediaFrame.MediaDetails,
	MediaLibrary = wp.media.controller.MediaLibrary,

	l10n = wp.media.view.l10n,
	AudioDetails;

AudioDetails = MediaDetails.extend({
	defaults: {
		id:      'audio',
		url:     '',
		menu:    'audio-details',
		content: 'audio-details',
		toolbar: 'audio-details',
		type:    'link',
		title:    l10n.audioDetailsTitle,
		priority: 120
	},

	initialize: function( options ) {
		options.DetailsView = wp.media.view.AudioDetails;
		options.cancelText = l10n.audioDetailsCancel;
		options.addText = l10n.audioAddSourceTitle;

		MediaDetails.prototype.initialize.call( this, options );
	},

	bindHandlers: function() {
		MediaDetails.prototype.bindHandlers.apply( this, arguments );

		this.on( 'toolbar:render:replace-audio', this.renderReplaceToolbar, this );
		this.on( 'toolbar:render:add-audio-source', this.renderAddSourceToolbar, this );
	},

	createStates: function() {
		this.states.add([
			new wp.media.controller.AudioDetails( {
				media: this.media
			} ),

			new MediaLibrary( {
				type: 'audio',
				id: 'replace-audio',
				title: l10n.audioReplaceTitle,
				toolbar: 'replace-audio',
				media: this.media,
				menu: 'audio-details'
			} ),

			new MediaLibrary( {
				type: 'audio',
				id: 'add-audio-source',
				title: l10n.audioAddSourceTitle,
				toolbar: 'add-audio-source',
				media: this.media,
				menu: false
			} )
		]);
	}
});

module.exports = AudioDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/media-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.MediaFrame.MediaDetails
 *
 * @class
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Select = wp.media.view.MediaFrame.Select,
	l10n = wp.media.view.l10n,
	MediaDetails;

MediaDetails = Select.extend({
	defaults: {
		id:      'media',
		url:     '',
		menu:    'media-details',
		content: 'media-details',
		toolbar: 'media-details',
		type:    'link',
		priority: 120
	},

	initialize: function( options ) {
		this.DetailsView = options.DetailsView;
		this.cancelText = options.cancelText;
		this.addText = options.addText;

		this.media = new wp.media.model.PostMedia( options.metadata );
		this.options.selection = new wp.media.model.Selection( this.media.attachment, { multiple: false } );
		Select.prototype.initialize.apply( this, arguments );
	},

	bindHandlers: function() {
		var menu = this.defaults.menu;

		Select.prototype.bindHandlers.apply( this, arguments );

		this.on( 'menu:create:' + menu, this.createMenu, this );
		this.on( 'content:render:' + menu, this.renderDetailsContent, this );
		this.on( 'menu:render:' + menu, this.renderMenu, this );
		this.on( 'toolbar:render:' + menu, this.renderDetailsToolbar, this );
	},

	renderDetailsContent: function() {
		var view = new this.DetailsView({
			controller: this,
			model: this.state().media,
			attachment: this.state().media.attachment
		}).render();

		this.content.set( view );
	},

	renderMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     this.cancelText,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});

	},

	setPrimaryButton: function(text, handler) {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				button: {
					style:    'primary',
					text:     text,
					priority: 80,
					click:    function() {
						var controller = this.controller;
						handler.call( this, controller, controller.state() );
						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	renderDetailsToolbar: function() {
		this.setPrimaryButton( l10n.update, function( controller, state ) {
			controller.close();
			state.trigger( 'update', controller.media.toJSON() );
		} );
	},

	renderReplaceToolbar: function() {
		this.setPrimaryButton( l10n.replace, function( controller, state ) {
			var attachment = state.get( 'selection' ).single();
			controller.media.changeAttachment( attachment );
			state.trigger( 'replace', controller.media.toJSON() );
		} );
	},

	renderAddSourceToolbar: function() {
		this.setPrimaryButton( this.addText, function( controller, state ) {
			var attachment = state.get( 'selection' ).single();
			controller.media.setSource( attachment );
			state.trigger( 'add-source', controller.media.toJSON() );
		} );
	}
});

module.exports = MediaDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/video-details.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.MediaFrame.VideoDetails
 *
 * @class
 * @augments wp.media.view.MediaFrame.MediaDetails
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var MediaDetails = wp.media.view.MediaFrame.MediaDetails,
	MediaLibrary = wp.media.controller.MediaLibrary,
	l10n = wp.media.view.l10n,
	VideoDetails;

VideoDetails = MediaDetails.extend({
	defaults: {
		id:      'video',
		url:     '',
		menu:    'video-details',
		content: 'video-details',
		toolbar: 'video-details',
		type:    'link',
		title:    l10n.videoDetailsTitle,
		priority: 120
	},

	initialize: function( options ) {
		options.DetailsView = wp.media.view.VideoDetails;
		options.cancelText = l10n.videoDetailsCancel;
		options.addText = l10n.videoAddSourceTitle;

		MediaDetails.prototype.initialize.call( this, options );
	},

	bindHandlers: function() {
		MediaDetails.prototype.bindHandlers.apply( this, arguments );

		this.on( 'toolbar:render:replace-video', this.renderReplaceToolbar, this );
		this.on( 'toolbar:render:add-video-source', this.renderAddSourceToolbar, this );
		this.on( 'toolbar:render:select-poster-image', this.renderSelectPosterImageToolbar, this );
		this.on( 'toolbar:render:add-track', this.renderAddTrackToolbar, this );
	},

	createStates: function() {
		this.states.add([
			new wp.media.controller.VideoDetails({
				media: this.media
			}),

			new MediaLibrary( {
				type: 'video',
				id: 'replace-video',
				title: l10n.videoReplaceTitle,
				toolbar: 'replace-video',
				media: this.media,
				menu: 'video-details'
			} ),

			new MediaLibrary( {
				type: 'video',
				id: 'add-video-source',
				title: l10n.videoAddSourceTitle,
				toolbar: 'add-video-source',
				media: this.media,
				menu: false
			} ),

			new MediaLibrary( {
				type: 'image',
				id: 'select-poster-image',
				title: l10n.videoSelectPosterImageTitle,
				toolbar: 'select-poster-image',
				media: this.media,
				menu: 'video-details'
			} ),

			new MediaLibrary( {
				type: 'text',
				id: 'add-track',
				title: l10n.videoAddTrackTitle,
				toolbar: 'add-track',
				media: this.media,
				menu: 'video-details'
			} )
		]);
	},

	renderSelectPosterImageToolbar: function() {
		this.setPrimaryButton( l10n.videoSelectPosterImageTitle, function( controller, state ) {
			var urls = [], attachment = state.get( 'selection' ).single();

			controller.media.set( 'poster', attachment.get( 'url' ) );
			state.trigger( 'set-poster-image', controller.media.toJSON() );

			_.each( wp.media.view.settings.embedExts, function (ext) {
				if ( controller.media.get( ext ) ) {
					urls.push( controller.media.get( ext ) );
				}
			} );

			wp.ajax.send( 'set-attachment-thumbnail', {
				data : {
					urls: urls,
					thumbnail_id: attachment.get( 'id' )
				}
			} );
		} );
	},

	renderAddTrackToolbar: function() {
		this.setPrimaryButton( l10n.videoAddTrackTitle, function( controller, state ) {
			var attachment = state.get( 'selection' ).single(),
				content = controller.media.get( 'content' );

			if ( -1 === content.indexOf( attachment.get( 'url' ) ) ) {
				content += [
					'<track srclang="en" label="English"kind="subtitles" src="',
					attachment.get( 'url' ),
					'" />'
				].join('');

				controller.media.set( 'content', content );
			}
			state.trigger( 'add-track', controller.media.toJSON() );
		} );
	}
});

module.exports = VideoDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/media-details.js":[function(require,module,exports){
/*global wp, jQuery, _, MediaElementPlayer */

/**
 * wp.media.view.MediaDetails
 *
 * @class
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var AttachmentDisplay = wp.media.view.Settings.AttachmentDisplay,
	$ = jQuery,
	MediaDetails;

MediaDetails = AttachmentDisplay.extend({
	initialize: function() {
		_.bindAll(this, 'success');
		this.players = [];
		this.listenTo( this.controller, 'close', wp.media.mixin.unsetPlayers );
		this.on( 'ready', this.setPlayer );
		this.on( 'media:setting:remove', wp.media.mixin.unsetPlayers, this );
		this.on( 'media:setting:remove', this.render );
		this.on( 'media:setting:remove', this.setPlayer );
		this.events = _.extend( this.events, {
			'click .remove-setting' : 'removeSetting',
			'change .content-track' : 'setTracks',
			'click .remove-track' : 'setTracks',
			'click .add-media-source' : 'addSource'
		} );

		AttachmentDisplay.prototype.initialize.apply( this, arguments );
	},

	prepare: function() {
		return _.defaults({
			model: this.model.toJSON()
		}, this.options );
	},

	/**
	 * Remove a setting's UI when the model unsets it
	 *
	 * @fires wp.media.view.MediaDetails#media:setting:remove
	 *
	 * @param {Event} e
	 */
	removeSetting : function(e) {
		var wrap = $( e.currentTarget ).parent(), setting;
		setting = wrap.find( 'input' ).data( 'setting' );

		if ( setting ) {
			this.model.unset( setting );
			this.trigger( 'media:setting:remove', this );
		}

		wrap.remove();
	},

	/**
	 *
	 * @fires wp.media.view.MediaDetails#media:setting:remove
	 */
	setTracks : function() {
		var tracks = '';

		_.each( this.$('.content-track'), function(track) {
			tracks += $( track ).val();
		} );

		this.model.set( 'content', tracks );
		this.trigger( 'media:setting:remove', this );
	},

	addSource : function( e ) {
		this.controller.lastMime = $( e.currentTarget ).data( 'mime' );
		this.controller.setState( 'add-' + this.controller.defaults.id + '-source' );
	},

	loadPlayer: function () {
		this.players.push( new MediaElementPlayer( this.media, this.settings ) );
		this.scriptXhr = false;
	},

	/**
	 * @global MediaElementPlayer
	 */
	setPlayer : function() {
		var baseSettings;

		if ( this.players.length || ! this.media || this.scriptXhr ) {
			return;
		}

		if ( this.model.get( 'src' ).indexOf( 'vimeo' ) > -1 && ! ( 'Froogaloop' in window ) ) {
			baseSettings = wp.media.mixin.mejsSettings;
			this.scriptXhr = $.getScript( baseSettings.pluginPath + 'froogaloop.min.js', _.bind( this.loadPlayer, this ) );
		} else {
			this.loadPlayer();
		}
	},

	/**
	 * @abstract
	 */
	setMedia : function() {
		return this;
	},

	success : function(mejs) {
		var autoplay = mejs.attributes.autoplay && 'false' !== mejs.attributes.autoplay;

		if ( 'flash' === mejs.pluginType && autoplay ) {
			mejs.addEventListener( 'canplay', function() {
				mejs.play();
			}, false );
		}

		this.mejs = mejs;
	},

	/**
	 * @returns {media.view.MediaDetails} Returns itself to allow chaining
	 */
	render: function() {
		AttachmentDisplay.prototype.render.apply( this, arguments );

		setTimeout( _.bind( function() {
			this.resetFocus();
		}, this ), 10 );

		this.settings = _.defaults( {
			success : this.success
		}, wp.media.mixin.mejsSettings );

		return this.setMedia();
	},

	resetFocus: function() {
		this.$( '.embed-media-settings' ).scrollTop( 0 );
	}
}, {
	instances : 0,
	/**
	 * When multiple players in the DOM contain the same src, things get weird.
	 *
	 * @param {HTMLElement} elem
	 * @returns {HTMLElement}
	 */
	prepareSrc : function( elem ) {
		var i = MediaDetails.instances++;
		_.each( $( elem ).find( 'source' ), function( source ) {
			source.src = [
				source.src,
				source.src.indexOf('?') > -1 ? '&' : '?',
				'_=',
				i
			].join('');
		} );

		return elem;
	}
});

module.exports = MediaDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/video-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.VideoDetails
 *
 * @class
 * @augments wp.media.view.MediaDetails
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var MediaDetails = wp.media.view.MediaDetails,
	VideoDetails;

VideoDetails = MediaDetails.extend({
	className: 'video-details',
	template:  wp.template('video-details'),

	setMedia: function() {
		var video = this.$('.wp-video-shortcode');

		if ( video.find( 'source' ).length ) {
			if ( video.is(':hidden') ) {
				video.show();
			}

			if ( ! video.hasClass( 'youtube-video' ) && ! video.hasClass( 'vimeo-video' ) ) {
				this.media = MediaDetails.prepareSrc( video.get(0) );
			} else {
				this.media = video.get(0);
			}
		} else {
			video.hide();
			this.media = false;
		}

		return this;
	}
});

module.exports = VideoDetails;

},{}]},{},["/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/audiovideo.manifest.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvYXVkaW92aWRlby5tYW5pZmVzdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9hdWRpby1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL3ZpZGVvLWRldGFpbHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvbW9kZWxzL3Bvc3QtbWVkaWEuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXVkaW8tZGV0YWlscy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9mcmFtZS9hdWRpby1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2ZyYW1lL21lZGlhLWRldGFpbHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZnJhbWUvdmlkZW8tZGV0YWlscy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9tZWRpYS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3ZpZGVvLWRldGFpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG52YXIgbWVkaWEgPSB3cC5tZWRpYSxcblx0YmFzZVNldHRpbmdzID0gd2luZG93Ll93cG1lanNTZXR0aW5ncyB8fCB7fSxcblx0bDEwbiA9IHdpbmRvdy5fd3BNZWRpYVZpZXdzTDEwbiB8fCB7fTtcblxuLyoqXG4gKiBAbWl4aW5cbiAqL1xud3AubWVkaWEubWl4aW4gPSB7XG5cdG1lanNTZXR0aW5nczogYmFzZVNldHRpbmdzLFxuXG5cdHJlbW92ZUFsbFBsYXllcnM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBwO1xuXG5cdFx0aWYgKCB3aW5kb3cubWVqcyAmJiB3aW5kb3cubWVqcy5wbGF5ZXJzICkge1xuXHRcdFx0Zm9yICggcCBpbiB3aW5kb3cubWVqcy5wbGF5ZXJzICkge1xuXHRcdFx0XHR3aW5kb3cubWVqcy5wbGF5ZXJzW3BdLnBhdXNlKCk7XG5cdFx0XHRcdHRoaXMucmVtb3ZlUGxheWVyKCB3aW5kb3cubWVqcy5wbGF5ZXJzW3BdICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBPdmVycmlkZSB0aGUgTWVkaWFFbGVtZW50IG1ldGhvZCBmb3IgcmVtb3ZpbmcgYSBwbGF5ZXIuXG5cdCAqXHRNZWRpYUVsZW1lbnQgdHJpZXMgdG8gcHVsbCB0aGUgYXVkaW8vdmlkZW8gdGFnIG91dCBvZlxuXHQgKlx0aXRzIGNvbnRhaW5lciBhbmQgcmUtYWRkIGl0IHRvIHRoZSBET00uXG5cdCAqL1xuXHRyZW1vdmVQbGF5ZXI6IGZ1bmN0aW9uKHQpIHtcblx0XHR2YXIgZmVhdHVyZUluZGV4LCBmZWF0dXJlO1xuXG5cdFx0aWYgKCAhIHQub3B0aW9ucyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBpbnZva2UgZmVhdHVyZXMgY2xlYW51cFxuXHRcdGZvciAoIGZlYXR1cmVJbmRleCBpbiB0Lm9wdGlvbnMuZmVhdHVyZXMgKSB7XG5cdFx0XHRmZWF0dXJlID0gdC5vcHRpb25zLmZlYXR1cmVzW2ZlYXR1cmVJbmRleF07XG5cdFx0XHRpZiAoIHRbJ2NsZWFuJyArIGZlYXR1cmVdICkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHRbJ2NsZWFuJyArIGZlYXR1cmVdKHQpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggISB0LmlzRHluYW1pYyApIHtcblx0XHRcdHQuJG5vZGUucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCAnbmF0aXZlJyAhPT0gdC5tZWRpYS5wbHVnaW5UeXBlICkge1xuXHRcdFx0dC4kbWVkaWEucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHdpbmRvdy5tZWpzLnBsYXllcnNbdC5pZF07XG5cblx0XHR0LmNvbnRhaW5lci5yZW1vdmUoKTtcblx0XHR0Lmdsb2JhbFVuYmluZCgpO1xuXHRcdGRlbGV0ZSB0Lm5vZGUucGxheWVyO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBbGxvd3MgYW55IGNsYXNzIHRoYXQgaGFzIHNldCAncGxheWVyJyB0byBhIE1lZGlhRWxlbWVudFBsYXllclxuXHQgKiAgaW5zdGFuY2UgdG8gcmVtb3ZlIHRoZSBwbGF5ZXIgd2hlbiBsaXN0ZW5pbmcgdG8gZXZlbnRzLlxuXHQgKlxuXHQgKiAgRXhhbXBsZXM6IG1vZGFsIGNsb3Nlcywgc2hvcnRjb2RlIHByb3BlcnRpZXMgYXJlIHJlbW92ZWQsIGV0Yy5cblx0ICovXG5cdHVuc2V0UGxheWVycyA6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5wbGF5ZXJzICYmIHRoaXMucGxheWVycy5sZW5ndGggKSB7XG5cdFx0XHRfLmVhY2goIHRoaXMucGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuXHRcdFx0XHRwbGF5ZXIucGF1c2UoKTtcblx0XHRcdFx0d3AubWVkaWEubWl4aW4ucmVtb3ZlUGxheWVyKCBwbGF5ZXIgKTtcblx0XHRcdH0gKTtcblx0XHRcdHRoaXMucGxheWVycyA9IFtdO1xuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBBdXRvd2lyZSBcImNvbGxlY3Rpb25cIi10eXBlIHNob3J0Y29kZXNcbiAqL1xud3AubWVkaWEucGxheWxpc3QgPSBuZXcgd3AubWVkaWEuY29sbGVjdGlvbih7XG5cdHRhZzogJ3BsYXlsaXN0Jyxcblx0ZWRpdFRpdGxlIDogbDEwbi5lZGl0UGxheWxpc3RUaXRsZSxcblx0ZGVmYXVsdHMgOiB7XG5cdFx0aWQ6IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCxcblx0XHRzdHlsZTogJ2xpZ2h0Jyxcblx0XHR0cmFja2xpc3Q6IHRydWUsXG5cdFx0dHJhY2tudW1iZXJzOiB0cnVlLFxuXHRcdGltYWdlczogdHJ1ZSxcblx0XHRhcnRpc3RzOiB0cnVlLFxuXHRcdHR5cGU6ICdhdWRpbydcblx0fVxufSk7XG5cbi8qKlxuICogU2hvcnRjb2RlIG1vZGVsaW5nIGZvciBhdWRpb1xuICogIGBlZGl0KClgIHByZXBhcmVzIHRoZSBzaG9ydGNvZGUgZm9yIHRoZSBtZWRpYSBtb2RhbFxuICogIGBzaG9ydGNvZGUoKWAgYnVpbGRzIHRoZSBuZXcgc2hvcnRjb2RlIGFmdGVyIHVwZGF0ZVxuICpcbiAqIEBuYW1lc3BhY2VcbiAqL1xud3AubWVkaWEuYXVkaW8gPSB7XG5cdGNvZXJjZSA6IHdwLm1lZGlhLmNvZXJjZSxcblxuXHRkZWZhdWx0cyA6IHtcblx0XHRpZCA6IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCxcblx0XHRzcmMgOiAnJyxcblx0XHRsb29wIDogZmFsc2UsXG5cdFx0YXV0b3BsYXkgOiBmYWxzZSxcblx0XHRwcmVsb2FkIDogJ25vbmUnLFxuXHRcdHdpZHRoIDogNDAwXG5cdH0sXG5cblx0ZWRpdCA6IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdHZhciBmcmFtZSwgc2hvcnRjb2RlID0gd3Auc2hvcnRjb2RlLm5leHQoICdhdWRpbycsIGRhdGEgKS5zaG9ydGNvZGU7XG5cblx0XHRmcmFtZSA9IHdwLm1lZGlhKHtcblx0XHRcdGZyYW1lOiAnYXVkaW8nLFxuXHRcdFx0c3RhdGU6ICdhdWRpby1kZXRhaWxzJyxcblx0XHRcdG1ldGFkYXRhOiBfLmRlZmF1bHRzKCBzaG9ydGNvZGUuYXR0cnMubmFtZWQsIHRoaXMuZGVmYXVsdHMgKVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGZyYW1lO1xuXHR9LFxuXG5cdHNob3J0Y29kZSA6IGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHR2YXIgY29udGVudDtcblxuXHRcdF8uZWFjaCggdGhpcy5kZWZhdWx0cywgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRtb2RlbFsga2V5IF0gPSB0aGlzLmNvZXJjZSggbW9kZWwsIGtleSApO1xuXG5cdFx0XHRpZiAoIHZhbHVlID09PSBtb2RlbFsga2V5IF0gKSB7XG5cdFx0XHRcdGRlbGV0ZSBtb2RlbFsga2V5IF07XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0Y29udGVudCA9IG1vZGVsLmNvbnRlbnQ7XG5cdFx0ZGVsZXRlIG1vZGVsLmNvbnRlbnQ7XG5cblx0XHRyZXR1cm4gbmV3IHdwLnNob3J0Y29kZSh7XG5cdFx0XHR0YWc6ICdhdWRpbycsXG5cdFx0XHRhdHRyczogbW9kZWwsXG5cdFx0XHRjb250ZW50OiBjb250ZW50XG5cdFx0fSk7XG5cdH1cbn07XG5cbi8qKlxuICogU2hvcnRjb2RlIG1vZGVsaW5nIGZvciB2aWRlb1xuICogIGBlZGl0KClgIHByZXBhcmVzIHRoZSBzaG9ydGNvZGUgZm9yIHRoZSBtZWRpYSBtb2RhbFxuICogIGBzaG9ydGNvZGUoKWAgYnVpbGRzIHRoZSBuZXcgc2hvcnRjb2RlIGFmdGVyIHVwZGF0ZVxuICpcbiAqIEBuYW1lc3BhY2VcbiAqL1xud3AubWVkaWEudmlkZW8gPSB7XG5cdGNvZXJjZSA6IHdwLm1lZGlhLmNvZXJjZSxcblxuXHRkZWZhdWx0cyA6IHtcblx0XHRpZCA6IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCxcblx0XHRzcmMgOiAnJyxcblx0XHRwb3N0ZXIgOiAnJyxcblx0XHRsb29wIDogZmFsc2UsXG5cdFx0YXV0b3BsYXkgOiBmYWxzZSxcblx0XHRwcmVsb2FkIDogJ21ldGFkYXRhJyxcblx0XHRjb250ZW50IDogJycsXG5cdFx0d2lkdGggOiA2NDAsXG5cdFx0aGVpZ2h0IDogMzYwXG5cdH0sXG5cblx0ZWRpdCA6IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdHZhciBmcmFtZSxcblx0XHRcdHNob3J0Y29kZSA9IHdwLnNob3J0Y29kZS5uZXh0KCAndmlkZW8nLCBkYXRhICkuc2hvcnRjb2RlLFxuXHRcdFx0YXR0cnM7XG5cblx0XHRhdHRycyA9IHNob3J0Y29kZS5hdHRycy5uYW1lZDtcblx0XHRhdHRycy5jb250ZW50ID0gc2hvcnRjb2RlLmNvbnRlbnQ7XG5cblx0XHRmcmFtZSA9IHdwLm1lZGlhKHtcblx0XHRcdGZyYW1lOiAndmlkZW8nLFxuXHRcdFx0c3RhdGU6ICd2aWRlby1kZXRhaWxzJyxcblx0XHRcdG1ldGFkYXRhOiBfLmRlZmF1bHRzKCBhdHRycywgdGhpcy5kZWZhdWx0cyApXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZnJhbWU7XG5cdH0sXG5cblx0c2hvcnRjb2RlIDogZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdHZhciBjb250ZW50O1xuXG5cdFx0Xy5lYWNoKCB0aGlzLmRlZmF1bHRzLCBmdW5jdGlvbiggdmFsdWUsIGtleSApIHtcblx0XHRcdG1vZGVsWyBrZXkgXSA9IHRoaXMuY29lcmNlKCBtb2RlbCwga2V5ICk7XG5cblx0XHRcdGlmICggdmFsdWUgPT09IG1vZGVsWyBrZXkgXSApIHtcblx0XHRcdFx0ZGVsZXRlIG1vZGVsWyBrZXkgXTtcblx0XHRcdH1cblx0XHR9LCB0aGlzICk7XG5cblx0XHRjb250ZW50ID0gbW9kZWwuY29udGVudDtcblx0XHRkZWxldGUgbW9kZWwuY29udGVudDtcblxuXHRcdHJldHVybiBuZXcgd3Auc2hvcnRjb2RlKHtcblx0XHRcdHRhZzogJ3ZpZGVvJyxcblx0XHRcdGF0dHJzOiBtb2RlbCxcblx0XHRcdGNvbnRlbnQ6IGNvbnRlbnRcblx0XHR9KTtcblx0fVxufTtcblxubWVkaWEubW9kZWwuUG9zdE1lZGlhID0gcmVxdWlyZSggJy4vbW9kZWxzL3Bvc3QtbWVkaWEuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkF1ZGlvRGV0YWlscyA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2F1ZGlvLWRldGFpbHMuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLlZpZGVvRGV0YWlscyA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL3ZpZGVvLWRldGFpbHMuanMnICk7XG5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuTWVkaWFEZXRhaWxzID0gcmVxdWlyZSggJy4vdmlld3MvZnJhbWUvbWVkaWEtZGV0YWlscy5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5BdWRpb0RldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9mcmFtZS9hdWRpby1kZXRhaWxzLmpzJyApO1xubWVkaWEudmlldy5NZWRpYUZyYW1lLlZpZGVvRGV0YWlscyA9IHJlcXVpcmUoICcuL3ZpZXdzL2ZyYW1lL3ZpZGVvLWRldGFpbHMuanMnICk7XG5tZWRpYS52aWV3Lk1lZGlhRGV0YWlscyA9IHJlcXVpcmUoICcuL3ZpZXdzL21lZGlhLWRldGFpbHMuanMnICk7XG5tZWRpYS52aWV3LkF1ZGlvRGV0YWlscyA9IHJlcXVpcmUoICcuL3ZpZXdzL2F1ZGlvLWRldGFpbHMuanMnICk7XG5tZWRpYS52aWV3LlZpZGVvRGV0YWlscyA9IHJlcXVpcmUoICcuL3ZpZXdzL3ZpZGVvLWRldGFpbHMuanMnICk7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkF1ZGlvRGV0YWlsc1xuICpcbiAqIFRoZSBjb250cm9sbGVyIGZvciB0aGUgQXVkaW8gRGV0YWlscyBzdGF0ZVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgU3RhdGUgPSB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlLFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRBdWRpb0RldGFpbHM7XG5cbkF1ZGlvRGV0YWlscyA9IFN0YXRlLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aWQ6ICdhdWRpby1kZXRhaWxzJyxcblx0XHR0b29sYmFyOiAnYXVkaW8tZGV0YWlscycsXG5cdFx0dGl0bGU6IGwxMG4uYXVkaW9EZXRhaWxzVGl0bGUsXG5cdFx0Y29udGVudDogJ2F1ZGlvLWRldGFpbHMnLFxuXHRcdG1lbnU6ICdhdWRpby1kZXRhaWxzJyxcblx0XHRyb3V0ZXI6IGZhbHNlLFxuXHRcdHByaW9yaXR5OiA2MFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHRoaXMubWVkaWEgPSBvcHRpb25zLm1lZGlhO1xuXHRcdFN0YXRlLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXVkaW9EZXRhaWxzO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5WaWRlb0RldGFpbHNcbiAqXG4gKiBUaGUgY29udHJvbGxlciBmb3IgdGhlIFZpZGVvIERldGFpbHMgc3RhdGVcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqL1xudmFyIFN0YXRlID0gd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0VmlkZW9EZXRhaWxzO1xuXG5WaWRlb0RldGFpbHMgPSBTdGF0ZS5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGlkOiAndmlkZW8tZGV0YWlscycsXG5cdFx0dG9vbGJhcjogJ3ZpZGVvLWRldGFpbHMnLFxuXHRcdHRpdGxlOiBsMTBuLnZpZGVvRGV0YWlsc1RpdGxlLFxuXHRcdGNvbnRlbnQ6ICd2aWRlby1kZXRhaWxzJyxcblx0XHRtZW51OiAndmlkZW8tZGV0YWlscycsXG5cdFx0cm91dGVyOiBmYWxzZSxcblx0XHRwcmlvcml0eTogNjBcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR0aGlzLm1lZGlhID0gb3B0aW9ucy5tZWRpYTtcblx0XHRTdGF0ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZGVvRGV0YWlscztcbiIsIi8qZ2xvYmFscyB3cCwgQmFja2JvbmUsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5tb2RlbC5Qb3N0TWVkaWFcbiAqXG4gKiBTaGFyZWQgbW9kZWwgY2xhc3MgZm9yIGF1ZGlvIGFuZCB2aWRlby4gVXBkYXRlcyB0aGUgbW9kZWwgYWZ0ZXJcbiAqICAgXCJBZGQgQXVkaW98VmlkZW8gU291cmNlXCIgYW5kIFwiUmVwbGFjZSBBdWRpb3xWaWRlb1wiIHN0YXRlcyByZXR1cm5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgUG9zdE1lZGlhID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5hdHRhY2htZW50ID0gZmFsc2U7XG5cdH0sXG5cblx0c2V0U291cmNlOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHR0aGlzLmF0dGFjaG1lbnQgPSBhdHRhY2htZW50O1xuXHRcdHRoaXMuZXh0ZW5zaW9uID0gYXR0YWNobWVudC5nZXQoICdmaWxlbmFtZScgKS5zcGxpdCgnLicpLnBvcCgpO1xuXG5cdFx0aWYgKCB0aGlzLmdldCggJ3NyYycgKSAmJiB0aGlzLmV4dGVuc2lvbiA9PT0gdGhpcy5nZXQoICdzcmMnICkuc3BsaXQoJy4nKS5wb3AoKSApIHtcblx0XHRcdHRoaXMudW5zZXQoICdzcmMnICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBfLmNvbnRhaW5zKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLmVtYmVkRXh0cywgdGhpcy5leHRlbnNpb24gKSApIHtcblx0XHRcdHRoaXMuc2V0KCB0aGlzLmV4dGVuc2lvbiwgdGhpcy5hdHRhY2htZW50LmdldCggJ3VybCcgKSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnVuc2V0KCB0aGlzLmV4dGVuc2lvbiApO1xuXHRcdH1cblx0fSxcblxuXHRjaGFuZ2VBdHRhY2htZW50OiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHR0aGlzLnNldFNvdXJjZSggYXR0YWNobWVudCApO1xuXG5cdFx0dGhpcy51bnNldCggJ3NyYycgKTtcblx0XHRfLmVhY2goIF8ud2l0aG91dCggd3AubWVkaWEudmlldy5zZXR0aW5ncy5lbWJlZEV4dHMsIHRoaXMuZXh0ZW5zaW9uICksIGZ1bmN0aW9uKCBleHQgKSB7XG5cdFx0XHR0aGlzLnVuc2V0KCBleHQgKTtcblx0XHR9LCB0aGlzICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvc3RNZWRpYTtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXVkaW9EZXRhaWxzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYURldGFpbHNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzLkF0dGFjaG1lbnREaXNwbGF5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5nc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgTWVkaWFEZXRhaWxzID0gd3AubWVkaWEudmlldy5NZWRpYURldGFpbHMsXG5cdEF1ZGlvRGV0YWlscztcblxuQXVkaW9EZXRhaWxzID0gTWVkaWFEZXRhaWxzLmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2F1ZGlvLWRldGFpbHMnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdhdWRpby1kZXRhaWxzJyksXG5cblx0c2V0TWVkaWE6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IHRoaXMuJCgnLndwLWF1ZGlvLXNob3J0Y29kZScpO1xuXG5cdFx0aWYgKCBhdWRpby5maW5kKCAnc291cmNlJyApLmxlbmd0aCApIHtcblx0XHRcdGlmICggYXVkaW8uaXMoJzpoaWRkZW4nKSApIHtcblx0XHRcdFx0YXVkaW8uc2hvdygpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5tZWRpYSA9IE1lZGlhRGV0YWlscy5wcmVwYXJlU3JjKCBhdWRpby5nZXQoMCkgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXVkaW8uaGlkZSgpO1xuXHRcdFx0dGhpcy5tZWRpYSA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0RldGFpbHM7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuQXVkaW9EZXRhaWxzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLk1lZGlhRGV0YWlsc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5TZWxlY3RcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKiBAbWl4ZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqL1xudmFyIE1lZGlhRGV0YWlscyA9IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NZWRpYURldGFpbHMsXG5cdE1lZGlhTGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTWVkaWFMaWJyYXJ5LFxuXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdEF1ZGlvRGV0YWlscztcblxuQXVkaW9EZXRhaWxzID0gTWVkaWFEZXRhaWxzLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aWQ6ICAgICAgJ2F1ZGlvJyxcblx0XHR1cmw6ICAgICAnJyxcblx0XHRtZW51OiAgICAnYXVkaW8tZGV0YWlscycsXG5cdFx0Y29udGVudDogJ2F1ZGlvLWRldGFpbHMnLFxuXHRcdHRvb2xiYXI6ICdhdWRpby1kZXRhaWxzJyxcblx0XHR0eXBlOiAgICAnbGluaycsXG5cdFx0dGl0bGU6ICAgIGwxMG4uYXVkaW9EZXRhaWxzVGl0bGUsXG5cdFx0cHJpb3JpdHk6IDEyMFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdG9wdGlvbnMuRGV0YWlsc1ZpZXcgPSB3cC5tZWRpYS52aWV3LkF1ZGlvRGV0YWlscztcblx0XHRvcHRpb25zLmNhbmNlbFRleHQgPSBsMTBuLmF1ZGlvRGV0YWlsc0NhbmNlbDtcblx0XHRvcHRpb25zLmFkZFRleHQgPSBsMTBuLmF1ZGlvQWRkU291cmNlVGl0bGU7XG5cblx0XHRNZWRpYURldGFpbHMucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCggdGhpcywgb3B0aW9ucyApO1xuXHR9LFxuXG5cdGJpbmRIYW5kbGVyczogZnVuY3Rpb24oKSB7XG5cdFx0TWVkaWFEZXRhaWxzLnByb3RvdHlwZS5iaW5kSGFuZGxlcnMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6cmVuZGVyOnJlcGxhY2UtYXVkaW8nLCB0aGlzLnJlbmRlclJlcGxhY2VUb29sYmFyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6cmVuZGVyOmFkZC1hdWRpby1zb3VyY2UnLCB0aGlzLnJlbmRlckFkZFNvdXJjZVRvb2xiYXIsIHRoaXMgKTtcblx0fSxcblxuXHRjcmVhdGVTdGF0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3RhdGVzLmFkZChbXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5BdWRpb0RldGFpbHMoIHtcblx0XHRcdFx0bWVkaWE6IHRoaXMubWVkaWFcblx0XHRcdH0gKSxcblxuXHRcdFx0bmV3IE1lZGlhTGlicmFyeSgge1xuXHRcdFx0XHR0eXBlOiAnYXVkaW8nLFxuXHRcdFx0XHRpZDogJ3JlcGxhY2UtYXVkaW8nLFxuXHRcdFx0XHR0aXRsZTogbDEwbi5hdWRpb1JlcGxhY2VUaXRsZSxcblx0XHRcdFx0dG9vbGJhcjogJ3JlcGxhY2UtYXVkaW8nLFxuXHRcdFx0XHRtZWRpYTogdGhpcy5tZWRpYSxcblx0XHRcdFx0bWVudTogJ2F1ZGlvLWRldGFpbHMnXG5cdFx0XHR9ICksXG5cblx0XHRcdG5ldyBNZWRpYUxpYnJhcnkoIHtcblx0XHRcdFx0dHlwZTogJ2F1ZGlvJyxcblx0XHRcdFx0aWQ6ICdhZGQtYXVkaW8tc291cmNlJyxcblx0XHRcdFx0dGl0bGU6IGwxMG4uYXVkaW9BZGRTb3VyY2VUaXRsZSxcblx0XHRcdFx0dG9vbGJhcjogJ2FkZC1hdWRpby1zb3VyY2UnLFxuXHRcdFx0XHRtZWRpYTogdGhpcy5tZWRpYSxcblx0XHRcdFx0bWVudTogZmFsc2Vcblx0XHRcdH0gKVxuXHRcdF0pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0RldGFpbHM7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuTWVkaWFEZXRhaWxzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgU2VsZWN0ID0gd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdCxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0TWVkaWFEZXRhaWxzO1xuXG5NZWRpYURldGFpbHMgPSBTZWxlY3QuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAnbWVkaWEnLFxuXHRcdHVybDogICAgICcnLFxuXHRcdG1lbnU6ICAgICdtZWRpYS1kZXRhaWxzJyxcblx0XHRjb250ZW50OiAnbWVkaWEtZGV0YWlscycsXG5cdFx0dG9vbGJhcjogJ21lZGlhLWRldGFpbHMnLFxuXHRcdHR5cGU6ICAgICdsaW5rJyxcblx0XHRwcmlvcml0eTogMTIwXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5EZXRhaWxzVmlldyA9IG9wdGlvbnMuRGV0YWlsc1ZpZXc7XG5cdFx0dGhpcy5jYW5jZWxUZXh0ID0gb3B0aW9ucy5jYW5jZWxUZXh0O1xuXHRcdHRoaXMuYWRkVGV4dCA9IG9wdGlvbnMuYWRkVGV4dDtcblxuXHRcdHRoaXMubWVkaWEgPSBuZXcgd3AubWVkaWEubW9kZWwuUG9zdE1lZGlhKCBvcHRpb25zLm1ldGFkYXRhICk7XG5cdFx0dGhpcy5vcHRpb25zLnNlbGVjdGlvbiA9IG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oIHRoaXMubWVkaWEuYXR0YWNobWVudCwgeyBtdWx0aXBsZTogZmFsc2UgfSApO1xuXHRcdFNlbGVjdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0YmluZEhhbmRsZXJzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWVudSA9IHRoaXMuZGVmYXVsdHMubWVudTtcblxuXHRcdFNlbGVjdC5wcm90b3R5cGUuYmluZEhhbmRsZXJzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdHRoaXMub24oICdtZW51OmNyZWF0ZTonICsgbWVudSwgdGhpcy5jcmVhdGVNZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6cmVuZGVyOicgKyBtZW51LCB0aGlzLnJlbmRlckRldGFpbHNDb250ZW50LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ21lbnU6cmVuZGVyOicgKyBtZW51LCB0aGlzLnJlbmRlck1lbnUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpyZW5kZXI6JyArIG1lbnUsIHRoaXMucmVuZGVyRGV0YWlsc1Rvb2xiYXIsIHRoaXMgKTtcblx0fSxcblxuXHRyZW5kZXJEZXRhaWxzQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZpZXcgPSBuZXcgdGhpcy5EZXRhaWxzVmlldyh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6IHRoaXMuc3RhdGUoKS5tZWRpYSxcblx0XHRcdGF0dGFjaG1lbnQ6IHRoaXMuc3RhdGUoKS5tZWRpYS5hdHRhY2htZW50XG5cdFx0fSkucmVuZGVyKCk7XG5cblx0XHR0aGlzLmNvbnRlbnQuc2V0KCB2aWV3ICk7XG5cdH0sXG5cblx0cmVuZGVyTWVudTogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmFyIGxhc3RTdGF0ZSA9IHRoaXMubGFzdFN0YXRlKCksXG5cdFx0XHRwcmV2aW91cyA9IGxhc3RTdGF0ZSAmJiBsYXN0U3RhdGUuaWQsXG5cdFx0XHRmcmFtZSA9IHRoaXM7XG5cblx0XHR2aWV3LnNldCh7XG5cdFx0XHRjYW5jZWw6IHtcblx0XHRcdFx0dGV4dDogICAgIHRoaXMuY2FuY2VsVGV4dCxcblx0XHRcdFx0cHJpb3JpdHk6IDIwLFxuXHRcdFx0XHRjbGljazogICAgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdFx0XHRcdGZyYW1lLnNldFN0YXRlKCBwcmV2aW91cyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmcmFtZS5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHNlcGFyYXRlQ2FuY2VsOiBuZXcgd3AubWVkaWEuVmlldyh7XG5cdFx0XHRcdGNsYXNzTmFtZTogJ3NlcGFyYXRvcicsXG5cdFx0XHRcdHByaW9yaXR5OiA0MFxuXHRcdFx0fSlcblx0XHR9KTtcblxuXHR9LFxuXG5cdHNldFByaW1hcnlCdXR0b246IGZ1bmN0aW9uKHRleHQsIGhhbmRsZXIpIHtcblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRidXR0b246IHtcblx0XHRcdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICB0ZXh0LFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0XHRjbGljazogICAgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcjtcblx0XHRcdFx0XHRcdGhhbmRsZXIuY2FsbCggdGhpcywgY29udHJvbGxlciwgY29udHJvbGxlci5zdGF0ZSgpICk7XG5cdFx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZXNldCB0aGUgZGVmYXVsdCBzdGF0ZS5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoIGNvbnRyb2xsZXIub3B0aW9ucy5zdGF0ZSApO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0cmVuZGVyRGV0YWlsc1Rvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0UHJpbWFyeUJ1dHRvbiggbDEwbi51cGRhdGUsIGZ1bmN0aW9uKCBjb250cm9sbGVyLCBzdGF0ZSApIHtcblx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblx0XHRcdHN0YXRlLnRyaWdnZXIoICd1cGRhdGUnLCBjb250cm9sbGVyLm1lZGlhLnRvSlNPTigpICk7XG5cdFx0fSApO1xuXHR9LFxuXG5cdHJlbmRlclJlcGxhY2VUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFByaW1hcnlCdXR0b24oIGwxMG4ucmVwbGFjZSwgZnVuY3Rpb24oIGNvbnRyb2xsZXIsIHN0YXRlICkge1xuXHRcdFx0dmFyIGF0dGFjaG1lbnQgPSBzdGF0ZS5nZXQoICdzZWxlY3Rpb24nICkuc2luZ2xlKCk7XG5cdFx0XHRjb250cm9sbGVyLm1lZGlhLmNoYW5nZUF0dGFjaG1lbnQoIGF0dGFjaG1lbnQgKTtcblx0XHRcdHN0YXRlLnRyaWdnZXIoICdyZXBsYWNlJywgY29udHJvbGxlci5tZWRpYS50b0pTT04oKSApO1xuXHRcdH0gKTtcblx0fSxcblxuXHRyZW5kZXJBZGRTb3VyY2VUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFByaW1hcnlCdXR0b24oIHRoaXMuYWRkVGV4dCwgZnVuY3Rpb24oIGNvbnRyb2xsZXIsIHN0YXRlICkge1xuXHRcdFx0dmFyIGF0dGFjaG1lbnQgPSBzdGF0ZS5nZXQoICdzZWxlY3Rpb24nICkuc2luZ2xlKCk7XG5cdFx0XHRjb250cm9sbGVyLm1lZGlhLnNldFNvdXJjZSggYXR0YWNobWVudCApO1xuXHRcdFx0c3RhdGUudHJpZ2dlciggJ2FkZC1zb3VyY2UnLCBjb250cm9sbGVyLm1lZGlhLnRvSlNPTigpICk7XG5cdFx0fSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZWRpYURldGFpbHM7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuVmlkZW9EZXRhaWxzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLk1lZGlhRGV0YWlsc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5TZWxlY3RcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKiBAbWl4ZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqL1xudmFyIE1lZGlhRGV0YWlscyA9IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NZWRpYURldGFpbHMsXG5cdE1lZGlhTGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTWVkaWFMaWJyYXJ5LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRWaWRlb0RldGFpbHM7XG5cblZpZGVvRGV0YWlscyA9IE1lZGlhRGV0YWlscy5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGlkOiAgICAgICd2aWRlbycsXG5cdFx0dXJsOiAgICAgJycsXG5cdFx0bWVudTogICAgJ3ZpZGVvLWRldGFpbHMnLFxuXHRcdGNvbnRlbnQ6ICd2aWRlby1kZXRhaWxzJyxcblx0XHR0b29sYmFyOiAndmlkZW8tZGV0YWlscycsXG5cdFx0dHlwZTogICAgJ2xpbmsnLFxuXHRcdHRpdGxlOiAgICBsMTBuLnZpZGVvRGV0YWlsc1RpdGxlLFxuXHRcdHByaW9yaXR5OiAxMjBcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRvcHRpb25zLkRldGFpbHNWaWV3ID0gd3AubWVkaWEudmlldy5WaWRlb0RldGFpbHM7XG5cdFx0b3B0aW9ucy5jYW5jZWxUZXh0ID0gbDEwbi52aWRlb0RldGFpbHNDYW5jZWw7XG5cdFx0b3B0aW9ucy5hZGRUZXh0ID0gbDEwbi52aWRlb0FkZFNvdXJjZVRpdGxlO1xuXG5cdFx0TWVkaWFEZXRhaWxzLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwoIHRoaXMsIG9wdGlvbnMgKTtcblx0fSxcblxuXHRiaW5kSGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdE1lZGlhRGV0YWlscy5wcm90b3R5cGUuYmluZEhhbmRsZXJzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdHRoaXMub24oICd0b29sYmFyOnJlbmRlcjpyZXBsYWNlLXZpZGVvJywgdGhpcy5yZW5kZXJSZXBsYWNlVG9vbGJhciwgdGhpcyApO1xuXHRcdHRoaXMub24oICd0b29sYmFyOnJlbmRlcjphZGQtdmlkZW8tc291cmNlJywgdGhpcy5yZW5kZXJBZGRTb3VyY2VUb29sYmFyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6cmVuZGVyOnNlbGVjdC1wb3N0ZXItaW1hZ2UnLCB0aGlzLnJlbmRlclNlbGVjdFBvc3RlckltYWdlVG9vbGJhciwgdGhpcyApO1xuXHRcdHRoaXMub24oICd0b29sYmFyOnJlbmRlcjphZGQtdHJhY2snLCB0aGlzLnJlbmRlckFkZFRyYWNrVG9vbGJhciwgdGhpcyApO1xuXHR9LFxuXG5cdGNyZWF0ZVN0YXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdGF0ZXMuYWRkKFtcblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLlZpZGVvRGV0YWlscyh7XG5cdFx0XHRcdG1lZGlhOiB0aGlzLm1lZGlhXG5cdFx0XHR9KSxcblxuXHRcdFx0bmV3IE1lZGlhTGlicmFyeSgge1xuXHRcdFx0XHR0eXBlOiAndmlkZW8nLFxuXHRcdFx0XHRpZDogJ3JlcGxhY2UtdmlkZW8nLFxuXHRcdFx0XHR0aXRsZTogbDEwbi52aWRlb1JlcGxhY2VUaXRsZSxcblx0XHRcdFx0dG9vbGJhcjogJ3JlcGxhY2UtdmlkZW8nLFxuXHRcdFx0XHRtZWRpYTogdGhpcy5tZWRpYSxcblx0XHRcdFx0bWVudTogJ3ZpZGVvLWRldGFpbHMnXG5cdFx0XHR9ICksXG5cblx0XHRcdG5ldyBNZWRpYUxpYnJhcnkoIHtcblx0XHRcdFx0dHlwZTogJ3ZpZGVvJyxcblx0XHRcdFx0aWQ6ICdhZGQtdmlkZW8tc291cmNlJyxcblx0XHRcdFx0dGl0bGU6IGwxMG4udmlkZW9BZGRTb3VyY2VUaXRsZSxcblx0XHRcdFx0dG9vbGJhcjogJ2FkZC12aWRlby1zb3VyY2UnLFxuXHRcdFx0XHRtZWRpYTogdGhpcy5tZWRpYSxcblx0XHRcdFx0bWVudTogZmFsc2Vcblx0XHRcdH0gKSxcblxuXHRcdFx0bmV3IE1lZGlhTGlicmFyeSgge1xuXHRcdFx0XHR0eXBlOiAnaW1hZ2UnLFxuXHRcdFx0XHRpZDogJ3NlbGVjdC1wb3N0ZXItaW1hZ2UnLFxuXHRcdFx0XHR0aXRsZTogbDEwbi52aWRlb1NlbGVjdFBvc3RlckltYWdlVGl0bGUsXG5cdFx0XHRcdHRvb2xiYXI6ICdzZWxlY3QtcG9zdGVyLWltYWdlJyxcblx0XHRcdFx0bWVkaWE6IHRoaXMubWVkaWEsXG5cdFx0XHRcdG1lbnU6ICd2aWRlby1kZXRhaWxzJ1xuXHRcdFx0fSApLFxuXG5cdFx0XHRuZXcgTWVkaWFMaWJyYXJ5KCB7XG5cdFx0XHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHRcdFx0aWQ6ICdhZGQtdHJhY2snLFxuXHRcdFx0XHR0aXRsZTogbDEwbi52aWRlb0FkZFRyYWNrVGl0bGUsXG5cdFx0XHRcdHRvb2xiYXI6ICdhZGQtdHJhY2snLFxuXHRcdFx0XHRtZWRpYTogdGhpcy5tZWRpYSxcblx0XHRcdFx0bWVudTogJ3ZpZGVvLWRldGFpbHMnXG5cdFx0XHR9IClcblx0XHRdKTtcblx0fSxcblxuXHRyZW5kZXJTZWxlY3RQb3N0ZXJJbWFnZVRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0UHJpbWFyeUJ1dHRvbiggbDEwbi52aWRlb1NlbGVjdFBvc3RlckltYWdlVGl0bGUsIGZ1bmN0aW9uKCBjb250cm9sbGVyLCBzdGF0ZSApIHtcblx0XHRcdHZhciB1cmxzID0gW10sIGF0dGFjaG1lbnQgPSBzdGF0ZS5nZXQoICdzZWxlY3Rpb24nICkuc2luZ2xlKCk7XG5cblx0XHRcdGNvbnRyb2xsZXIubWVkaWEuc2V0KCAncG9zdGVyJywgYXR0YWNobWVudC5nZXQoICd1cmwnICkgKTtcblx0XHRcdHN0YXRlLnRyaWdnZXIoICdzZXQtcG9zdGVyLWltYWdlJywgY29udHJvbGxlci5tZWRpYS50b0pTT04oKSApO1xuXG5cdFx0XHRfLmVhY2goIHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MuZW1iZWRFeHRzLCBmdW5jdGlvbiAoZXh0KSB7XG5cdFx0XHRcdGlmICggY29udHJvbGxlci5tZWRpYS5nZXQoIGV4dCApICkge1xuXHRcdFx0XHRcdHVybHMucHVzaCggY29udHJvbGxlci5tZWRpYS5nZXQoIGV4dCApICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblxuXHRcdFx0d3AuYWpheC5zZW5kKCAnc2V0LWF0dGFjaG1lbnQtdGh1bWJuYWlsJywge1xuXHRcdFx0XHRkYXRhIDoge1xuXHRcdFx0XHRcdHVybHM6IHVybHMsXG5cdFx0XHRcdFx0dGh1bWJuYWlsX2lkOiBhdHRhY2htZW50LmdldCggJ2lkJyApXG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9ICk7XG5cdH0sXG5cblx0cmVuZGVyQWRkVHJhY2tUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFByaW1hcnlCdXR0b24oIGwxMG4udmlkZW9BZGRUcmFja1RpdGxlLCBmdW5jdGlvbiggY29udHJvbGxlciwgc3RhdGUgKSB7XG5cdFx0XHR2YXIgYXR0YWNobWVudCA9IHN0YXRlLmdldCggJ3NlbGVjdGlvbicgKS5zaW5nbGUoKSxcblx0XHRcdFx0Y29udGVudCA9IGNvbnRyb2xsZXIubWVkaWEuZ2V0KCAnY29udGVudCcgKTtcblxuXHRcdFx0aWYgKCAtMSA9PT0gY29udGVudC5pbmRleE9mKCBhdHRhY2htZW50LmdldCggJ3VybCcgKSApICkge1xuXHRcdFx0XHRjb250ZW50ICs9IFtcblx0XHRcdFx0XHQnPHRyYWNrIHNyY2xhbmc9XCJlblwiIGxhYmVsPVwiRW5nbGlzaFwia2luZD1cInN1YnRpdGxlc1wiIHNyYz1cIicsXG5cdFx0XHRcdFx0YXR0YWNobWVudC5nZXQoICd1cmwnICksXG5cdFx0XHRcdFx0J1wiIC8+J1xuXHRcdFx0XHRdLmpvaW4oJycpO1xuXG5cdFx0XHRcdGNvbnRyb2xsZXIubWVkaWEuc2V0KCAnY29udGVudCcsIGNvbnRlbnQgKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlLnRyaWdnZXIoICdhZGQtdHJhY2snLCBjb250cm9sbGVyLm1lZGlhLnRvSlNPTigpICk7XG5cdFx0fSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWRlb0RldGFpbHM7XG4iLCIvKmdsb2JhbCB3cCwgalF1ZXJ5LCBfLCBNZWRpYUVsZW1lbnRQbGF5ZXIgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRGV0YWlsc1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXlcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBBdHRhY2htZW50RGlzcGxheSA9IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXksXG5cdCQgPSBqUXVlcnksXG5cdE1lZGlhRGV0YWlscztcblxuTWVkaWFEZXRhaWxzID0gQXR0YWNobWVudERpc3BsYXkuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5iaW5kQWxsKHRoaXMsICdzdWNjZXNzJyk7XG5cdFx0dGhpcy5wbGF5ZXJzID0gW107XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnY2xvc2UnLCB3cC5tZWRpYS5taXhpbi51bnNldFBsYXllcnMgKTtcblx0XHR0aGlzLm9uKCAncmVhZHknLCB0aGlzLnNldFBsYXllciApO1xuXHRcdHRoaXMub24oICdtZWRpYTpzZXR0aW5nOnJlbW92ZScsIHdwLm1lZGlhLm1peGluLnVuc2V0UGxheWVycywgdGhpcyApO1xuXHRcdHRoaXMub24oICdtZWRpYTpzZXR0aW5nOnJlbW92ZScsIHRoaXMucmVuZGVyICk7XG5cdFx0dGhpcy5vbiggJ21lZGlhOnNldHRpbmc6cmVtb3ZlJywgdGhpcy5zZXRQbGF5ZXIgKTtcblx0XHR0aGlzLmV2ZW50cyA9IF8uZXh0ZW5kKCB0aGlzLmV2ZW50cywge1xuXHRcdFx0J2NsaWNrIC5yZW1vdmUtc2V0dGluZycgOiAncmVtb3ZlU2V0dGluZycsXG5cdFx0XHQnY2hhbmdlIC5jb250ZW50LXRyYWNrJyA6ICdzZXRUcmFja3MnLFxuXHRcdFx0J2NsaWNrIC5yZW1vdmUtdHJhY2snIDogJ3NldFRyYWNrcycsXG5cdFx0XHQnY2xpY2sgLmFkZC1tZWRpYS1zb3VyY2UnIDogJ2FkZFNvdXJjZSdcblx0XHR9ICk7XG5cblx0XHRBdHRhY2htZW50RGlzcGxheS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF8uZGVmYXVsdHMoe1xuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWwudG9KU09OKClcblx0XHR9LCB0aGlzLm9wdGlvbnMgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVtb3ZlIGEgc2V0dGluZydzIFVJIHdoZW4gdGhlIG1vZGVsIHVuc2V0cyBpdFxuXHQgKlxuXHQgKiBAZmlyZXMgd3AubWVkaWEudmlldy5NZWRpYURldGFpbHMjbWVkaWE6c2V0dGluZzpyZW1vdmVcblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZVxuXHQgKi9cblx0cmVtb3ZlU2V0dGluZyA6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgd3JhcCA9ICQoIGUuY3VycmVudFRhcmdldCApLnBhcmVudCgpLCBzZXR0aW5nO1xuXHRcdHNldHRpbmcgPSB3cmFwLmZpbmQoICdpbnB1dCcgKS5kYXRhKCAnc2V0dGluZycgKTtcblxuXHRcdGlmICggc2V0dGluZyApIHtcblx0XHRcdHRoaXMubW9kZWwudW5zZXQoIHNldHRpbmcgKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ21lZGlhOnNldHRpbmc6cmVtb3ZlJywgdGhpcyApO1xuXHRcdH1cblxuXHRcdHdyYXAucmVtb3ZlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqXG5cdCAqIEBmaXJlcyB3cC5tZWRpYS52aWV3Lk1lZGlhRGV0YWlscyNtZWRpYTpzZXR0aW5nOnJlbW92ZVxuXHQgKi9cblx0c2V0VHJhY2tzIDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRyYWNrcyA9ICcnO1xuXG5cdFx0Xy5lYWNoKCB0aGlzLiQoJy5jb250ZW50LXRyYWNrJyksIGZ1bmN0aW9uKHRyYWNrKSB7XG5cdFx0XHR0cmFja3MgKz0gJCggdHJhY2sgKS52YWwoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLm1vZGVsLnNldCggJ2NvbnRlbnQnLCB0cmFja3MgKTtcblx0XHR0aGlzLnRyaWdnZXIoICdtZWRpYTpzZXR0aW5nOnJlbW92ZScsIHRoaXMgKTtcblx0fSxcblxuXHRhZGRTb3VyY2UgOiBmdW5jdGlvbiggZSApIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIubGFzdE1pbWUgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKS5kYXRhKCAnbWltZScgKTtcblx0XHR0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoICdhZGQtJyArIHRoaXMuY29udHJvbGxlci5kZWZhdWx0cy5pZCArICctc291cmNlJyApO1xuXHR9LFxuXG5cdGxvYWRQbGF5ZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnBsYXllcnMucHVzaCggbmV3IE1lZGlhRWxlbWVudFBsYXllciggdGhpcy5tZWRpYSwgdGhpcy5zZXR0aW5ncyApICk7XG5cdFx0dGhpcy5zY3JpcHRYaHIgPSBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogQGdsb2JhbCBNZWRpYUVsZW1lbnRQbGF5ZXJcblx0ICovXG5cdHNldFBsYXllciA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBiYXNlU2V0dGluZ3M7XG5cblx0XHRpZiAoIHRoaXMucGxheWVycy5sZW5ndGggfHwgISB0aGlzLm1lZGlhIHx8IHRoaXMuc2NyaXB0WGhyICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5tb2RlbC5nZXQoICdzcmMnICkuaW5kZXhPZiggJ3ZpbWVvJyApID4gLTEgJiYgISAoICdGcm9vZ2Fsb29wJyBpbiB3aW5kb3cgKSApIHtcblx0XHRcdGJhc2VTZXR0aW5ncyA9IHdwLm1lZGlhLm1peGluLm1lanNTZXR0aW5ncztcblx0XHRcdHRoaXMuc2NyaXB0WGhyID0gJC5nZXRTY3JpcHQoIGJhc2VTZXR0aW5ncy5wbHVnaW5QYXRoICsgJ2Zyb29nYWxvb3AubWluLmpzJywgXy5iaW5kKCB0aGlzLmxvYWRQbGF5ZXIsIHRoaXMgKSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxvYWRQbGF5ZXIoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhYnN0cmFjdFxuXHQgKi9cblx0c2V0TWVkaWEgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRzdWNjZXNzIDogZnVuY3Rpb24obWVqcykge1xuXHRcdHZhciBhdXRvcGxheSA9IG1lanMuYXR0cmlidXRlcy5hdXRvcGxheSAmJiAnZmFsc2UnICE9PSBtZWpzLmF0dHJpYnV0ZXMuYXV0b3BsYXk7XG5cblx0XHRpZiAoICdmbGFzaCcgPT09IG1lanMucGx1Z2luVHlwZSAmJiBhdXRvcGxheSApIHtcblx0XHRcdG1lanMuYWRkRXZlbnRMaXN0ZW5lciggJ2NhbnBsYXknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0bWVqcy5wbGF5KCk7XG5cdFx0XHR9LCBmYWxzZSApO1xuXHRcdH1cblxuXHRcdHRoaXMubWVqcyA9IG1lanM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHttZWRpYS52aWV3Lk1lZGlhRGV0YWlsc30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0QXR0YWNobWVudERpc3BsYXkucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRzZXRUaW1lb3V0KCBfLmJpbmQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5yZXNldEZvY3VzKCk7XG5cdFx0fSwgdGhpcyApLCAxMCApO1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IF8uZGVmYXVsdHMoIHtcblx0XHRcdHN1Y2Nlc3MgOiB0aGlzLnN1Y2Nlc3Ncblx0XHR9LCB3cC5tZWRpYS5taXhpbi5tZWpzU2V0dGluZ3MgKTtcblxuXHRcdHJldHVybiB0aGlzLnNldE1lZGlhKCk7XG5cdH0sXG5cblx0cmVzZXRGb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCAnLmVtYmVkLW1lZGlhLXNldHRpbmdzJyApLnNjcm9sbFRvcCggMCApO1xuXHR9XG59LCB7XG5cdGluc3RhbmNlcyA6IDAsXG5cdC8qKlxuXHQgKiBXaGVuIG11bHRpcGxlIHBsYXllcnMgaW4gdGhlIERPTSBjb250YWluIHRoZSBzYW1lIHNyYywgdGhpbmdzIGdldCB3ZWlyZC5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbVxuXHQgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG5cdCAqL1xuXHRwcmVwYXJlU3JjIDogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0dmFyIGkgPSBNZWRpYURldGFpbHMuaW5zdGFuY2VzKys7XG5cdFx0Xy5lYWNoKCAkKCBlbGVtICkuZmluZCggJ3NvdXJjZScgKSwgZnVuY3Rpb24oIHNvdXJjZSApIHtcblx0XHRcdHNvdXJjZS5zcmMgPSBbXG5cdFx0XHRcdHNvdXJjZS5zcmMsXG5cdFx0XHRcdHNvdXJjZS5zcmMuaW5kZXhPZignPycpID4gLTEgPyAnJicgOiAnPycsXG5cdFx0XHRcdCdfPScsXG5cdFx0XHRcdGlcblx0XHRcdF0uam9pbignJyk7XG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIGVsZW07XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lZGlhRGV0YWlscztcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuVmlkZW9EZXRhaWxzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYURldGFpbHNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzLkF0dGFjaG1lbnREaXNwbGF5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5nc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgTWVkaWFEZXRhaWxzID0gd3AubWVkaWEudmlldy5NZWRpYURldGFpbHMsXG5cdFZpZGVvRGV0YWlscztcblxuVmlkZW9EZXRhaWxzID0gTWVkaWFEZXRhaWxzLmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ3ZpZGVvLWRldGFpbHMnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCd2aWRlby1kZXRhaWxzJyksXG5cblx0c2V0TWVkaWE6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB2aWRlbyA9IHRoaXMuJCgnLndwLXZpZGVvLXNob3J0Y29kZScpO1xuXG5cdFx0aWYgKCB2aWRlby5maW5kKCAnc291cmNlJyApLmxlbmd0aCApIHtcblx0XHRcdGlmICggdmlkZW8uaXMoJzpoaWRkZW4nKSApIHtcblx0XHRcdFx0dmlkZW8uc2hvdygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICEgdmlkZW8uaGFzQ2xhc3MoICd5b3V0dWJlLXZpZGVvJyApICYmICEgdmlkZW8uaGFzQ2xhc3MoICd2aW1lby12aWRlbycgKSApIHtcblx0XHRcdFx0dGhpcy5tZWRpYSA9IE1lZGlhRGV0YWlscy5wcmVwYXJlU3JjKCB2aWRlby5nZXQoMCkgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubWVkaWEgPSB2aWRlby5nZXQoMCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZpZGVvLmhpZGUoKTtcblx0XHRcdHRoaXMubWVkaWEgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlkZW9EZXRhaWxzO1xuIl19
