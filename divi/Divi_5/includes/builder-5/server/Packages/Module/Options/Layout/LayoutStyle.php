<?php
/**
 * Module: LayoutStyle class.
 *
 * @package Divi
 * @since ??
 */

namespace ET\Builder\Packages\Module\Options\Layout;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use ET\Builder\Packages\Module\Layout\Components\Style\Utils\Utils;
use ET\Builder\Packages\StyleLibrary\Declarations\Declarations;
use ET\Builder\Packages\ModuleUtils\ModuleUtils;
use ET\Builder\VisualBuilder\Saving\SavingUtility;

/**
 * LayoutStyle class.
 *
 * This class has functionality for handling styles and layout for the layout component.
 *
 * @since ??
 */
class LayoutStyle {

	/**
	 * Get layout style component.
	 *
	 * This function is equivalent of JS function:
	 * {@link /docs/builder-api/js-beta/divi-module/functions/LayoutStyle LayoutStyle} in
	 * `@divi/module` package.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type string        $selector                 The CSS selector.
	 *     @type array         $selectors                Optional. An array of selectors for each breakpoint and state. Default `[]`.
	 *     @type callable      $selectorFunction         Optional. The function to be called to generate CSS selector. Default `null`.
	 *     @type array         $propertySelectors        Optional. The property selectors that you want to unpack. Default `[]`.
	 *     @type array         $attr                     An array of module attribute data.
	 *     @type array         $defaultPrintedStyleAttr  Optional. An array of default printed style attribute data. Default `[]`.
	 *     @type array|bool    $important               Optional. Whether to apply "!important" flag to the style declarations.
	 *                                                   Default `false`.
	 *     @type bool          $asStyle                  Optional. Whether to wrap the style declaration with style tag or not.
	 *                                                   Default `true`
	 *     @type string|null   $orderClass               Optional. The selector class name.
	 *     @type bool          $isInsideStickyModule     Optional. Whether the module is inside a sticky module or not. Default `false`.
	 *     @type string        $returnType               Optional. This is the type of value that the function will return.
	 *                                                   Can be either `string` or `array`. Default `array`.
	 *     @type string        $atRules                  Optional. CSS at-rules to wrap the style declarations in. Default `''`.
	 * }
	 *
	 * @return string|array The layout style component.
	 */
	public static function style( array $args ) {
		$args = wp_parse_args(
			$args,
			[
				'selectors'         => [],
				'propertySelectors' => [],
				'selectorFunction'  => null,
				'important'         => false,
				'asStyle'           => true,
				'orderClass'        => null,
				'returnType'        => 'array',
				'atRules'           => '',
			]
		);

		$selector           = $args['selector'];
		$selectors          = $args['selectors'];
		$selector_function  = $args['selectorFunction'];
		$property_selectors = $args['propertySelectors'];
		$attr               = $args['attr'];
		$important          = $args['important'];
		$as_style           = $args['asStyle'];
		$order_class        = $args['orderClass'];

		$attr_normalized = self::normalize_attr( $attr );

		$is_inside_sticky_module = $args['isInsideStickyModule'] ?? false;

		// Bail, if noting is there to process.
		if ( empty( $attr_normalized ) ) {
			return 'array' === $args['returnType'] ? [] : '';
		}

		$children = Utils::style_statements(
			[
				'selectors'               => ! empty( $selectors ) ? $selectors : [ 'desktop' => [ 'value' => $selector ] ],
				'selectorFunction'        => $selector_function,
				'propertySelectors'       => $property_selectors,
				'attr'                    => $attr_normalized,
				'defaultPrintedStyleAttr' => $args['defaultPrintedStyleAttr'] ?? [],
				'important'               => $important,
				'declarationFunction'     => function( $params ) use ( $selector ) {
					// Get the main layout declarations.
					$layout_declarations = Declarations::layout_style_declaration( $params );

					// Get attribute values for child selector rules.
					$attr_value = $params['attrValue'];
					$display    = $attr_value['display'] ?? '';
					$column_gap = $attr_value['columnGap'] ?? '';
					$css_rules  = [];

					// Add child selector rules for --horizontal-gap-parent.
					// Set parent's gap on children so they can use it for width calculations.
					// Children won't override this on themselves, only on their own children.
					if ( 'block' !== $display && $column_gap ) {
						$declaration           = "--horizontal-gap-parent: {$column_gap};";
						$sanitized_declaration = SavingUtility::sanitize_css_properties( $declaration );
						$css_rules[]           = "} {$selector} > [class*=\"et_flex_column\"] { {$sanitized_declaration}";
					}

					// Combine layout declarations with child selector rules.
					if ( ! empty( $css_rules ) ) {
						return $layout_declarations . implode( ' ', $css_rules );
					}

					return $layout_declarations;
				},
				'orderClass'              => $order_class,
				'isInsideStickyModule'    => $is_inside_sticky_module,
				'returnType'              => $args['returnType'],
				'atRules'                 => $args['atRules'],
			]
		);

		// Generate grid offset rules CSS.
		$grid_offset_children = self::_generate_grid_offset_rules_css(
			[
				'selector'   => $selector,
				'attr'       => $attr_normalized,
				'important'  => $important,
				'returnType' => $args['returnType'],
			]
		);

		// Combine main layout styles with grid offset rules.
		$all_children = $children;
		if ( ! empty( $grid_offset_children ) ) {
			if ( 'array' === $args['returnType'] ) {
				$all_children = array_merge( $children, $grid_offset_children );
			} else {
				$all_children = $children . $grid_offset_children;
			}
		}

		return Utils::style_wrapper(
			[
				'attr'     => $attr_normalized,
				'asStyle'  => $as_style,
				'children' => $all_children,
			]
		);
	}

	/**
	 * Normalize the layout attributes.
	 *
	 * Some attributes are not available in all breakpoints and states. This function
	 * will normalize the attributes by filling the missing attributes with the
	 * inherited values.
	 *
	 * @since ??
	 *
	 * @param array $attr The array of attributes to be normalized.
	 * @return array The normalized array of attributes.
	 */
	public static function normalize_attr( array $attr ):array {
		if ( ! $attr ) {
			return [];
		}

		$default_attr = [
			'desktop' => [
				'value' => [
					'display' => 'flex',
				],
			],
		];

		$attr_with_default = array_replace_recursive( $default_attr, $attr );

		$attr_normalized = [];

		foreach ( $attr_with_default as $breakpoint => $states ) {
			foreach ( $states as $state => $values ) {
				if ( 'desktop' === $breakpoint && 'value' === $state ) {
					$attr_normalized[ $breakpoint ][ $state ] = $values;
				} else {
					$inherit = ModuleUtils::use_attr_value(
						[
							'attr'       => $attr_with_default,
							'breakpoint' => $breakpoint,
							'state'      => $state,
							'mode'       => 'getAndInheritAll',
						]
					);

					$attr_normalized[ $breakpoint ][ $state ] = array_replace_recursive(
						$inherit,
						$values
					);
				}
			}
		}

		return $attr_normalized;
	}

	/**
	 * Generate CSS for grid offset rules.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type string $selector   The base CSS selector.
	 *     @type array  $attr       The normalized layout attributes.
	 *     @type bool   $important  Whether to add !important to declarations.
	 *     @type string $returnType The return type ('array' or 'string').
	 * }
	 *
	 * @return array|string The grid offset rules CSS.
	 */
	private static function _generate_grid_offset_rules_css( array $args ) {
		$selector    = $args['selector'];
		$attr        = $args['attr'];
		$important   = $args['important'];
		$return_type = $args['returnType'];

		// Use the same style system as main layout styles for proper media query handling.
		return Utils::style_statements(
			[
				'selectors'           => [ 'desktop' => [ 'value' => $selector ] ],
				'attr'                => $attr,
				'important'           => $important,
				'declarationFunction' => function( $params ) use ( $selector ) {
					$attr_value        = $params['attrValue'];
					$breakpoint        = $params['breakpoint'];
					$state             = $params['state'];
					$important         = $params['important'];
					$grid_offset_rules = $attr_value['gridOffsetRules'] ?? null;
					$display           = $attr_value['display'] ?? '';
					$css_rules         = [];

					// Only process grid offset rules for grid display.
					if ( 'grid' !== $display || empty( $grid_offset_rules ) ) {
						// Return empty string if no grid offset rules.
						return '';
					}

					// Grid offset rules are stored in format { rules: [] }.
					$rules = $grid_offset_rules['rules'] ?? $grid_offset_rules;

					if ( ! is_array( $rules ) || empty( $rules ) ) {
						// Return empty string if no valid grid offset rules.
						return '';
					}

					foreach ( $rules as $rule ) {
						if ( ! is_array( $rule ) ) {
							continue;
						}

						$target_offset = $rule['targetOffset'] ?? '';
						$offset_rule   = $rule['offsetRule'] ?? '';
						$offset_value  = $rule['offsetValue'] ?? '';

						if ( empty( $target_offset ) || empty( $offset_rule ) || empty( $offset_value ) ) {
							continue;
						}

						// Handle different target offset types.
						if ( 'first-child' === $target_offset ) {
							$child_selector = '> *:first-of-type';
						} elseif ( 'last-child' === $target_offset ) {
							$child_selector = '> *:last-of-type';
						} else {
							// Get the actual nth-child value for numbered selectors or custom patterns.
							$nth_child_value           = 'custom' === $target_offset
								? ( $rule['customTargetOffset'] ?? '1' )
								: $target_offset;
							$sanitized_nth_child_value = esc_attr( $nth_child_value );
							$child_selector            = "> *:nth-of-type({$sanitized_nth_child_value})";
						}

						// Get CSS property and value for the offset rule.
						$css_property = self::_get_css_property_for_offset_rule( $offset_rule );
						$css_value    = self::_get_css_value_for_offset_rule( $offset_rule, $offset_value );

						// Add important flag if needed.
						$declaration = $important ? "{$css_property}: {$css_value} !important;" : "{$css_property}: {$css_value};";

						// Sanitize the complete CSS declaration for additional security.
						$sanitized_declaration = SavingUtility::sanitize_css_properties( $declaration );

						// Create individual CSS rule.
						$css_rules[] = "} {$selector} {$child_selector} { {$sanitized_declaration}";
					}

					// Return the CSS rules as a single string.
					return implode( ' ', $css_rules );
				},
				'returnType'          => $return_type,
			]
		);
	}

	/**
	 * Get the CSS property for a grid offset rule.
	 *
	 * @since ??
	 *
	 * @param string $offset_rule The offset rule type.
	 * @return string The CSS property.
	 */
	private static function _get_css_property_for_offset_rule( string $offset_rule ): string {
		switch ( $offset_rule ) {
			case 'columnSpan':
				return 'grid-column';
			case 'columnStart':
				return 'grid-column-start';
			case 'columnEnd':
				return 'grid-column-end';
			case 'rowSpan':
				return 'grid-row';
			case 'rowStart':
				return 'grid-row-start';
			case 'rowEnd':
				return 'grid-row-end';
			case 'gridTemplateColumns':
				return 'grid-template-columns';
			default:
				return 'grid-column';
		}
	}

	/**
	 * Get the CSS value for a grid offset rule.
	 *
	 * @since ??
	 *
	 * @param string $offset_rule The offset rule type.
	 * @param string $offset_value The offset value.
	 * @return string The CSS value.
	 */
	private static function _get_css_value_for_offset_rule( string $offset_rule, string $offset_value ): string {
		$sanitized_offset_value = esc_attr( $offset_value );

		switch ( $offset_rule ) {
			case 'columnSpan':
			case 'rowSpan':
				return "span {$sanitized_offset_value}";
			case 'columnStart':
			case 'columnEnd':
			case 'rowStart':
			case 'rowEnd':
				return $sanitized_offset_value;
			case 'gridTemplateColumns':
				return $sanitized_offset_value;
			default:
				return $sanitized_offset_value;
		}
	}
}
