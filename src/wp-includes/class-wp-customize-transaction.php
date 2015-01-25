<?php
/**
 * Customize Transaction Class
 *
 * Implements transactions for Customizer settings
 *
 * @package WordPress
 * @subpackage Customize
 * @since 4.2.0
 */
class WP_Customize_Transaction {

	const POST_TYPE = 'wp_transaction';

	/**
	 * WP_Customize_Manager instance.
	 *
	 * @since 4.2.0
	 * @access public
	 * @var WP_Customize_Manager
	 */
	public $manager;

	/**
	 * @since 4.2.0
	 * @access public
	 * @var string
	 */
	public $uuid;

	/**
	 * @var WP_Post|null
	 */
	protected $post = null;

	/**
	 * @var array
	 */
	protected $data = array();

	/**
	 * Initial loader.
	 *
	 * @since 4.2.0
	 * @access public
	 *
	 * @param WP_Customize_Manager $manager Customize manager bootstrap instance.
	 * @param string $uuid
	 */
	public function __construct( $manager, $uuid = null ) {
		$this->manager = $manager;

		if ( $uuid && self::is_valid_uuid( $uuid ) ) {
			$this->uuid = $uuid;
		} else {
			$this->uuid = self::generate_uuid();
		}

		$post = $this->post();
		if ( ! $post ) {
			$this->data = array();
		} else {
			// for reason why base64 encoding is used, see WP_Customize_Transaction::save()
			$this->data = json_decode( base64_decode( $post->post_content ), true );

			if ( ! empty( $this->data ) ) {
				// For back-compat
				if ( ! did_action( 'setup_theme' ) ) {
					/*
					 * Note we have to defer until setup_theme since the transaction
					 * can be set beforehand, and wp_magic_quotes() would not have
					 * been called yet, resulting in a $_POST['customized'] that is
					 * double-escaped. Note that this happens at priority 1, which
					 * is immediately after WP_Customize_Manager::store_customized_post_data
					 * which happens at setup_theme priority 0, so that the initial
					 * POST data can be preserved.
					 */
					add_action( 'setup_theme', array( $this, 'populate_customized_post_var' ), 1 );
				} else {
					$this->populate_customized_post_var();
				}
			}
		}
	}

	/**
	 * Populate $_POST['customized'] wth the transaction's data for back-compat.
	 *
	 * Plugins used to have to dynamically register settings by inspecting the
	 * $_POST['customized'] var and manually re-parse and inspect to see if it
	 * contains settings that wouldn't be registered otherwise. This ensures
	 * that these plugins will continue to work.
	 *
	 * Note that this can't be called prior to the setup_theme action or else
	 * magic quotes may end up getting added twice.
	 *
	 * @since 4.2.0
	 */
	public function populate_customized_post_var() {
		$_POST['customized'] = add_magic_quotes( wp_json_encode( $this->data ) );
		$_REQUEST['customized'] = $_POST['customized'];
	}

	/**
	 * Generate a customizer transaction uuid
	 *
	 * @since 4.2.0
	 *
	 * @return string
	 */
	static public function generate_uuid() {
		return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
			mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
			mt_rand( 0, 0xffff ),
			mt_rand( 0, 0x0fff ) | 0x4000,
			mt_rand( 0, 0x3fff ) | 0x8000,
			mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
		);
	}

	/**
	 * Determine whether the supplied UUID is in the right format.
	 *
	 * @param string $uuid
	 *
	 * @since 4.2.0
	 *
	 * @return bool
	 */
	static public function is_valid_uuid( $uuid ) {
		return 0 !== preg_match( '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $uuid );
	}

	/**
	 * Get the wp_customize_transaction post associated with the provided UUID, or null if it does not exist.
	 *
	 * @since 4.2.0
	 *
	 * @return WP_Post|null
	 */
	public function post() {
		if ( $this->post ) {
			return $this->post;
		}

		$post_stati = array_merge(
			array( 'any' ),
			array_values( get_post_stati( array( 'exclude_from_search' => true ) ) )
		);

		add_action( 'pre_get_posts', array( $this, '_override_wp_query_is_single' ) );
		$posts = get_posts( array(
			'name' => $this->uuid,
			'posts_per_page' => 1,
			'post_type' => self::POST_TYPE,
			'post_status' => $post_stati,
		) );
		remove_action( 'pre_get_posts', array( $this, '_override_wp_query_is_single' ) );

		if ( empty( $posts ) ) {
			$this->post = null;
		} else {
			$this->post = array_shift( $posts );
		}
		return $this->post;
	}

	/**
	 * This is needed to ensure that draft posts can be queried by name.
	 *
	 * @since 4.2.0
	 *
	 * @param WP_Query $query
	 */
	public function _override_wp_query_is_single( $query ) {
		$query->is_single = false;
	}

	/**
	 * Get the value for a setting in the transaction.
	 *
	 * @since 4.2.0
	 *
	 * @param WP_Customize_Setting|string $setting
	 * @return mixed
	 */
	public function get( $setting ) {
		if ( is_string( $setting ) ) {
			$setting_obj = $this->manager->get_setting( $setting );
			if ( $setting_obj ) {
				$setting_id = $setting_obj->id;
				$setting = $setting_obj;
			} else {
				$setting_id = $setting;
				$setting = null;
			}
			unset( $setting_obj );
		} else {
			$setting_id = $setting->id;
		}
		/**
		 * @var WP_Customize_Setting|null $setting
		 * @var string $setting_id
		 */

		if ( ! isset( $this->data[ $setting_id ] ) ) {
			return null;
		}

		$value = $this->data[ $setting_id ];

		unset( $setting );
		// @todo if ( $setting ) { $setting->sanitize( wp_slash( $value ) ); } ?

		return $value;
	}

	/**
	 * Return all settings' values in the transaction.
	 *
	 * @since 4.2.0
	 *
	 * @return array
	 */
	public function data() {
		// @todo just return $this->data; ?
		$values = array();
		foreach ( array_keys( $this->data ) as $setting_id ) {
			$values[ $setting_id ] = $this->get( $setting_id );
		}
		return $values;
	}

	/**
	 * Return the Customizer settings corresponding to the data contained in the transaction.
	 *
	 * @since 4.2.0
	 *
	 * @return WP_Customize_Setting[]
	 */
	public function settings() {
		$settings = array();
		foreach ( array_keys( $this->data ) as $setting_id ) {
			$setting = $this->manager->get_setting( $setting_id );
			if ( $setting ) {
				$settings[] = $setting;
			}
		}
		return $settings;
	}

	/**
	 * Get the status of the transaction.
	 *
	 * @since 4.2.0
	 *
	 * @return string|null
	 */
	public function status() {
		return $this->post ? get_post_status( $this->post->ID ) : null;
	}

	/**
	 * Store a setting's sanitized value in the transaction's data.
	 *
	 * @since 4.2.0
	 *
	 * @param WP_Customize_Setting $setting
	 * @param mixed $value Must be JSON-serializable
	 */
	public function set( WP_Customize_Setting $setting, $value ) {
		$value = wp_slash( $value ); // WP_Customize_Setting::sanitize() erroneously does wp_unslash again
		$value = $setting->sanitize( $value );
		$this->data[ $setting->id ] = $value;
	}

	/**
	 * Return whether the transaction was saved (created/inserted) yet.
	 *
	 * @since 4.2.0
	 *
	 * @return bool
	 */
	public function saved() {
		return ! empty( $this->post );
	}

	/**
	 * Persist the data in the transaction in the transaction post content.
	 *
	 * @since 4.2.0
	 *
	 * @param string $status
	 *
	 * @return null|WP_Error
	 */
	public function save( $status = 'draft' ) {

		$options = 0;
		if ( defined( 'JSON_UNESCAPED_SLASHES' ) ) {
			$options |= JSON_UNESCAPED_SLASHES;
		}
		if ( defined( 'JSON_PRETTY_PRINT' ) ) {
			$options |= JSON_PRETTY_PRINT;
		}

		$post_content = wp_json_encode( $this->data, $options );

		/*
		 * base64-encoding is used to prevent corruption of data due to slashing
		 * and due to wp_kses and other formatting filters transforming the
		 * content on save via the content_save_pre filter. This will ensure
		 * that settings which contain HTML won't get corrupted when the user
		 * cannot do unfiltered_html.
		 */
		$post_content = base64_encode( $post_content );

		if ( ! $this->post ) {
			$postarr = array(
				'post_type' => self::POST_TYPE,
				'post_name' => $this->uuid,
				'post_status' => $status,
				'post_author' => get_current_user_id(),
				'post_content' => $post_content,
			);
			$r = wp_insert_post( $postarr, true );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
			$this->post = get_post( $r );
		} else {
			$postarr = array(
				'ID' => $this->post->ID,
				'post_content' => wp_slash( $post_content ),
				'post_status' => $status,
			);
			$r = wp_update_post( $postarr, true );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}

		/*
		 * See _wp_customize_transaction_publish() in theme.php for the behaviors
		 * associated with the publish_wp_transaction action. The logic is
		 * located there to facilitate scheduling wp_transaction posts for
		 * future-publishing, which happens during WP Cron when the Customizer
		 * is not normally booted up.
		 */

		return null;
	}
}
