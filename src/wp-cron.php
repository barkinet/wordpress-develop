<?php
/**
 * WordPress Cron Implementation for hosts, which do not offer CRON or for which
 * the user has not set up a CRON job pointing to this file.
 *
 * The HTTP request to this file will not slow down the visitor who happens to
 * visit when the cron job is needed to run.
 *
 * @package WordPress
 */

ignore_user_abort( true );

if ( defined( 'DOING_AJAX' ) || defined( 'DOING_CRON' ) ) {
	die( 'doing_ajax_or_doing_cron' );
}

/**
 * Tell WordPress we are doing the CRON task.
 *
 * @var bool
 */
define( 'DOING_CRON', true );

if ( ! defined( 'ABSPATH' ) ) {
	/** Set up WordPress environment */
	require_once( dirname( __FILE__ ) . '/wp-load.php' );
}

/**
 * Default handler for a WP Cron exit
 *
 * @param string $code
 */
function wp_cron_default_exit_handler( $code ) {
	do_action( 'wp_cron_response_close', $code );
	if ( 'bad_post_request_or_doing_ajax_or_doing_cron' === $code ) {
		$response = 400;
	} elseif ( 'empty_cron_array' === $code ) {
		$response = 204;
	} elseif ( 'no_scheduled_actions_due' === $code ) {
		$response = 204;
	} elseif ( 'cron_locked' === $code ) {
		$response = 403;
	} elseif ( 'cron_lock_check_fail' === $code ) {
		$response = 400;
	} elseif ( 'ok_exit_prematurely' === $code ) {
		$response = 200;
	} elseif ( 'ok' === $code ) {
		$response = 200;
	} else {
		$response = 500;
	}
	if ( ! headers_sent() ) {
		header( 'Content-Type: text/plain' );
		status_header( $response );
	}
	wp_die( $code, '', compact( $response ) );
}

/**
 * @var string $wp_cron_exit_handler
 * @todo docs
 */
$wp_cron_exit_handler = apply_filters( 'wp_cron_exit_handler', 'wp_cron_default_exit_handler' );

if ( ! empty( $_POST ) ) {
	$wp_cron_exit_handler( 'bad_post_request' );
}

// Uncached doing_cron transient fetch
function _get_cron_lock() {
	global $wpdb;

	$value = 0;
	if ( wp_using_ext_object_cache() ) {
		/*
		 * Skip local cache and force re-fetch of doing_cron transient
		 * in case another process updated the cache.
		 */
		$value = wp_cache_get( 'doing_cron', 'transient', true );
	} else {
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT option_value FROM $wpdb->options WHERE option_name = %s LIMIT 1", '_transient_doing_cron' ) );
		if ( is_object( $row ) ) {
			$value = $row->option_value;
		}
	}

	return $value;
}

if ( false === $crons = _get_cron_array() ) {
	$wp_cron_exit_handler( 'empty_cron_array' );
}

$keys = array_keys( $crons );
$gmt_time = microtime( true );

if ( isset( $keys[0] ) && $keys[0] > $gmt_time ) {
	$wp_cron_exit_handler( 'no_scheduled_actions_due' );
}

$doing_cron_transient = get_transient( 'doing_cron' );

// Use global $doing_wp_cron lock otherwise use the GET lock. If no lock, trying grabbing a new lock.
if ( empty( $doing_wp_cron ) ) {
	if ( empty( $_GET['doing_wp_cron'] ) ) {
		// Called from external script/job. Try setting a lock.
		if ( $doing_cron_transient && ( $doing_cron_transient + WP_CRON_LOCK_TIMEOUT > $gmt_time ) ) {
			$wp_cron_exit_handler( 'cron_locked' );
		}
		$doing_cron_transient = $doing_wp_cron = sprintf( '%.22F', microtime( true ) );
		set_transient( 'doing_cron', $doing_wp_cron );
	} else {
		$doing_wp_cron = $_GET['doing_wp_cron'];
	}
}

// Check lock
if ( $doing_cron_transient != $doing_wp_cron ) {
	$wp_cron_exit_handler( 'cron_lock_check_fail' );
}

/**
 * @todo docs
 */
do_action( 'wp_cron_before_crons_loop', $crons );
foreach ( $crons as $timestamp => $cronhooks ) {
	if ( $timestamp > $gmt_time ) {
		break;
	}

	/**
	 * @todo docs
	 */
	do_action( 'wp_cron_before_cronhooks_loop', $cronhooks );
	foreach ( $cronhooks as $hook => $keys ) {

		/**
		 * @todo docs
		 */
		do_action( 'wp_cron_before_keys_loop', $keys );
		foreach ( $keys as $k => $v ) {

			$schedule = $v['schedule'];

			if ( $schedule != false ) {
				$new_args = array( $timestamp, $schedule, $hook, $v['args'] );
				call_user_func_array( 'wp_reschedule_event', $new_args );
			}

			wp_unschedule_event( $timestamp, $hook, $v['args'] );

			/**
			 * @todo docs
			 */
			do_action( 'wp_cron_before_hook', $hook, $v['args'], $schedule, $timestamp );

			/**
			 * Fires scheduled events.
			 *
			 * @internal
			 * @since 2.1.0
			 *
			 * @param string $hook Name of the hook that was scheduled to be fired.
			 * @param array  $args The arguments to be passed to the hook.
			 */
			do_action_ref_array( $hook, $v['args'] );

			/**
			 * @todo docs
			 */
			do_action( 'wp_cron_after_hook', $hook, $v['args'], $schedule, $timestamp );

			// If the hook ran too long and another cron process stole the lock, quit.
			if ( _get_cron_lock() != $doing_wp_cron ) {
				$wp_cron_exit_handler( 'ok_exit_prematurely' );
			}
		}

		/**
		 * @todo docs
		 */
		do_action( 'wp_cron_after_keys_loop', $keys );
	}

	/**
	 * @todo docs
	 */
	do_action( 'wp_cron_after_cronhooks_loop', $cronhooks );
}
/**
 * @todo docs
 */
do_action( 'wp_cron_after_crons_loop', $crons );

if ( _get_cron_lock() == $doing_wp_cron ) {
	delete_transient( 'doing_cron' );
}

$wp_cron_exit_handler( 'ok' );
