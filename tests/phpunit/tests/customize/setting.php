<?php

/**
 * Tests for the WP_Customize_Setting class.
 *
 * @group customize
 */
class Tests_WP_Customize_Setting extends WP_UnitTestCase {

	/**
	 * @var WP_Customize_Manager
	 */
	protected $manager;

	/**
	 * @var stdClass an instance which serves as a symbol to do identity checks with
	 */
	public $undefined;

	function setUp() {
		parent::setUp();
		require_once( ABSPATH . WPINC . '/class-wp-customize-manager.php' );
		$GLOBALS['wp_customize'] = new WP_Customize_Manager(); // wpcs: override ok
		$this->manager = $GLOBALS['wp_customize'];
		$this->undefined = new stdClass();
	}

	function tearDown() {
		parent::tearDown();
		$this->manager = null;
		unset( $GLOBALS['wp_customize'] );
	}

	function test_construct() {
		$foo = new WP_Customize_Setting( $this->manager, 'foo' );
		$this->assertEquals( $this->manager, $foo->manager );
		$this->assertEquals( 'foo', $foo->id );
		$this->assertEquals( 'theme_mod', $foo->type );
		$this->assertEquals( 'edit_theme_options', $foo->capability );
		$this->assertEquals( '', $foo->theme_supports );
		$this->assertEquals( '', $foo->default );
		$this->assertEquals( 'refresh', $foo->transport );
		$this->assertEquals( '', $foo->sanitize_callback );
		$this->assertEquals( '', $foo->sanitize_js_callback );
		$this->assertFalse( has_filter( "customize_sanitize_{$foo->id}" ) );
		$this->assertFalse( has_filter( "customize_sanitize_js_{$foo->id}" ) );

		$args = array(
			'type' => 'option',
			'capability' => 'edit_posts',
			'theme_supports' => 'widgets',
			'default' => 'barbar',
			'transport' => 'postMessage',
			'sanitize_callback' => create_function( '$value', 'return $value . ":sanitize_callback";' ),
			'sanitize_js_callback' => create_function( '$value', 'return $value . ":sanitize_js_callback";' ),
		);
		$bar = new WP_Customize_Setting( $this->manager, 'bar', $args );
		$this->assertEquals( 'bar', $bar->id );
		foreach ( $args as $key => $value ) {
			$this->assertEquals( $value, $bar->$key );
		}
		$this->assertEquals( 10, has_filter( "customize_sanitize_{$bar->id}", $args['sanitize_callback'] ) );
		$this->assertEquals( 10, has_filter( "customize_sanitize_js_{$bar->id}" ), $args['sanitize_js_callback'] );
	}

	public $post_data_overrides = array(
		'unset_option_overridden' => 'unset_option_post_override_value',
		'unset_theme_mod_overridden' => 'unset_theme_mod_post_override_value',
		'set_option_overridden' => 'set_option_post_override_value',
		'set_theme_mod_overridden' => 'set_theme_mod_post_override_value',
		'unset_option_multi_overridden[foo]' => 'unset_option_multi_overridden[foo]_post_override_value',
		'unset_theme_mod_multi_overridden[foo]' => 'unset_theme_mod_multi_overridden[foo]_post_override_value',
		'set_option_multi_overridden[foo]' => 'set_option_multi_overridden[foo]_post_override_value',
		'set_theme_mod_multi_overridden[foo]' => 'set_theme_mod_multi_overridden[foo]_post_override_value',
	);

	public $standard_type_configs = array(
		'option' => array(
			'getter' => 'get_option',
			'setter' => 'update_option',
		),
		'theme_mod' => array(
			'getter' => 'get_theme_mod',
			'setter' => 'set_theme_mod',
		),
	);

	/**
	 * Run assertions on non-multidimensional standard settings
	 */
	function test_preview_standard_types_non_multidimensional() {

		// @todo this is hacky. The manager should provide a mechanism to override the post_values
		$_POST['customized'] = wp_slash( wp_json_encode( $this->post_data_overrides ) );

		// Try non-multidimensional settings
		foreach ( $this->standard_type_configs as $type => $type_options ) {
			// Non-multidimensional: See what effect the preview filter has on a non-existent setting (default value should be seen)
			$name = "unset_{$type}_without_post_value";
			$default = "default_value_{$name}";
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$this->assertEquals( $this->undefined, call_user_func( $type_options['getter'], $name, $this->undefined ) );
			$this->assertEquals( $default, $setting->value() );
			$setting->preview();
			$this->assertEquals( $default, call_user_func( $type_options['getter'], $name, $this->undefined ), sprintf( 'Expected %s(%s) to return setting default: %s.', $type_options['getter'], $name, $default ) );
			$this->assertEquals( $default, $setting->value() );

			// Non-multidimensional: See what effect the preview has on an extant setting (default value should not be seen)
			$name = "set_{$type}_without_post_value";
			$default = "default_value_{$name}";
			$initial_value = "initial_value_{$name}";
			call_user_func( $type_options['setter'], $name, $initial_value );
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$this->assertEquals( $initial_value, call_user_func( $type_options['getter'], $name ) );
			$this->assertEquals( $initial_value, $setting->value() );
			$setting->preview();
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->id}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->type}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( $initial_value, call_user_func( $type_options['getter'], $name ) );
			$this->assertEquals( $initial_value, $setting->value() );

			// @todo What if we call the setter after preview() is called? If no post_value, should the new set value be stored? If that happens, then the following 3 assertions should be inverted
			$overridden_value = "overridden_value_$name";
			call_user_func( $type_options['setter'], $name, $overridden_value );
			$this->assertEquals( $initial_value, call_user_func( $type_options['getter'], $name ) );
			$this->assertEquals( $initial_value, $setting->value() );
			$this->assertNotEquals( $overridden_value, $setting->value() );

			// Non-multidimensional: Test unset setting being overridden by a post value
			$name = "unset_{$type}_overridden";
			$default = "default_value_{$name}";
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$this->assertEquals( $this->undefined, call_user_func( $type_options['getter'], $name, $this->undefined ) );
			$this->assertEquals( $default, $setting->value() );
			$setting->preview(); // activate post_data
			$this->assertEquals( $this->post_data_overrides[ $name ], call_user_func( $type_options['getter'], $name, $this->undefined ) );
			$this->assertEquals( $this->post_data_overrides[ $name ], $setting->value() );

			// Non-multidimensional: Test set setting being overridden by a post value
			$name = "set_{$type}_overridden";
			$default = "default_value_{$name}";
			$initial_value = "initial_value_{$name}";
			call_user_func( $type_options['setter'], $name, $initial_value );
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$this->assertEquals( $initial_value, call_user_func( $type_options['getter'], $name, $this->undefined ) );
			$this->assertEquals( $initial_value, $setting->value() );
			$setting->preview(); // activate post_data
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->id}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->type}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( $this->post_data_overrides[ $name ], call_user_func( $type_options['getter'], $name, $this->undefined ) );
			$this->assertEquals( $this->post_data_overrides[ $name ], $setting->value() );
		}
	}

	/**
	 * Run assertions on multidimensional standard settings
	 */
	function test_preview_standard_types_multidimensional() {
		// @todo this is hacky. The manager should provide a mechanism to override the post_values
		$_POST['customized'] = wp_slash( wp_json_encode( $this->post_data_overrides ) );

		foreach ( $this->standard_type_configs as $type => $type_options ) {
			// Multidimensional: See what effect the preview filter has on a non-existent setting (default value should be seen)
			$base_name = "unset_{$type}_multi";
			$name = $base_name . '[foo]';
			$default = "default_value_{$name}";
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$this->assertEquals( $this->undefined, call_user_func( $type_options['getter'], $base_name, $this->undefined ) );
			$this->assertEquals( $default, $setting->value() );
			$setting->preview();
			$base_value = call_user_func( $type_options['getter'], $base_name, $this->undefined );
			$this->assertArrayHasKey( 'foo', $base_value );
			$this->assertEquals( $default, $base_value['foo'] );

			// Multidimensional: See what effect the preview has on an extant setting (default value should not be seen)
			$base_name = "set_{$type}_multi";
			$name = $base_name . '[foo]';
			$default = "default_value_{$name}";
			$initial_value = "initial_value_{$name}";
			$base_initial_value = array( 'foo' => $initial_value, 'bar' => 'persisted' );
			call_user_func( $type_options['setter'], $base_name, $base_initial_value );
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$base_value = call_user_func( $type_options['getter'], $base_name, array() );
			$this->assertEquals( $initial_value, $base_value['foo'] );
			$this->assertEquals( $initial_value, $setting->value() );
			$setting->preview();
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->id}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->type}" ) ); // only applicable for custom types (not options or theme_mods)
			$base_value = call_user_func( $type_options['getter'], $base_name, array() );
			$this->assertEquals( $initial_value, $base_value['foo'] );
			$this->assertEquals( $initial_value, $setting->value() );

			// Multidimensional: Test unset setting being overridden by a post value
			$base_name = "unset_{$type}_multi_overridden";
			$name = $base_name . '[foo]';
			$default = "default_value_{$name}";
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$this->assertEquals( $this->undefined, call_user_func( $type_options['getter'], $base_name, $this->undefined ) );
			$this->assertEquals( $default, $setting->value() );
			$setting->preview();
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->id}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->type}" ) ); // only applicable for custom types (not options or theme_mods)
			$base_value = call_user_func( $type_options['getter'], $base_name, $this->undefined );
			$this->assertArrayHasKey( 'foo', $base_value );
			$this->assertEquals( $this->post_data_overrides[ $name ], $base_value['foo'] );

			// Multidimemsional: Test set setting being overridden by a post value
			$base_name = "set_{$type}_multi_overridden";
			$name = $base_name . '[foo]';
			$default = "default_value_{$name}";
			$initial_value = "initial_value_{$name}";
			$base_initial_value = array( 'foo' => $initial_value, 'bar' => 'persisted' );
			call_user_func( $type_options['setter'], $base_name, $base_initial_value );
			$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
			$base_value = call_user_func( $type_options['getter'], $base_name, $this->undefined );
			$this->arrayHasKey( 'foo', $base_value );
			$this->arrayHasKey( 'bar', $base_value );
			$this->assertEquals( $base_initial_value['foo'], $base_value['foo'] );
			$this->assertEquals( $base_initial_value['bar'], call_user_func( $type_options['getter'], $base_name, $this->undefined )['bar'] );
			$this->assertEquals( $initial_value, $setting->value() );
			$setting->preview();
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->id}" ) ); // only applicable for custom types (not options or theme_mods)
			$this->assertEquals( 0, did_action( "customize_preview_{$setting->type}" ) ); // only applicable for custom types (not options or theme_mods)
			$base_value = call_user_func( $type_options['getter'], $base_name, $this->undefined );
			$this->assertArrayHasKey( 'foo', $base_value );
			$this->assertEquals( $this->post_data_overrides[ $name ], $base_value['foo'] );
			$this->arrayHasKey( 'bar', call_user_func( $type_options['getter'], $base_name, $this->undefined ) );
			$this->assertEquals( $base_initial_value['bar'], call_user_func( $type_options['getter'], $base_name, $this->undefined )['bar'] );
		}
	}

	/**
	 * @var array storage for saved custom type data that are tested in self::test_preview_custom_type()
	 */
	protected $custom_type_data_saved;

	/**
	 * @var array storage for previewed custom type data that are tested in self::test_preview_custom_type()
	 */
	protected $custom_type_data_previewed;

	function custom_type_getter( $name, $default = null ) {
		if ( did_action( "customize_preview_{$name}" ) && array_key_exists( $name, $this->custom_type_data_previewed ) ) {
			$value = $this->custom_type_data_previewed[ $name ];
		} else if ( array_key_exists( $name, $this->custom_type_data_saved ) ) {
			$value = $this->custom_type_data_saved[ $name ];
		} else {
			$value = $default;
		}
		return $value;
	}

	function custom_type_setter( $name, $value ) {
		$this->custom_type_data_saved[ $name ] = $value;
	}

	function custom_type_value_filter( $default ) {
		$name = preg_replace( '/^customize_value_/', '', current_filter() );
		return $this->custom_type_getter( $name, $default );
	}

	/**
	 * @var WP_Customize_Setting $setting
	 */
	function custom_type_preview( $setting ) {
		$previewed_value = $setting->post_value( $this->undefined );
		if ( $this->undefined !== $previewed_value ) {
			$this->custom_type_data_previewed[ $setting->id ] = $previewed_value;
		}
	}

	function test_preview_custom_type() {
		$type = 'custom_type';
		$post_data_overrides = array(
			"unset_{$type}_with_post_value" => "unset_{$type}_without_post_value",
			"set_{$type}_with_post_value" => "set_{$type}_without_post_value",
		);
		$_POST['customized'] = wp_slash( wp_json_encode( $post_data_overrides ) );

		$this->custom_type_data_saved = array();
		$this->custom_type_data_previewed = array();

		add_action( "customize_preview_{$type}", array( $this, custom_type_preview ) );

		// Custom type not existing and no post value override
		$name = "unset_{$type}_without_post_value";
		$default = "default_value_{$name}";
		$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
		// Note: #29316 will allow us to have one filter for all settings of a given type, which is what we need

		add_filter( "customize_value_{$name}", array( $this, 'custom_type_value_filter' ) );
		$this->assertEquals( $this->undefined, $this->custom_type_getter( $name, $this->undefined ) );
		$this->assertEquals( $default, $setting->value() );
		$setting->preview();
		$this->assertEquals( 1, did_action( "customize_preview_{$setting->id}" ) );
		$this->assertEquals( 1, did_action( "customize_preview_{$setting->type}" ) );
		$this->assertEquals( $this->undefined, $this->custom_type_getter( $name, $this->undefined ) ); // Note: for a non-custom type this is $default
		$this->assertEquals( $default, $setting->value() ); // should be same as above

		// Custom type existing and no post value override
		$name = "set_{$type}_without_post_value";
		$default = "default_value_{$name}";
		$initial_value = "initial_value_{$name}";
		$this->custom_type_setter( $name, $initial_value );
		$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
		// Note: #29316 will allow us to have one filter for all settings of a given type, which is what we need
		add_filter( "customize_value_{$name}", array( $this, 'custom_type_value_filter' ) );
		$this->assertEquals( $initial_value, $this->custom_type_getter( $name, $this->undefined ) );
		$this->assertEquals( $initial_value, $setting->value() );
		$setting->preview();
		$this->assertEquals( 1, did_action( "customize_preview_{$setting->id}" ) );
		$this->assertEquals( 2, did_action( "customize_preview_{$setting->type}" ) );
		$this->assertEquals( $initial_value, $this->custom_type_getter( $name, $this->undefined ) ); // should be same as above
		$this->assertEquals( $initial_value, $setting->value() ); // should be same as above

		// Custom type not existing and with a post value override
		$name = "unset_{$type}_with_post_value";
		$default = "default_value_{$name}";
		$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
		// Note: #29316 will allow us to have one filter for all settings of a given type, which is what we need
		add_filter( "customize_value_{$name}", array( $this, 'custom_type_value_filter' ) );
		$this->assertEquals( $this->undefined, $this->custom_type_getter( $name, $this->undefined ) );
		$this->assertEquals( $default, $setting->value() );
		$setting->preview();
		$this->assertEquals( 1, did_action( "customize_preview_{$setting->id}" ) );
		$this->assertEquals( 3, did_action( "customize_preview_{$setting->type}" ) );
		$this->assertEquals( $post_data_overrides[ $name ], $this->custom_type_getter( $name, $this->undefined ) );
		$this->assertEquals( $post_data_overrides[ $name ], $setting->value() );

		// Custom type not existing and with a post value override
		$name = "set_{$type}_with_post_value";
		$default = "default_value_{$name}";
		$initial_value = "initial_value_{$name}";
		$this->custom_type_setter( $name, $initial_value );
		$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
		// Note: #29316 will allow us to have one filter for all settings of a given type, which is what we need
		add_filter( "customize_value_{$name}", array( $this, 'custom_type_value_filter' ) );
		$this->assertEquals( $initial_value, $this->custom_type_getter( $name, $this->undefined ) );
		$this->assertEquals( $initial_value, $setting->value() );
		$setting->preview();
		$this->assertEquals( 1, did_action( "customize_preview_{$setting->id}" ) );
		$this->assertEquals( 4, did_action( "customize_preview_{$setting->type}" ) );
		$this->assertEquals( $post_data_overrides[ $name ], $this->custom_type_getter( $name, $this->undefined ) );
		$this->assertEquals( $post_data_overrides[ $name ], $setting->value() );

		unset( $this->custom_type_data_previewed, $this->custom_type_data_saved );
	}

	/**
	 * Test specific fix for setting's default value not applying on preview window
	 *
	 * @ticket 30988
	 */
	function test_non_posted_setting_applying_default_value_in_preview() {
		$type = 'option';
		$name = 'unset_option_without_post_value';
		$default = "default_value_{$name}";
		$setting = new WP_Customize_Setting( $this->manager, $name, compact( 'type', 'default' ) );
		$this->assertEquals( $this->undefined, get_option( $name, $this->undefined ) );
		$this->assertEquals( $default, $setting->value() );
		$setting->preview();
		$this->assertEquals( $default, get_option( $name, $this->undefined ), sprintf( 'Expected get_option(%s) to return setting default: %s.', $name, $default ) );
		$this->assertEquals( $default, $setting->value() );
	}

	// @todo function test_save() {
	// @todo test do_action( 'customize_save_' . $this->id_data[ 'base' ], $this );
	// @todo test_post_value()
	// @todo test_sanitize( $value )
	// @todo apply_filters( "customize_sanitize_{$this->id}", $value, $this );
	// @todo function update( $value )
	// @todo test_value()
	// @todo test customize_value_{$name} filter
	// @todo test_js_value()
	// @todo test apply_filters( "customize_sanitize_js_{$this->id}", $this->value(), $this );
	// @todo test_check_capabilities() {

	// @todo final protected function multidimensional( &$root, $keys, $create = false )
	// @todo final protected function multidimensional_replace( $root, $keys, $value )
	// @todo final protected function multidimensional_get( $root, $keys, $default = null ) {
	// @todo final protected function multidimensional_isset( $root, $keys )
}

