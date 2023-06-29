<?php

add_action('admin_menu', 'wpra_options_page');
function wpra_options_page()
{
	add_options_page(
		'WP Rapid Address',
		'WP Rapid Address',
		'manage_options',
		'wpra',
		'wpra_options_render'
	);
}

function wpra_options_render()
{
	echo '<div class="wrap">';
	echo '<h1>WP Rapid Address</h1>';
	echo '<form action="options.php" method="post">';
	settings_fields('wpra');
	do_settings_sections('wpra');
	submit_button();
	echo '</form>';
	echo '<form class="wpra-db-form" method="get">';
	echo '<h2>Database</h2>';
	echo '<label>Download the current database</label>';
	echo '<input type="submit" value="Get" class="button button-primary" />';
	echo '</form>';
	echo '<form class="wpra-db-form" method="post">';
	echo '<label>Upload a new file</label>';
	echo '<input type="submit" value="Post" class="button button-primary"/><br>';
	echo '<input type="file" name="file" accept="application/json" required/>';
	echo '</form>';
	echo '</div>';
}

add_action('admin_init', 'wpra_init_settings', 50);
function wpra_init_settings()
{
	register_setting(
		'wpra',
		'wpra_strict_method',
		array(
			'type' => 'array',
			'description' => __('Strict Method', 'wpra'),
			'show_in_rest' => false,
			'default' => true
		)
	);

	add_settings_section(
		'wpra_setings',
		__('Settings', 'wpra'),
		function () {
			echo __('Settings', 'wpra');
		},
		'wpra'
	);

	add_settings_field(
		'wpra_strict_method',
		__('Strict Method', 'wpra'),
		function () {
			$value = get_option('wpra_strict_method', true);
			echo '<label for="wpra_strict_method">';
			echo '<input type="checkbox" name="wpra_strict_method"' . ($value ? 'checked="true"' : '') . ' />';
		},
		'wpra',
		'wpra_setings'
	);
}
