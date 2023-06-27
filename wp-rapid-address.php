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

add_action('wp_enqueue_scripts', 'wpra_enqueue_scripts');
function wpra_enqueue_scripts()
{
	wp_enqueue_script(
		'wp_rapid_address',
		plugin_dir_url(__FILE__) . 'js/wpra.js',
		array(),
		'0.1.0'
	);

	$nonce = wp_create_nonce('wp_rapid_address');
	wp_localize_script(
		'wp_rapid_address',
		'ajaxWPRA',
		array(
			'endpoint' => admin_url('admin-ajax.php'),
			'nonce' => $nonce
		)
	);

	wp_enqueue_style(
		'wp_rapid_address',
		plugin_dir_url(__FILE__) . 'css/style.css',
		'0.1.0'
	);
}

add_action('wp_ajax_address_suggestions', 'wpra_suggestions_endpoint');
add_action('wp_ajax_nopriv_address_suggestions', 'wpra_suggestions_endpoint');
function wpra_suggestions_endpoint()
{
	check_ajax_referer('wp_rapid_address');
	$query = wpra_parse_query();
	$data = wpra_find_entries($query);
	wp_send_json($data);
}

add_action('wp_ajax_address_datalists', 'wpra_datalists_endpoint');
add_action('wp_ajax_nopriv_address_datalists', 'wpra_datalists_endpoint');
function wpra_datalists_endpoint()
{
	check_ajax_referer('wp_rapid_address');
	$query = wpra_parse_query();
	$data = wpra_list_values($query);
	wp_send_json($data);
}

function wpra_parse_query()
{
	$query = [];
	if (isset($_POST['zipcode']) && $_POST['zipcode'] != 'false') {
		$query['zipcode'] = $_POST['zipcode'];
	}

	for ($i = 1; $i < 5; $i++) {
		$key = 'level_' . $i;
		if (!isset($_POST[$key]) || $_POST[$key] == 'false') continue;
		$query[$key] = $_POST[$key];
	}

	return $query;
}

function wpra_open_db()
{
	$db_path = plugin_dir_path(__FILE__) . '/database.json';
	$file = fopen($db_path, 'r');
	$content = fread($file, filesize($db_path));
	fclose($file);
	return json_decode($content, true);
}

function wpra_find_entries($query)
{
	$db = wpra_open_db();
	$entries = [];
	foreach ($db as $entry) {
		$match = array_reduce(array_keys($query), function ($carry, $key) use ($query, $entry) {
			return $carry && $entry[$key] == $query[$key];
		}, true);
		if ($match) $entries[] = $entry;
	}

	return $entries;
}

function wpra_list_values($query)
{
	$db = wpra_open_db();
	$response = [];
	foreach ($db as $entry) {
		foreach (array_keys($query) as $field) {
			$response[$field] = isset($response[$field]) ? $response[$field] : [];
			$response[$field][$entry[$field]] = true;
		}
	}

	foreach (array_keys($response) as $field) {
		$response[$field] = array_keys($response[$field]);
	}

	return $response;
}
