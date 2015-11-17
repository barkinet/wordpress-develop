<?php
/**
 * Customize API: WP_Customize_Nav_Menu_Location_Control class
 *
 * @package WordPress
 * @subpackage Customize
 * @since 4.4.0
 */

/**
 * Customize Menu Location Control Class.
 *
 * This custom control is only needed for JS.
 *
 * @since 4.3.0
 *
 * @see WP_Customize_Control
 */
class WP_Customize_Nav_Menu_Location_Control extends WP_Customize_Control {

	/**
	 * Control type.
	 *
	 * @since 4.3.0
	 * @access public
	 * @var string
	 */
	public $type = 'nav_menu_location';

	/**
	 * Location ID.
	 *
	 * @since 4.3.0
	 * @access public
	 * @var string
	 */
	public $location_id = '';

	/**
	 * Refresh the parameters passed to JavaScript via JSON.
	 *
	 * @since 4.3.0
	 * @access public
	 *
	 * @see WP_Customize_Control::to_json()
	 */
	public function to_json() {
		parent::to_json();
		$this->json['locationId'] = $this->location_id;
	}

	/**
	 * Render content just like a normal select control.
	 *
	 * @since 4.3.0
	 * @access public
	 */
	public function render_content() {
		if ( empty( $this->choices ) ) {
			return;
		}
		$input_id = '_customize-input-nav_menu_locations-' . $this->location_id;
		$description_id = '_customize-description-nav_menu_locations-' . $this->location_id;
		$describedby = ( ! empty( $this->description ) ) ? 'aria-describedby="' . esc_attr( $description_id ). '"' : '';
		?>

		<?php if ( ! empty( $this->label ) ) : ?>
		<label for="<?php echo esc_attr( $input_id ); ?>">
			<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
		</label>
		<?php endif; ?>

		<?php if ( ! empty( $this->description ) ) : ?>
		<span id="<?php echo esc_attr( $description_id ); ?>" class="description customize-control-description"><?php echo $this->description; ?></span>
		<?php endif; ?>

		<select  id="<?php echo esc_attr( $input_id ); ?>" <?php $this->link(); ?> <?php echo $describedby; ?>>
			<?php
			foreach ( $this->choices as $value => $label ) :
				echo '<option value="' . esc_attr( $value ) . '"' . selected( $this->value(), $value, false ) . '>' . $label . '</option>';
			endforeach;
			?>
		</select>
		
		<?php
	}
}
