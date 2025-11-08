<?php
/**
 * Security class
 *
 * @package Divi
 * @since ??
 */

namespace ET\Builder\Security;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use ET\Builder\Security\DynamicContent\DynamicContentFixes;
use ET\Builder\Security\AttributeSecurity\AttributeSecurity;
use ET\Builder\Framework\DependencyManagement\DependencyTree;


/**
 * Security Class.
 *
 * This class is responsible for loading all the security functionalities. It accepts
 * a DependencyTree on construction, specifying the dependencies and their priorities for loading.
 *
 * @since ??
 *
 * @param DependencyTree $dependencyTree The dependency tree instance specifying the dependencies and priorities.
 */
class Security {
	/**
	 * Stores the dependencies that were passed to the constructor.
	 *
	 * This property holds an instance of the DependencyTree class that represents the dependencies
	 * passed to the constructor of the current object.
	 *
	 * @since ??
	 *
	 * @var DependencyTree $dependencies An instance of DependencyTree representing the dependencies.
	 */
	private $_dependency_tree;

	/**
	 * Constructs a new instance of the class and sets its dependencies.
	 *
	 * @param DependencyTree $dependency_tree The dependency tree for the class to load.
	 *
	 * @since ??
	 *
	 * @return void
	 *
	 * @example
	 * ```php
	 * $dependency_tree = new DependencyTree();
	 * $security = new Security($dependency_tree);
	 * ```
	 */
	public function __construct( DependencyTree $dependency_tree ) {
		$this->_dependency_tree = $dependency_tree;
	}

	/**
	 * Loads and initializes all the functionalities related to the Security area.
	 *
	 * @since ??
	 *
	 * @return void
	 */
	public function initialize() {
		$this->_dependency_tree->load_dependencies();

		// Fix Unicode corruption from third-party plugins (like Duplicate Page).
		add_filter( 'wp_insert_post_data', array( __CLASS__, 'fix_unicode_corruption' ), 1, 2 );

		// Security Audit - elegantthemes/Divi#41951 .
		add_filter( 'wp_insert_post_data', array( $this, 'sanitize_dynamic_content_fields' ), 10, 2 );

		// Custom attribute sanitization - always runs regardless of user capabilities.
		add_filter( 'wp_insert_post_data', array( $this, 'sanitize_custom_attributes_fields' ), 5, 2 );
	}

	/**
	 * Fix Unicode corruption from third-party plugins during post insertion.
	 *
	 * Some plugins (like Duplicate Page) corrupt Unicode escape sequences by calling
	 * parse_blocks() + serialize_blocks() which strips backslashes from specific Unicode patterns.
	 * This filter detects and repairs that corruption for the exact set of sequences that
	 * WordPress Core's serialize_block_attributes() can mangle during JSON transitions.
	 *
	 * Only the following sequences are repaired (aligned with Core's behavior):
	 * - u002d → \u002d (hyphen/dash -)
	 * - u003c → \u003c (less than <)
	 * - u003e → \u003e (greater than >)
	 * - u0026 → \u0026 (ampersand &)
	 * - u0022 → \u0022 (double quote ")
	 * 
	 * Security Note:
	 * This regex repair function is safe from XSS or injection risks. It does not decode or introduce raw 
	 * HTML; it simply restores missing backslashes (u003c → \u003c) in corrupted Unicode escape 
     * sequences to maintain JSON validity. No user-facing rendering or sanitization behavior changes.
	 *
	 * @see https://github.com/WordPress/wordpress-develop/blob/97382397b2bd7c85aef6d4cd1c10bafd397957fc/src/wp-includes/blocks.php#L1603
	 *
	 * @since ??
	 *
	 * @param array $data    An array of slashed post data.
	 * @param array $postarr An array of sanitized attachment post data.
	 *
	 * @return array $data Modified post data.
	 */
	public static function fix_unicode_corruption( $data, $postarr ) {
		// Only process Divi content.
		if ( empty( $data['post_content'] ) || false === strpos( $data['post_content'], 'wp:divi/' ) ) {
			return $data;
		}

		$content = wp_unslash( $data['post_content'] );

		// Quick check: look for "u00" which is common to corrupted sequences.
		if ( false === strpos( $content, 'u00' ) ) {
			return $data;
		}

		// Fix only the specific Unicode sequences that Core's serialize_block_attributes() can mangle.
		// Pattern: (?<!\\)u(002[2d]|003[ce]|0026).
		// - (?<!\\) = Negative lookbehind: Don't match if preceded by backslash (prevents double escaping).
		// - u(002[2d]|003[ce]|0026) = Match only: u002d, u0022, u003c, u003e, u0026.
		// Note: Case-insensitive flag handles both uppercase/lowercase hex digits.
		// Note: No lookahead needed - JSON parsers always consume exactly 4 hex digits after \u, so u003cab correctly becomes \u003cab which parses as \u003c (<) + "ab".
		$fixed_content = preg_replace( '/(?<!\\\\)u(002[2dD]|003[ceE]|0026)/i', '\\\\u$1', $content );

		if ( $fixed_content !== $content ) {
			$data['post_content'] = wp_slash( $fixed_content );
		}

		return $data;
	}

	/**
	 * Sanitize dynamic content on save.
	 *
	 * Check on save post if the user has the unfiltered_html capability,
	 * if they do, we can bail, because they can save whatever they want,
	 * if they don't, we need to strip the enable_html flag from the dynamic content item,
	 * and then re-encode it, and put the new value back in the post content.
	 *
	 * @since ??
	 *
	 * @param array $data  An array of slashed post data.
	 *
	 * @return array $data Modified post data.
	 */
	public function sanitize_dynamic_content_fields( $data ) {
		// Exit early if there's nothing to fix or user has `unfiltered_html` capability.
		if ( strpos( $data['post_content'], 'enable_html' ) === false || current_user_can( 'unfiltered_html' ) ) {
			return $data;
		}

		return DynamicContentFixes::disable_html( $data );
	}

	/**
	 * Sanitize custom attributes on save.
	 *
	 * This function ensures that custom module attributes are properly sanitized
	 * regardless of user capabilities. Custom attributes are a security feature
	 * and should always be validated against the HTMLUtility whitelist.
	 *
	 * @since ??
	 *
	 * @param array $data  An array of slashed post data.
	 *
	 * @return array $data Modified post data.
	 */
	public function sanitize_custom_attributes_fields( $data ) {
		return AttributeSecurity::sanitize_custom_attributes_fields( $data );
	}

}

// Class doesn't have any dependencies yet but it might in the future.
$dependency_tree = new DependencyTree();

$security = new Security( $dependency_tree );

$security->initialize();
