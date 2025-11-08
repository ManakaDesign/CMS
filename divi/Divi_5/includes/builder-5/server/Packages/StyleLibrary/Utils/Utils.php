<?php
/**
 * StyleLibrary\Utils class
 *
 * @package Divi
 * @since ??
 */

namespace ET\Builder\Packages\StyleLibrary\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use ET\Builder\Packages\GlobalData\GlobalData;

/**
 * Utils class is a helper class with helper methods to work with the style library.
 *
 * @since ??
 */
class Utils {
	/**
	 * Join array of declarations into `;` separated string, suffixed by `;`.
	 *
	 * This function is equivalent of JS function:
	 * {@link /docs/builder-api/js/style-library/join-declarations joinDeclarations} in:
	 * `@divi/style-library` package.
	 *
	 * @since ??
	 *
	 * @param array $declarations Array of declarations.
	 *
	 * @return string
	 */
	public static function join_declarations( array $declarations ): string {
		$joined = implode( '; ', $declarations );

		if ( 0 < count( $declarations ) ) {
			$joined = $joined . ';';
		}

		return $joined;
	}

	/**
	 * Recursively resolve any `$variable(...)$` strings within an array or string.
	 *
	 * @since ??
	 *
	 * @param mixed $value The raw input, string or array.
	 *
	 * @return mixed The resolved value with all dynamic variables normalized.
	 */
	public static function resolve_dynamic_variables_recursive( $value ) {
		if ( ! is_array( $value ) ) {
			return self::resolve_dynamic_variable( $value );
		}

		foreach ( $value as $key => $subvalue ) {
			$value[ $key ] = self::resolve_dynamic_variables_recursive( $subvalue );
		}

		return $value;
	}

	/**
	 * Resolves a `$variable(...)$` encoded dynamic content string into a CSS variable.
	 *
	 * Example:
	 * Input:  $variable({"type":"content","value":{"name":"gvid-abc123"}})$
	 * Output: var(--gvid-abc123)
	 *
	 * @since ??
	 *
	 * @param string $value The raw string to be resolved.
	 *
	 * @return string The resolved CSS variable or original value if not matched.
	 */
	public static function resolve_dynamic_variable( $value ) {
		if ( is_string( $value ) && preg_match( '/^\$variable\((.+)\)\$$/', $value, $matches ) ) {
			$decoded = json_decode( $matches[1], true );
			$type    = $decoded['type'] ?? '';
			$name    = $decoded['value']['name'] ?? null;

			if ( $name ) {
				$css_variable = "var(--{$name})";

				switch ( $type ) {
					case 'color':
						return GlobalData::transform_state_into_global_color_value( $css_variable, $decoded['value']['settings'] ?? [] );
					default:
						return $css_variable;
				}
			}
		}

		return $value;
	}

	/**
	 * Helper function to resolve nested global colors and global variables to actual color values.
	 * This ensures SVG elements get concrete color values instead of CSS variables or variable syntax.
	 *
	 * Handles all global color formats including:
	 * - CSS variables: var(--gcid-xxx)
	 * - Variable syntax: $variable({"type":"color","value":{"name":"gcid-xxx","settings":{...}}})$
	 * - HSL with variables: hsl(from var(--gcid-xxx) calc(h + 0) calc(s + 0) calc(l + 0) / 0.2)
	 * - Nested global colors: Global colors that reference other global colors
	 * - Multiple levels of nesting with recursive resolution
	 *
	 * @param string $color The input color value (could be global color ID, $variable syntax, CSS variable, or nested reference).
	 * @param int    $depth Current recursion depth to prevent infinite loops.
	 * @return string The resolved concrete color value or original color if not a global color.
	 */
	public static function resolve_global_color_to_value( $color, $depth = 0 ) {
		// Input validation.
		if ( ! is_string( $color ) || empty( $color ) ) {
			return $color;
		}

		// Maximum recursion depth to prevent infinite loops.
		$max_depth = 10;

		if ( $depth >= $max_depth ) {
			return $color;
		}

		// Check if it's a global color (either CSS variable or $variable syntax).
		$global_color_id    = GlobalData::get_global_color_id_from_value( $color );
		$is_variable_syntax = 0 === strpos( $color, '$variable(' ) && '$' === substr( $color, -1 );

		if ( ! $global_color_id && ! $is_variable_syntax ) {
			return $color; // Not a global color, return as-is.
		}

		// Resolve the global color variable (handles nested references).
		$resolved_color = GlobalData::resolve_global_color_variable( $color );

		// Safety check: ensure resolved color is valid.
		if ( ! is_string( $resolved_color ) || empty( $resolved_color ) ) {
			return $color;
		}

		// If still contains CSS variable, get the raw color value.
		if ( false !== strpos( $resolved_color, 'var(--' ) && $global_color_id ) {
			$color_data = GlobalData::get_global_color_by_id( $global_color_id );
			if ( is_array( $color_data ) && isset( $color_data['color'] ) && ! empty( $color_data['color'] ) ) {
				$resolved_color = $color_data['color'];
			}
		}

		// If still contains nested $variable syntax, resolve recursively.
		if ( false !== strpos( $resolved_color, '$variable(' ) ) {
			$resolved_color = self::resolve_global_color_to_value( $resolved_color, $depth + 1 );
		}

		// Return original color if resolution failed.
		return ( is_string( $resolved_color ) && ! empty( $resolved_color ) ) ? $resolved_color : $color;
	}
}
