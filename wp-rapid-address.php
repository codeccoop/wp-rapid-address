<?php

/**
 * Plugin Name:     WP Rapid Address
 * Plugin URI:      https://github.com/codeccoop/wp-rapid-address
 * Description:     Form address suggestions
 * Author:          Còdec Coop
 * Author URI:      https://www.codeccoop.org
 * Text Domain:     wp-rapid-address
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         WP_Rapid_Address
 */

require_once 'includes/ajax/suggestions.php';
require_once 'includes/ajax/db.php';
require_once 'includes/options-page.php';

add_action('wp_enqueue_scripts', 'wpra_enqueue_scripts');
function wpra_enqueue_scripts()
{
	wp_enqueue_script(
		'wpra',
		plugin_dir_url(__FILE__) . 'js/wpra.js',
		array(),
		'0.1.0'
	);

	wp_localize_script(
		'wpra',
		'ajaxWPRA',
		array(
			'endpoint' => admin_url('admin-ajax.php'),
			'strictMode' => get_option('wpra_strict_mode') === 'on' ? 1 : 0,
		)
	);

	wp_enqueue_style(
		'wpra',
		plugin_dir_url(__FILE__) . 'css/style.css',
		'0.1.0'
	);
}

add_action('admin_enqueue_scripts', 'wpra_enqueue_admin_scripts');
function wpra_enqueue_admin_scripts()
{
	if (is_admin()) {
		wp_enqueue_script(
			'wpra-admin',
			plugin_dir_url(__FILE__) . 'js/admin.js',
			array(),
			'0.1.0'
		);
		wp_localize_script(
			'wpra-admin',
			'ajaxWPRA',
			array(
				'endpoint' => admin_url('admin-ajax.php'),
				'nonce' => wp_create_nonce('wpra_admin_ajax')
			)
		);

		wp_enqueue_style(
			'wpra-admin',
			plugin_dir_url(__FILE__) . 'css/admin.css',
			'0.1.0'
		);
	}
}
