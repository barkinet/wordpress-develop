<?php
/**
 * encoding: utf-8
 */

/**
 * @group formatting
 */
class Tests_Formatting_DecodeEntities extends WP_UnitTestCase {

	function setUp() {
		parent::setUp();
		if ( 'UTF-8' !== strtoupper( get_bloginfo( 'charset' ) ) ) {
			$this->markTestSkipped( 'Blog must be in UTF-8 since this is the encoding used in the source file.' );
		}
	}

	function test_decode_quotes() {
		$encoded = 'This&#39;s &quot;the&#34; thing&apos;s thing.';
		$decoded = 'This\'s "the" thing\'s thing.';
		$this->assertEquals( $decoded, wp_decode_entities( $encoded ) );
	}

	function test_decode_non_ascii() {
		$encoded = 'This&rsquo;s &ldquo;the&#8221; thing&#8217;s thing.';
		$decoded = 'This’s “the” thing’s thing.';
		$this->assertEquals( $decoded, wp_decode_entities( $encoded ) );
	}
}
