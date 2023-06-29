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
	echo '<form class="wpra-admin-form" method="get">';
	echo '<h2>Database</h2>';
	echo '<table class="form-table" role="presentation"><tbody><tr><th scope="row">Download</th><td><label>';
	echo '<input type="text" placeholder="Export name" />';
	echo '<input type="submit" value="Get" class="button button-primary" />';
	echo '</label></td></tr></tbody></table>';
	echo '<p class="wpra-error"><strong>Can\'t download the db file</strong></p>';
	echo '</form>';
	echo '<form class="wpra-admin-form" method="post">';
	echo '<table class="form-table" role="presentation"><tbody><tr><th scope="row">Upload</th><td><label>';
	echo '<input type="file" name="file" accept="application/json" required/>';
	echo '<input type="submit" value="Post" class="button button-primary"/><br>';
	echo '</label></td></tr></tbody></table>';
	echo '<p class="wpra-error"><strong>Can\'t submit the your file</strong></p>';
	echo '</form>';
	echo '</div>';
}

add_action('admin_init', 'wpra_init_settings', 50);
function wpra_init_settings()
{
	register_setting(
		'wpra',
		'wpra_strict_mode',
		array(
			'type' => 'array',
			'description' => __('Strict Mode', 'wpra'),
			'show_in_rest' => false,
			'default' => true
		)
	);

	add_settings_section(
		'wpra_setings',
		__('Settings', 'wpra'),
		null,
		'wpra'
	);

	add_settings_field(
		'wpra_strict_mode',
		__('Strict Mode', 'wpra'),
		function () {
			$value = get_option('wpra_strict_mode', true);
			echo '<label for="wpra_strict_mode">';
			echo '<input type="checkbox" name="wpra_strict_mode"' . ($value ? 'checked="true"' : '') . ' />';
			echo '<span><em>Block responses that are not in the database</em></span>';
		},
		'wpra',
		'wpra_setings'
	);
}
