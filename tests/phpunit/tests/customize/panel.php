<?php

/**
 * Tests for the WP_Customize_Manager class.
 *
 * @group customize
 */
class Tests_WP_Customize_Panel extends WP_UnitTestCase {

	/**
	 * @var WP_Customize_Manager
	 */
	protected $manager;

	function setUp() {
		parent::setUp();
		require_once( ABSPATH . WPINC . '/class-wp-customize-manager.php' );
		$GLOBALS['wp_customize'] = new WP_Customize_Manager();
		$this->manager = $GLOBALS['wp_customize'];
		$this->undefined = new stdClass();
	}

	function tearDown() {
		$this->manager = null;
		unset( $GLOBALS['wp_customize'] );
		parent::tearDown();
	}

	function test_construct() {
		$panel = new WP_Customize_Panel( $this->manager, 'foo' );
		$this->assertInternalType( 'int', $panel->instance_number );
		$this->assertEquals( $this->manager, $panel->manager );
		$this->assertEquals( 'foo', $panel->id );
		$this->assertEquals( 160, $panel->priority );
		$this->assertEquals( 'edit_theme_options', $panel->capability );
		$this->assertEquals( '', $panel->theme_supports );
		$this->assertEquals( '', $panel->title );
		$this->assertEquals( '', $panel->description );
		$this->assertEmpty( $panel->sections );
		$this->assertEquals( 'default', $panel->type );
		$this->assertEquals( array( $panel, 'active_callback' ), $panel->active_callback );

	}
}
