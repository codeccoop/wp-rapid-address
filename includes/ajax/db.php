<?php

add_action('wp_ajax_wpra_get_db', 'wpra_get_db');
function wpra_get_db()
{
	check_ajax_referer('wpra_admin_ajax');
	$file_path = plugin_dir_path(__FILE__) . '../../database.json';
	header('Content-Disposition: attachment; filename="wpradb.json"');
	readfile($file_path);
	wp_die();
}

add_action('wp_ajax_wpra_post_db', 'wpra_post_db');
function wpra_post_db()
{
	check_ajax_referer('wpra_admin_ajax');
	$file_path = plugin_dir_path(__FILE__) . '../../database.json';
	$success = move_uploaded_file($_FILES['file']['tmp_name'], $file_path);
	wp_send_json(["success" => $success]);
}
