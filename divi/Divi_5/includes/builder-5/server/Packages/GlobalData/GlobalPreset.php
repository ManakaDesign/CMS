<?php
/**
 * REST: GlobalPreset class.
 *
 * @package Divi
 * @since ??
 */

namespace ET\Builder\Packages\GlobalData;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use ET\Builder\VisualBuilder\Saving\SavingUtility;
use ET\Builder\Packages\GlobalData\GlobalPresetItem;
use ET\Builder\Packages\GlobalData\GlobalPresetItemGroup;
use ET\Builder\Packages\ModuleUtils\ModuleUtils;
use ET\Builder\Packages\Conversion\Conversion;
use ET\Builder\Migration\Migration;
use ET\Builder\Framework\Utility\ArrayUtility;
use InvalidArgumentException;
use WP_Block_Type;
use ET_Core_PageResource;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * GlobalPreset class.
 *
 * @since ??
 */
class GlobalPreset {

	/**
	 * The data cache.
	 *
	 * @since ??
	 *
	 * @var mixed
	 */
	private static $_data = null;

	/**
	 * Check if there are new D4 presets that haven't been converted yet.
	 *
	 * This function compares D4 presets with existing D5 presets to determine
	 * if there are any new presets that need to be converted.
	 *
	 * @param array $d4_presets The D4 presets data.
	 *
	 * @return bool True if there are new D4 presets to convert.
	 */
	private static function _has_new_d4_presets( array $d4_presets ): bool {
		$existing_d5_presets = self::get_data();

		// Build a flat lookup table of all existing D5 preset IDs for O(1) lookups.
		$existing_preset_ids = [];
		if ( isset( $existing_d5_presets['module'] ) ) {
			foreach ( $existing_d5_presets['module'] as $d5_module_data ) {
				if ( isset( $d5_module_data['items'] ) ) {
					$existing_preset_ids = array_merge( $existing_preset_ids, array_keys( $d5_module_data['items'] ) );
				}
			}
		}

		// Convert to hash map for O(1) lookups.
		$existing_preset_ids = array_flip( $existing_preset_ids );

		foreach ( $d4_presets as $d4_module_data ) {
			if ( ! isset( $d4_module_data['presets'] ) || ! is_array( $d4_module_data['presets'] ) ) {
				continue;
			}

			foreach ( $d4_module_data['presets'] as $preset_id => $preset_data ) {
				if ( ! isset( $existing_preset_ids[ $preset_id ] ) ) {
					// Found a D4 preset that doesn't exist in D5.
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Get the option name for the global presets.
	 *
	 * @since ??
	 *
	 * @return string The option name.
	 */
	public static function option_name(): string {
		return 'builder_global_presets_d5';
	}

	/**
	 * Get the option name to check the legacy preset's import check.
	 *
	 * @since ??
	 *
	 * @return string The option name.
	 */
	public static function is_legacy_presets_imported_option_name(): string {
		return 'builder_is_legacy_presets_imported_to_d5';
	}

	/**
	 * Delete the data from the DB.
	 *
	 * @since ??
	 */
	public static function delete_data():void {
		et_delete_option( self::option_name() );

		// Reset the data cache.
		self::$_data = null;
	}

	/**
	 * Get the data from the DB.
	 *
	 * @since ??
	 *
	 * @return array The data from the DB. The array structure is aligns with GlobalData.Presets.Items TS interface.
	 */
	public static function get_data(): array {
		if ( null !== self::$_data ) {
			return self::$_data;
		}

		$data = et_get_option( self::option_name(), [], '', true, false, '', '', true );

		if ( is_array( $data ) ) {
			self::$_data = $data;
			return $data;
		}

		return [];
	}

	/**
	 * Get the data from the DB for legacy presets import check.
	 *
	 * @since ??
	 *
	 * @return string The data from the DB.
	 */
	public static function is_legacy_presets_imported(): string {
		$data = et_get_option( self::is_legacy_presets_imported_option_name(), '', '', true, false, '', '', true );

		return $data;
	}

	/**
	 * Prepare the data to be saved to DB.
	 *
	 * @since ??
	 *
	 * @param array $schema_items The schema items. The array structure is aligns with GlobalData.Presets.RestSchemaItems TS interface.
	 *
	 * @return array Prepared data to be saved to DB. The array structure is aligns with GlobalData.Presets.Items TS interface.
	 */
	public static function prepare_data( array $schema_items ): array {
		$prepared   = [];
		$attrs_keys = [
			'attrs',
			'renderAttrs',
			'styleAttrs',
		];

		foreach ( $schema_items as $preset_type => $schema_item ) {
			if ( ! isset( $prepared[ $preset_type ] ) ) {
				$prepared[ $preset_type ] = [];
			}

			foreach ( $schema_item as $record ) {
				$default = $record['default'];
				$items   = $record['items'];

				foreach ( $items as $item ) {
					if ( 'module' === $preset_type ) {
						$preset_sub_type = $item['moduleName'];
					} elseif ( 'group' === $preset_type ) {
						$preset_sub_type = $item['groupName'];
					}

					if ( ! isset( $prepared[ $preset_type ][ $preset_sub_type ] ) ) {
						$prepared[ $preset_type ][ $preset_sub_type ] = [
							'default' => $default,
							'items'   => [],
						];
					}

					foreach ( $attrs_keys as $key ) {
						if ( isset( $item[ $key ] ) ) {
							$preset_attrs = $item[ $key ];

							if ( ! is_array( $preset_attrs ) ) {
								unset( $item[ $key ] );
								continue;
							}

							$preset_attrs = ModuleUtils::remove_empty_array_attributes( $preset_attrs );

							if ( empty( $preset_attrs ) ) {
								unset( $item[ $key ] );
								continue;
							}

							if ( 'module' === $preset_type ) {
								$item[ $key ] = SavingUtility::sanitize_block_attrs( $preset_attrs, $preset_sub_type );
							} elseif ( 'group' === $preset_type ) {
								$item[ $key ] = SavingUtility::sanitize_group_attrs( $preset_attrs, $preset_sub_type );
							}
						}
					}

					$prepared[ $preset_type ][ $preset_sub_type ]['items'][ $item['id'] ] = $item;
				}
			}
		}

		return $prepared;
	}

	/**
	 * Save the data to DB.
	 *
	 * @since ??
	 *
	 * @param array $data The data to be saved. The array structure is aligns with GlobalData.Presets.Items TS interface.
	 *
	 * @return array The saved data. The array structure is aligns with GlobalData.Presets.Items TS interface.
	 */
	public static function save_data( array $data ): array {
		et_update_option( self::option_name(), $data, false, '', '', true );

		// We need to clear the entire website cache when updating a preset.
		// Preserve VB CSS files to prevent visual builder from losing its styles.
		ET_Core_PageResource::remove_static_resources( 'all', 'all', true, 'all', true );

		// Reset the data cache.
		self::$_data = null;

		return self::get_data();
	}

	/**
	 * Save conversion data to DB for legacy presets import check.
	 *
	 * @since ??
	 *
	 * @param bool $data The data to be saved.
	 *
	 * @return void
	 */
	public static function save_is_legacy_presets_imported( bool $data ): void {
		et_update_option( self::is_legacy_presets_imported_option_name(), $data ? 'yes' : '', false, '', '', true );

		// We need to clear the entire website cache when updating a preset.
		// Preserve VB CSS files to prevent visual builder from losing its styles.
		ET_Core_PageResource::remove_static_resources( 'all', 'all', true, 'all', true );
	}

	/**
	 * Get the legacy D4 global presets data from the DB for presets format.
	 *
	 * @since ??
	 *
	 * @return array The data from the DB. The array structure is in D4 which needs to be used for converting to D5 format.
	 */
	public static function get_legacy_data(): array {
		static $presets_attributes = null;

		if ( null !== $presets_attributes ) {
			return $presets_attributes;
		}

		$all_builder_presets = et_get_option( 'builder_global_presets_ng', (object) array(), '', true, false, '', '', true );
		$presets_attributes  = array();

		// If there is no global presets then return empty array.
		if ( empty( $all_builder_presets ) ) {
			return $presets_attributes;
		}

		foreach ( $all_builder_presets as $module => $module_presets ) {
			$module_presets = is_array( $module_presets ) ? (object) $module_presets : $module_presets;

			if ( ! is_object( $module_presets ) ) {
				continue;
			}

			foreach ( $module_presets->presets as $key => $value ) {
				if ( empty( (array) $value->settings ) ) {
					continue;
				}

				// Convert preset settings object to array format.
				$value_settings  = json_decode( wp_json_encode( $value->settings ), true );
				$value->settings = (array) $value_settings;
				unset( $value->is_temp );

				$presets_attributes[ $module ]['presets'][ $key ] = (array) $value;
			}

			// Get the default preset id.
			$default_preset_id = $module_presets->default;

			// If presets are available then only set default preset id.
			if ( ! empty( $presets_attributes[ $module ]['presets'] ) ) {
				// Set the default preset id if default preset id is there otherwise set as blank.
				$presets_attributes[ $module ]['default'] = $default_preset_id;
			}
		}

		return $presets_attributes;
	}

	/**
	 * Retrieve the selected preset from a module.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type string $moduleName  The module name.
	 *     @type array  $moduleAttrs The module attributes.
	 *     @type array  $allData     The all data. If not provided, it will be fetched using `GlobalPreset::get_data()`.
	 * }
	 *
	 * @throws InvalidArgumentException If the `moduleName` argument is not provided.
	 * @throws InvalidArgumentException If the `moduleAttrs` argument is not provided.
	 *
	 * @return GlobalPresetItem The selected preset instance.
	 */
	public static function get_selected_preset( array $args ): GlobalPresetItem {
		if ( ! isset( $args['moduleName'] ) ) {
			throw new InvalidArgumentException( 'The `moduleName` argument is required.' );
		}

		if ( ! isset( $args['moduleAttrs'] ) ) {
			throw new InvalidArgumentException( 'The `moduleAttrs` argument is required.' );
		}

		// Extract the arguments.
		$module_name  = $args['moduleName'];
		$module_attrs = $args['moduleAttrs'];
		$all_data     = $args['allData'] ?? self::get_data();

		// Convert the module name to the preset module name.
		$module_name_converted = ModuleUtils::maybe_convert_preset_module_name( $module_name, $module_attrs );

		$default_preset_id    = $all_data['module'][ $module_name_converted ]['default'] ?? '';
		$preset_id            = $module_attrs['modulePreset'] ?? '';
		$preset_id_as_default = self::is_preset_id_as_default( $preset_id, $default_preset_id );

		// If the preset ID is not as default, and the preset ID is found, then use the preset ID.
		if ( ! $preset_id_as_default && isset( $all_data['module'][ $module_name_converted ]['items'][ $preset_id ] ) ) {
			return new GlobalPresetItem(
				[
					'data'      => $all_data['module'][ $module_name_converted ]['items'][ $preset_id ],
					'asDefault' => false,
					'isExist'   => true,
				]
			);
		}

		return new GlobalPresetItem(
			[
				'data'      => $all_data['module'][ $module_name_converted ]['items'][ $default_preset_id ] ?? [],
				'asDefault' => true,
				'isExist'   => isset( $all_data['module'][ $module_name_converted ]['items'][ $default_preset_id ] ),
			]
		);
	}

	/**
	 * Retrieve the preset item.
	 *
	 * This method is used to find the preset item for a module. It will convert the module name to the preset module name if needed.
	 *
	 * @since ??
	 *
	 * @param string $module_name  The module name.
	 * @param array  $module_attrs The module attributes.
	 * @param array  $default_printed_style_attrs The default printed style attributes.
	 *
	 * @return GlobalPresetItem The preset item instance.
	 */
	public static function get_item( string $module_name, array $module_attrs, array $default_printed_style_attrs = [] ): GlobalPresetItem {
		// TODO feat(D5, Deprecated) Create class for handling deprecating functions / methdos / constructor / classes. [https://github.com/elegantthemes/Divi/issues/41805].
		_deprecated_function( __METHOD__, '5.0.0-public-alpha-9', 'GlobalPreset::get_selected_preset' );

		return self::get_selected_preset(
			[
				'moduleName'               => $module_name,
				'moduleAttrs'              => $module_attrs,
				'defaultPrintedStyleAttrs' => $default_printed_style_attrs,
			]
		);
	}

	/**
	 * Retrieve the preset item by ID.
	 *
	 * @since ??
	 *
	 * @param string $module_name The module name. The module name should be already converted to the preset module name.
	 * @param string $preset_id The module attributes. The preset ID should be the actual preset ID.
	 *
	 * @return GlobalPresetItem The preset item instance.
	 */
	public static function get_item_by_id( string $module_name, string $preset_id ): GlobalPresetItem {
		// TODO feat(D5, Deprecated) Create class for handling deprecating functions / methdos / constructor / classes. [https://github.com/elegantthemes/Divi/issues/41805].
		_deprecated_function( __METHOD__, '5.0.0-public-alpha-9', 'GlobalPreset::get_selected_preset' );

		return self::get_selected_preset(
			[
				'moduleName'               => $module_name,
				'moduleAttrs'              => [
					'modulePreset' => $preset_id,
				],
				'defaultPrintedStyleAttrs' => [],
			]
		);
	}

	/**
	 * Check if a preset ID already exists across all modules in the current preset data.
	 *
	 * This method checks for ID collisions to determine if we need to generate
	 * a new ID or can preserve the original preset ID during conversion.
	 *
	 * @since ??
	 *
	 * @param string $preset_id The preset ID to check for collision.
	 * @param array  $existing_presets All existing presets data.
	 *
	 * @return bool True if collision detected, false if ID is available.
	 */
	private static function _has_preset_id_collision( string $preset_id, array $existing_presets ): bool {
		// Check module presets for collision.
		foreach ( $existing_presets['module'] ?? [] as $module_presets ) {
			if ( isset( $module_presets['items'][ $preset_id ] ) ) {
				return true;
			}
		}

		// Check group presets for collision.
		foreach ( $existing_presets['group'] ?? [] as $group_presets ) {
			if ( isset( $group_presets['items'][ $preset_id ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Process the presets with ID collision handling.
	 * This function handles server-side preset processing (replaces the former client-side `processPresets`)
	 * to use during Readiness migration. This function takes an array of converted D5 presets and processes them by merging them with the existing presets.
	 *
	 * IMPORTANT: This now preserves original preset IDs to maintain compatibility with
	 * existing site content that references those IDs, especially during D4→D5 conversion.
	 * New IDs are only generated when there's an actual collision with existing preset IDs.
	 *
	 * @param array $presets The array of presets to be processed.
	 * @return array The processed presets with newIds mapping for preset ID replacement in content.
	 */
	public static function process_presets( $presets ) {
		$processed_presets               = [
			'module' => [],
			'group'  => [],
		];
		$all_presets                     = self::get_data();
		$new_ids                         = [
			'module' => [],
			'group'  => [],
		];
		$default_imported_module_presets = [];
		$default_imported_group_presets  = [];

		// Process module presets.
		foreach ( $presets['module'] as $module_name => $preset_items ) {
			if ( empty( $module_name ) ) {
				continue;
			}

			$processed_items = [];

			// Check all existing presets for this module.
			$existing_presets = $all_presets['module'][ $module_name ]['items'] ?? [];

			foreach ( $preset_items['items'] as $item_id => $item ) {
				if ( empty( $item ) ) {
					continue;
				}

				$current_timestamp   = time();
				$preset_name         = $item['name'];
				$is_duplicate        = false;
				$name_conflict_found = false;

				// Migrate the incoming preset once for both comparison and final result.
				$migrated_incoming_item = Migration::get_instance()->migrate_preset_item( $item, $module_name );

				foreach ( $existing_presets as $existing_id => $existing_preset ) {
					$existing_name = $existing_preset['name'];

					// Check for exact duplicate (same name AND same ID).
					if ( $preset_name === $existing_name && $item_id === $existing_id ) {
						$is_duplicate = true;
						break;
					} elseif ( $preset_name === $existing_name ) {
						// Name conflict but different ID.
						$name_conflict_found = true;
					}
				}

				// Skip if this is a true duplicate (same name + same ID).
				if ( $is_duplicate ) {
					continue;
				}

				// Handle name conflicts by adding "imported" suffix.
				$final_name = $name_conflict_found ? $preset_name . ' imported' : $preset_name;

				// Try to preserve original preset ID to maintain compatibility with existing content.
				// Only generate new ID if there's an actual collision with existing presets.
				$final_id = $item_id;

				if ( self::_has_preset_id_collision( $item_id, $all_presets ) ) {
					// Collision detected - generate new unique ID.
					$final_id = uniqid();

					// Track the mapping from original ID to new ID for content replacement.
					if ( ! isset( $new_ids['module'][ $module_name ] ) ) {
						$new_ids['module'][ $module_name ] = [];
					}
					$new_ids['module'][ $module_name ][ $item_id ] = $final_id;
				}

				// Check if this is a default preset and track it for default assignment.
				$is_default_preset = isset( $preset_items['default'] ) && $preset_items['default'] === $item_id;
				if ( $is_default_preset ) {
					$default_imported_module_presets[ $module_name ] = [
						'presetId'   => $final_id,
						'moduleName' => $module_name,
					];
				}

				// Use the migrated preset item for the final result.
				$processed_items[ $final_id ] = array_merge(
					$migrated_incoming_item,
					[
						'id'      => $final_id,
						'name'    => $final_name,
						'created' => $current_timestamp,
						'updated' => $current_timestamp,
					]
				);
			}

			// Only return processed presets if any were actually processed (not duplicates).
			if ( ! empty( $processed_items ) ) {
				$processed_presets['module'][ $module_name ] = [
					'items'   => $processed_items,
					'default' => $preset_items['default'] ?? '',
				];
			}
		}

		// Process group presets.
		if ( isset( $presets['group'] ) ) {
			foreach ( $presets['group'] as $group_name => $preset_items ) {
				if ( empty( $group_name ) ) {
					continue;
				}

				$processed_items = [];

				foreach ( $preset_items['items'] as $item_id => $item ) {
					if ( empty( $item ) ) {
						continue;
					}

					// Get preset name for duplicate checking.
					$preset_name = $item['name'] ?? '';

					// Get module name from the preset item for migration.
					$module_name = $item['moduleName'] ?? '';

					// Migrate the incoming preset once for both comparison and final result.
					$migrated_incoming_item = Migration::get_instance()->migrate_preset_item( $item, $module_name );

					// Check existing presets for this group to detect duplicates/conflicts.
					$existing_presets    = $all_presets['group'][ $group_name ]['items'] ?? [];
					$is_duplicate        = false;
					$name_conflict_found = false;

					foreach ( $existing_presets as $existing_id => $existing_preset ) {
						$existing_name = $existing_preset['name'];

						// Check for exact duplicate (same name AND same ID).
						if ( $preset_name === $existing_name && $item_id === $existing_id ) {
							$is_duplicate = true;
							break;
						} elseif ( $preset_name === $existing_name ) {
							// Name conflict but different ID.
							$name_conflict_found = true;
						}
					}

					// Skip if this is a true duplicate (same name + same ID).
					if ( $is_duplicate ) {
						continue;
					}

					// Check if this is a default preset.
					$is_default_preset = isset( $preset_items['default'] ) && $preset_items['default'] === $item_id;

					// Handle name conflicts by adding "imported" suffix.
					// Default presets get the same treatment as regular presets.
					$final_name = $name_conflict_found ? $preset_name . ' imported' : $preset_name;

					// Try to preserve original preset ID to maintain compatibility.
					// Only generate new ID if there's an actual collision with existing presets.
					$final_id = $item_id;

					if ( self::_has_preset_id_collision( $item_id, $all_presets ) ) {
						// Collision detected - generate new unique ID.
						$final_id = uniqid();

						// Track the mapping from original ID to new ID for content replacement.
						// Use nested structure to match preset organization and avoid collisions.
						if ( ! isset( $new_ids['group'][ $group_name ] ) ) {
							$new_ids['group'][ $group_name ] = [];
						}
						$new_ids['group'][ $group_name ][ $item_id ] = $final_id;
					}

					// Track default imported group presets (consistent structure with module presets).
					if ( $is_default_preset ) {
						$default_imported_group_presets[ $group_name ] = [
							'presetId'  => $final_id,
							'groupName' => $group_name, // Use group name for semantic clarity.
						];
					}

					$current_timestamp = time();

					// Use the migrated preset item for the final result.
					$processed_items[ $final_id ] = array_merge(
						$migrated_incoming_item,
						[
							'id'      => $final_id,
							'name'    => $final_name,
							'created' => $current_timestamp,
							'updated' => $current_timestamp,
						]
					);
				}

				// Only return processed presets if any were actually processed (not duplicates).
				if ( ! empty( $processed_items ) ) {
					$processed_presets['group'][ $group_name ] = [
						'items'   => $processed_items,
						'default' => $preset_items['default'] ?? '',
					];
				}
			}
		}

		return [
			'presets'                        => $processed_presets,
			'newIds'                         => $new_ids,
			'defaultImportedModulePresetIds' => $default_imported_module_presets,
			'defaultImportedGroupPresetIds'  => $default_imported_group_presets,
		];
	}


	/**
	 * Convert D4 presets to D5 format if not already converted.
	 *
	 * This is a shared utility method used by both the D5 readiness system
	 * and the visual builder settings system for consistent D4→D5 preset conversion.
	 *
	 * @since ??
	 *
	 * @return bool True if conversion was performed, false if already converted or no D4 presets found.
	 */
	public static function maybe_convert_legacy_presets(): bool {
		// Get the legacy global presets settings of D4.
		$d4_presets = self::get_legacy_data();
		if ( empty( $d4_presets ) ) {
			return false;
		}

		// Check if the legacy presets are already imported.
		$is_legacy_presets_imported = self::is_legacy_presets_imported();
		if ( ! empty( $is_legacy_presets_imported ) ) {
			// Legacy presets were imported before, but check if there are NEW D4 presets
			// that were added since the last migration (e.g., from importing another layout).
			// This allows multiple migrations when new content is added to D4.
			$new_presets_found = self::_has_new_d4_presets( $d4_presets );
			if ( ! $new_presets_found ) {
				return false;
			}
			// Continue with migration since new D4 presets were found.
		}

		// Ensure shortcode framework is initialized for conversion.
		Conversion::initialize_shortcode_framework();

		/**
		 * Fires before D4 to D5 preset conversion begins.
		 *
		 * This action allows other components to prepare for the D4 to D5 conversion process.
		 * It's particularly important for ensuring that all necessary module definitions
		 * and dependencies are properly initialized before the conversion starts.
		 *
		 * This hook is fired during the legacy preset conversion process, specifically
		 * after the shortcode framework has been initialized but before the actual
		 * preset processing and conversion begins.
		 *
		 * @since ??
		 *
		 * @hook divi_visual_builder_before_d4_conversion
		 */
		do_action( 'divi_visual_builder_before_d4_conversion' );

		// Use the core preset processing workflow to handle conversion, merge, and save.
		self::process_presets_for_import( $d4_presets, true );

		// Mark legacy presets as imported to prevent duplicate conversion.
		self::save_is_legacy_presets_imported( true );

		return true;
	}

	/**
	 * Process presets and merge with existing preset data.
	 *
	 * This utility handles the complete preset processing workflow:
	 * 1. Process incoming presets (deduplication, renaming)
	 * 2. Get existing presets from database
	 * 3. Merge processed presets with existing presets
	 *
	 * @since ??
	 *
	 * @param array $incoming_presets The raw presets to process and merge.
	 * @return array The complete merged preset data with preset_id_mappings.
	 */
	public static function merge_new_presets_with_existing( array $incoming_presets ): array {
		// Step 1: Process incoming presets (deduplication, renaming).
		$processed_result   = self::process_presets( $incoming_presets );
		$processed_presets  = $processed_result['presets'];
		$preset_id_mappings = $processed_result['newIds'];

		// Step 2: Get existing presets from database.
		$existing_presets = self::get_data();

		// Step 3: If no processed presets to merge, return existing presets unchanged.
		if ( empty( $processed_presets['module'] ) && empty( $processed_presets['group'] ) ) {
			return [
				'presets'            => $existing_presets,
				'preset_id_mappings' => [],
			];
		}

		// Step 4: Merge processed presets with existing presets.
		foreach ( $processed_presets['module'] as $module_name => $module_data ) {
			// Initialize module if it doesn't exist.
			if ( ! isset( $existing_presets['module'][ $module_name ] ) ) {
				$existing_presets['module'][ $module_name ] = [
					'items'   => [],
					'default' => '',
				];
			}

			// Merge processed items with existing items.
			$existing_items                                      = $existing_presets['module'][ $module_name ]['items'] ?? [];
			$processed_items                                     = $module_data['items'] ?? [];
			$existing_presets['module'][ $module_name ]['items'] = array_merge( $existing_items, $processed_items );

			// Update default if provided.
			if ( isset( $module_data['default'] ) ) {
				$existing_presets['module'][ $module_name ]['default'] = $module_data['default'];
			}
		}

		// Step 5: Merge processed group presets with existing presets.
		foreach ( $processed_presets['group'] as $group_name => $group_data ) {
			// Initialize group if it doesn't exist.
			if ( ! isset( $existing_presets['group'][ $group_name ] ) ) {
				$existing_presets['group'][ $group_name ] = [
					'items'   => [],
					'default' => '',
				];
			}

			// Merge processed items with existing items.
			$existing_items                                    = $existing_presets['group'][ $group_name ]['items'] ?? [];
			$processed_items                                   = $group_data['items'] ?? [];
			$existing_presets['group'][ $group_name ]['items'] = array_merge( $existing_items, $processed_items );

			// Update default if provided.
			if ( isset( $group_data['default'] ) ) {
				$existing_presets['group'][ $group_name ]['default'] = $group_data['default'];
			}
		}

		return [
			'presets'                        => $existing_presets,
			'preset_id_mappings'             => $preset_id_mappings,
			'defaultImportedModulePresetIds' => $processed_result['defaultImportedModulePresetIds'] ?? [],
			'defaultImportedGroupPresetIds'  => $processed_result['defaultImportedGroupPresetIds'] ?? [],
		];
	}

	/**
	 * Create default presets for modules that have presets but no default preset ID.
	 *
	 * This replicates the client-side addDefaultModulePreset logic.
	 * After importing D4 presets, modules need empty default presets created.
	 *
	 * @since ??
	 *
	 * @param array $processed_presets The processed presets that were just imported.
	 * @return array The updated presets data with any new default presets added.
	 */
	public static function maybe_create_default_presets_after_import( array $processed_presets ): array {
		$current_data      = $processed_presets;
		$current_timestamp = time();

		// Check each module that had presets imported.
		foreach ( $processed_presets['module'] as $module_name => $module_presets ) {
			// Check if this module now has presets but no valid default preset ID.
			$existing_module_data = $current_data['module'][ $module_name ] ?? [];
			$has_presets          = ! empty( $existing_module_data['items'] );
			$default_id           = $existing_module_data['default'] ?? '';
			$has_valid_default    = ! empty( $default_id ) && isset( $existing_module_data['items'][ $default_id ] );

			// If module has presets but no valid default, create a new default preset.
			if ( $has_presets && ! $has_valid_default ) {
				// Get module label from module registration.
				$module_label = self::_get_module_label_for_preset( $module_name );

				// Generate a new default preset.
				$default_preset = self::_generate_new_preset(
					$existing_module_data['items'] ?? [],
					$module_label,
					$module_name,
					$current_timestamp
				);

				// Add the new default preset to current data.
				$current_data['module'][ $module_name ]['items'][ $default_preset['id'] ] = $default_preset;
				$current_data['module'][ $module_name ]['default']                        = $default_preset['id'];
			}
		}

		return $current_data;
	}

	/**
	 * Generate a new default preset for a module.
	 *
	 * PHP equivalent of the client-side generateNewPreset function.
	 *
	 * @since ??
	 *
	 * @param array  $existing_presets Existing preset items for the module.
	 * @param string $module_label The module label.
	 * @param string $module_name The module name.
	 * @param int    $timestamp Current timestamp.
	 * @return array The new preset item.
	 */
	private static function _generate_new_preset( array $existing_presets, string $module_label, string $module_name, int $timestamp ): array {
		// Generate unique ID and name.
		$preset_info = self::_generate_default_preset_name( $existing_presets, $module_label );

		return [
			'id'         => $preset_info['id'],
			'name'       => $preset_info['name'],
			'moduleName' => $module_name,
			'version'    => ET_BUILDER_VERSION,
			'type'       => 'module',
			'created'    => $timestamp,
			'updated'    => $timestamp,
		];
	}

	/**
	 * Generate a unique preset ID and name based on existing presets.
	 *
	 * PHP equivalent of the client-side generateDefaultPresetName function.
	 *
	 * @since ??
	 *
	 * @param array  $presets Existing preset items.
	 * @param string $prefix_label The module label prefix.
	 * @return array Array with 'id' and 'name' keys.
	 */
	private static function _generate_default_preset_name( array $presets, string $prefix_label ): array {
		$highest_number = 0;
		$regex_pattern  = '/^' . preg_quote( $prefix_label, '/' ) . ' (\d+)$/i';

		// Find the highest number in existing preset names.
		foreach ( $presets as $preset ) {
			$preset_name = $preset['name'] ?? '';
			if ( preg_match( $regex_pattern, $preset_name, $matches ) ) {
				$highest_number = max( $highest_number, (int) $matches[1] );
			}
		}

		return [
			'id'   => \ET_Core_Data_Utils::uuid_v4(),
			'name' => $prefix_label . ' ' . ( $highest_number + 1 ),
		];
	}

	/**
	 * Get module label for preset generation.
	 *
	 * Uses existing module registration to get the module title, with fallback logic.
	 * This is the PHP equivalent of the client-side getModuleTitle selector.
	 *
	 * @since ??
	 *
	 * @param string $module_name The module name (e.g., 'divi/blurb').
	 * @return string The module label (e.g., 'Blurb').
	 */
	private static function _get_module_label_for_preset( string $module_name ): string {
		$module_settings = ModuleRegistration::get_module_settings( $module_name );
		return $module_settings->title ?? '';
	}

	/**
	 * Get default preset ID for a specific preset type.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     Array of arguments.
	 *
	 *     @type string $preset_type     The preset type (module/group).
	 *     @type string $preset_sub_type The preset subtype (module name/group name).
	 * }
	 *
	 * @return string
	 */
	public static function get_default_preset_id( array $args ): string {
		$all_presets = self::get_data();
		$preset_type = $args['preset_type'] ?? 'module';
		$sub_type    = $args['preset_sub_type'] ?? '';

		if ( 'group' === $preset_type ) {
			return $all_presets['group'][ $sub_type ]['default'] ?? '';
		}

		$module_name = ModuleUtils::maybe_convert_preset_module_name(
			$sub_type,
			[]
		);

		return $all_presets['module'][ $module_name ]['default'] ?? '';
	}

	/**
	 * Get preset class name.
	 *
	 * @since ??
	 *
	 * @param string $group_name Group name.
	 * @param string $preset_id Preset ID.
	 * @param string $preset_type Preset type (module/group).
	 *
	 * @return string
	 */
	public static function get_preset_class_name(
		string $group_name,
		string $preset_id,
		string $preset_type = 'group'
	): string {
		$normalized_group  = str_replace( '/', '-', $group_name );
		$normalized_preset = 'default' === $preset_id ? 'default' : $preset_id;

		return sprintf(
			'divi-%s-%s-%s',
			$preset_type,
			$normalized_group,
			$normalized_preset
		);
	}

	/**
	 * Get group preset class names for a module.
	 *
	 * @since ??
	 *
	 * @param array $presets Group presets data.
	 *
	 * @return array
	 */
	public static function get_group_preset_class_name_for_module( array $presets ): array {
		// Early bail if presets are not provided or invalid.
		if ( empty( $presets ) || ! is_array( $presets ) ) {
			return [];
		}

		// Cache for default preset IDs to avoid repeated lookups.
		$default_group_preset_ids = [];

		// Transform presets into a normalized array of preset items.
		// Each item contains group name, preset ID, default status, and generated class name.
		$normalized = array_reduce(
			$presets,
			function ( $acc, $preset_item ) use ( &$default_group_preset_ids ) {
				if ( ! $preset_item instanceof GlobalPresetItemGroup ) {
					return $acc;
				}

				$group_name = $preset_item->get_data_group_name() ?? '';
				$preset_id  = $preset_item->get_data_id() ?? '';

				// Skip presets with missing required data.
				if ( '' === $group_name || '' === $preset_id || empty( $preset_item->get_data_attrs() ) ) {
					return $acc;
				}

				// Cache defaultPresetId to avoid redundant calls.
				if ( ! isset( $default_group_preset_ids[ $group_name ] ) ) {
					$default_group_preset_ids[ $group_name ] = self::get_default_preset_id(
						[
							'preset_type'     => 'group',
							'preset_sub_type' => $group_name,
						]
					);
				}

				$default_preset_id = $default_group_preset_ids[ $group_name ];
				$is_default        = self::is_preset_id_as_default( $preset_id, $default_preset_id )
					|| ( $preset_item instanceof GlobalPresetItem && $preset_item->as_default() );

				// Generate class name for this preset.
				$class_name = self::get_preset_class_name(
					$group_name,
					$is_default ? 'default' : $preset_id,
					'group'
				);

				// Add normalized preset item to the accumulator.
				$acc[] = [
					'groupName' => $group_name,
					'id'        => $preset_id,
					'isDefault' => $is_default,
					'className' => $class_name,
				];

				return $acc;
			},
			[]
		);

		// Filter out default presets that have non-default duplicates.
		// This ensures that when a group has both a default preset and a custom (non-default) preset,
		// only the custom preset is retained in the final result.
		$filtered = array_filter(
			$normalized,
			function ( $item ) use ( $normalized ) {
				if ( $item['isDefault'] ) {
					// Check if there's a non-default preset with the same group name.
					foreach ( $normalized as $normalized_item ) {
						if ( $normalized_item['groupName'] === $item['groupName'] && ! $normalized_item['isDefault'] ) {
							// Exclude this default preset since a custom preset exists for this group.
							return false;
						}
					}
				}

				return true;
			}
		);

		// Extract class names from filtered items.
		return array_values(
			array_map(
				function ( $item ) {
					return $item['className'];
				},
				$filtered
			)
		);
	}

	/**
	 * Retrieve the selected group presets.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type array  $moduleAttrs The module attributes.
	 *     @type string|WP_Block_Type  $moduleData  The module name or configuration data.
	 *     @type array  $allData     The all data. If not provided, it will be fetched using `GlobalPreset::get_data()`.
	 * }
	 *
	 * @throws InvalidArgumentException If the `moduleAttrs` argument is not provided.
	 *
	 * @return array<GlobalPresetItemGroup> The selected group presets.
	 */
	public static function get_selected_group_presets( array $args ): array {
		if ( ! isset( $args['moduleName'] ) ) {
			throw new InvalidArgumentException( 'The `moduleName` argument is required.' );
		}

		if ( ! isset( $args['moduleAttrs'] ) ) {
			throw new InvalidArgumentException( 'The `moduleAttrs` argument is required.' );
		}

		// Extract the arguments.
		$module_name  = $args['moduleName'];
		$module_attrs = $args['moduleAttrs'];
		$all_data     = $args['allData'] ?? self::get_data();

		$selected      = [];
		$module_config = ModuleRegistration::get_module_settings( $module_name );

		// Get default and merged group presets.
		$default_group_preset_attrs = self::get_group_preset_default_attr( $module_config );

		// Build group presets in canonical order: start with defaults, then overlay explicitly requested presets.
		$group_presets = $default_group_preset_attrs;
		foreach ( ( $module_attrs['groupPreset'] ?? [] ) as $gid => $attr ) {
			$group_presets[ $gid ] = $attr;
		}

		// Transform group presets into normalized array with preset items.
		// Each item contains group ID, group name, item instance, and default status.
		$all_items = [];
		foreach ( $group_presets as $group_id => $attr_value ) {
			$group_name        = $attr_value['groupName'] ?? '';
			$preset_id         = $attr_value['presetId'] ?? '';
			$default_preset_id = $all_data['group'][ $group_name ]['default'] ?? '';

			// Empty preset ID means use default.
			$use_default = empty( $preset_id ) || self::is_preset_id_as_default( $preset_id, $default_preset_id );

			$data_preset_id = $use_default ? $default_preset_id : $preset_id;
			$item           = new GlobalPresetItemGroup(
				[
					'data'       => $all_data['group'][ $group_name ]['items'][ $data_preset_id ] ?? [],
					'asDefault'  => $use_default,
					'isExist'    => isset( $all_data['group'][ $group_name ]['items'][ $data_preset_id ] ),
					'groupId'    => $group_id,
					'moduleName' => $module_name,
				]
			);

			$all_items[] = [
				'groupId'    => $group_id,
				'groupName'  => $group_name,
				'item'       => $item,
				'useDefault' => $use_default,
			];
		}

		// Filter out default presets that have custom duplicates with the same groupName.
		// This ensures that when a groupName has both default and custom presets,
		// only the custom presets are retained in the final result.
		$filtered = array_filter(
			$all_items,
			function ( $item_data ) use ( $all_items ) {
				if ( $item_data['useDefault'] ) {
					// Check if there's a custom preset with the same group name.
					foreach ( $all_items as $other_item ) {
						if ( $other_item['groupName'] === $item_data['groupName'] && ! $other_item['useDefault'] ) {
							// Exclude this default preset since a custom preset exists for this group.
							return false;
						}
					}
				}

				return true;
			}
		);

		// Extract preset items indexed by group ID.
		foreach ( $filtered as $item_data ) {
			$selected[ $item_data['groupId'] ] = $item_data['item'];
		}

		// Ensure all requested group IDs are present in the result even if no data exists.
		foreach ( ( $module_attrs['groupPreset'] ?? [] ) as $group_id => $attr_value ) {
			if ( ! isset( $selected[ $group_id ] ) ) {
				$selected[ $group_id ] = new GlobalPresetItemGroup(
					[
						'data'       => [],
						'asDefault'  => true,
						'isExist'    => false,
						'groupId'    => $group_id,
						'moduleName' => $module_name,
					]
				);
			}
		}

		return $selected;
	}

	/**
	 * Get default group preset attributes from module configuration.
	 *
	 * @since ??
	 *
	 * @param string|WP_Block_Type $module_data Module name or configuration object.
	 *
	 * @return array<string, array<string, string>> The default group preset attributes.
	 */
	public static function get_group_preset_default_attr( $module_data ): array {
		static $group_preset_cache = [];

		$module_name = $module_data->name ?? '';

		if ( isset( $group_preset_cache[ $module_name ] ) ) {
			return $group_preset_cache[ $module_name ];
		}

		$default_attrs = [];
		$attributes    = $module_data->attributes ?? [];

		foreach ( $attributes as $attr_name => $attribute ) {
			$settings = $attribute['settings'] ?? [];

			foreach ( [ 'decoration', 'advanced' ] as $attr_type ) {
				$groups = $settings[ $attr_type ] ?? [];

				foreach ( $groups as $group_id => $group_config ) {
					$group_name = '';

					// Handle different group types.
					if ( empty( $group_config ) || ! isset( $group_config['groupType'] ) ) {
						// Empty group or missing groupType.
						$group_name = self::get_default_group_name( $attr_type, $group_id );
					} elseif ( 'group' === $group_config['groupType'] ) {
						$group_name = $group_config['groupName'] ?? self::get_default_group_name( $attr_type, $group_id );

						// Skip if grouped prop is explicitly false.
						if ( isset( $group_config['component']['props']['grouped'] )
							&& false === $group_config['component']['props']['grouped'] ) {
							continue;
						}
					} elseif ( 'group-item' === $group_config['groupType'] ) {
						// Nested group item.
						$item_component = $group_config['item']['component'] ?? [];
						if ( 'group' === ( $item_component['type'] ?? '' )
							&& ( false !== ( $item_component['props']['grouped'] ?? true ) ) ) {
							$group_name = $item_component['name'] ?? '';
						}
					}

					// Final fallback to default name.
					if ( empty( $group_name ) ) {
						$group_name = self::get_default_group_name( $attr_type, $group_id );
					}

					if ( ! empty( $group_name ) ) {
						$default_attrs[ "{$attr_name}.{$attr_type}.{$group_id}" ] = [
							'groupName' => $group_name,
						];
					}
				}
			}
		}

		// Process composite groups from module metadata.
		$composite_groups = $module_data->settings['groups'] ?? [];

		foreach ( $composite_groups as $group_id => $group ) {
			if ( isset( $group['component']['name'] ) && 'divi/composite' === $group['component']['name'] ) {
				$preset_group_name = $group['component']['props']['presetGroup'] ?? '';
				if ( ! empty( $preset_group_name ) ) {
					$default_attrs[ $group_id ] = [
						'groupName' => $preset_group_name,
					];
				}
			}
		}

		$group_preset_cache[ $module_name ] = $default_attrs;

		return $default_attrs;
	}

	/**
	 * Get default group name mapping.
	 *
	 * @since ??
	 *
	 * @param string $attr_type Attribute type (decoration/advanced).
	 * @param string $group_id  Group ID.
	 *
	 * @return string
	 */
	public static function get_default_group_name( string $attr_type, string $group_id ): string {
		$group_name_map = [
			'decoration' => [
				'animation'   => 'divi/animation',
				'background'  => 'divi/background',
				'bodyFont'    => 'divi/font-body',
				'border'      => 'divi/border',
				'boxShadow'   => 'divi/box-shadow',
				'button'      => 'divi/button',
				'conditions'  => 'divi/conditions',
				'disabledOn'  => 'divi/disabled-on',
				'filters'     => 'divi/filters',
				'font'        => 'divi/font',
				'headingFont' => 'divi/font-header',
				'overflow'    => 'divi/overflow',
				'position'    => 'divi/position',
				'scroll'      => 'divi/scroll',
				'sizing'      => 'divi/sizing',
				'spacing'     => 'divi/spacing',
				'sticky'      => 'divi/sticky',
				'transform'   => 'divi/transform',
				'transition'  => 'divi/transition',
				'zIndex'      => 'divi/z-index',
			],
			'advanced'   => [
				'htmlAttributes' => 'divi/id-classes',
				'text'           => 'divi/text',
			],
		];

		return $group_name_map[ $attr_type ][ $group_id ] ?? '';
	}

	/**
	 * Find preset data by ID from global presets.
	 *
	 * @since ??
	 *
	 * @param string $preset_id The preset ID to find.
	 *
	 * @return array|null The preset data if found, null otherwise.
	 */
	public static function find_preset_data_by_id( string $preset_id ): ?array {
		$all_presets = self::get_data();

		if ( empty( $all_presets ) ) {
			return null;
		}

		// Search through module presets.
		if ( isset( $all_presets['module'] ) ) {
			foreach ( $all_presets['module'] as $module_name => $module_data ) {
				if ( isset( $module_data['items'][ $preset_id ] ) ) {
					return array_merge(
						$module_data['items'][ $preset_id ],
						[
							'moduleName' => $module_name,
							'type'       => 'module',
						]
					);
				}
			}
		}

		// Search through group presets.
		if ( isset( $all_presets['group'] ) ) {
			foreach ( $all_presets['group'] as $group_name => $group_data ) {
				if ( isset( $group_data['items'][ $preset_id ] ) ) {
					return array_merge(
						$group_data['items'][ $preset_id ],
						[
							'groupName' => $group_name,
							'type'      => 'group',
						]
					);
				}
			}
		}

		return null;
	}

	/**
	 * Core preset processing workflow: convert, merge, and prepare presets.
	 *
	 * This utility method handles the core workflow for importing presets:
	 * 1. Auto-detects D4 vs D5 format and converts D4→D5 if needed
	 * 2. Processes and merges with existing presets (with deduplication)
	 * 3. Creates default presets for modules that need them
	 * 4. Returns the final preset data (caller decides whether to save)
	 *
	 * @since ??
	 *
	 * @param array $presets The presets to process (D4 or D5 format).
	 * @param bool  $auto_save Whether to automatically save the result. Default true.
	 *
	 * @return array Returns processed result with preset_id_mappings for content replacement.
	 */
	public static function process_presets_for_import( array $presets, bool $auto_save = true ): array {
		if ( empty( $presets ) ) {
			return [
				'presets'                        => self::get_data(),
				'preset_id_mappings'             => [],
				'defaultImportedModulePresetIds' => [],
				'defaultImportedGroupPresetIds'  => [],
			];
		}

		// Step 1: Auto-detect format and convert D4→D5 if needed.
		$converted_presets = Conversion::maybe_convert_presets_data( $presets );

		// Step 2: Process and merge presets with existing presets.
		$merge_result = self::merge_new_presets_with_existing( $converted_presets );

		// Step 3: Extract presets data from merge result.
		$presets_data = $merge_result['presets'] ?? [];

		// Step 4: Create default presets for modules that now have presets but no default.
		$final_presets = self::maybe_create_default_presets_after_import( $presets_data );

		// Step 5: Optionally save the complete presets.
		if ( $auto_save ) {
			self::save_data( $final_presets );
		}

		// Return the complete result with mappings.
		return [
			'presets'                        => $final_presets,
			'preset_id_mappings'             => $merge_result['preset_id_mappings'] ?? [],
			'defaultImportedModulePresetIds' => $merge_result['defaultImportedModulePresetIds'] ?? [],
			'defaultImportedGroupPresetIds'  => $merge_result['defaultImportedGroupPresetIds'] ?? [],
		];
	}

	/**
	 * Checks if the given preset ID is considered as a default preset.
	 *
	 * This function determines if the provided preset ID matches any of the default
	 * preset identifiers: an empty string, 'default', '_initial' (for legacy presets), or equal to the default preset ID.
	 *
	 * @since ??
	 *
	 * @param string $preset_id The preset ID to check.
	 * @param string $default_preset_id The default preset ID.
	 *
	 * @return bool True if the preset ID is a default preset, false otherwise.
	 */
	public static function is_preset_id_as_default( string $preset_id, string $default_preset_id ): bool {
		return '' === $preset_id || 'default' === $preset_id || '_initial' === $preset_id || $default_preset_id === $preset_id;
	}

	/**
	 * Merges module attributes with preset and group preset attributes.
	 *
	 * This method retrieves and merges attributes from a specified module,
	 * its selected preset, and any applicable group presets.
	 *
	 * Special handling for module.decoration.attributes:
	 * - The attributes field contains an array of attribute items
	 * - Module-level attributes should be combined with preset attributes, not replace them
	 * - This allows users to add module-specific attributes while preserving preset attributes
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type string $moduleName  The module name.
	 *     @type array  $moduleAttrs The module attributes.
	 *     @type array  $allData     The all data. If not provided, it will be fetched using `GlobalPreset::get_data()`.
	 * }
	 *
	 * @throws InvalidArgumentException If 'moduleName' or 'moduleAttrs' is not provided.
	 *
	 * @return array The merged attributes array.
	 */
	public static function get_merged_attrs( array $args ): array {
		if ( ! isset( $args['moduleName'] ) ) {
			throw new InvalidArgumentException( 'The `moduleName` argument is required.' );
		}

		if ( ! isset( $args['moduleAttrs'] ) ) {
			throw new InvalidArgumentException( 'The `moduleAttrs` argument is required.' );
		}

		// Extract the arguments.
		$module_name  = $args['moduleName'];
		$module_attrs = $args['moduleAttrs'];

		$module_presets_attrs = [];

		$selected_preset = self::get_selected_preset(
			[
				'moduleName'  => $module_name,
				'moduleAttrs' => $module_attrs,
			]
		);

		if ( $selected_preset->is_exist() ) {
			$module_presets_attrs = $selected_preset->get_data_attrs();
		}

		$group_presets_attrs = [];

		$selected_group_presets = self::get_selected_group_presets(
			[
				'moduleName'  => $module_name,
				'moduleAttrs' => $module_attrs,
			]
		);

		foreach ( $selected_group_presets as $selected_group_preset ) {
			if ( $selected_group_preset->is_exist() ) {
				$group_presets_attrs = array_replace_recursive( $group_presets_attrs, $selected_group_preset->get_data_attrs() );
			}
		}

		// Standard merge for all attributes.
		$merged_attrs = array_replace_recursive( $module_presets_attrs, $group_presets_attrs, $module_attrs );

		// Special handling for fields that should be merged instead of replaced.
		// array_replace_recursive replaces arrays, but some fields need custom merge logic.
		$merged_attrs = ArrayUtility::apply_mergeable_fields_logic(
			$merged_attrs,
			$module_presets_attrs,
			$group_presets_attrs,
			$module_attrs
		);

		return $merged_attrs;
	}

	/**
	 * Check if a preset has a specific attribute at a given path.
	 *
	 * This method checks whether a module's selected preset contains a non-null value
	 * at the specified attribute path. It returns false if:
	 * - The module has no preset selected
	 * - The preset is using the default preset
	 * - The preset doesn't exist
	 * - The attribute path doesn't exist in the preset
	 * - The attribute value is null
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type string $moduleName     The module name.
	 *     @type array  $moduleAttrs    The module attributes.
	 *     @type string $attributePath  Dot-separated path to the attribute (e.g., 'module.decoration.layout.desktop.value.display').
	 * }
	 *
	 * @throws InvalidArgumentException If 'moduleName' argument is not provided.
	 * @throws InvalidArgumentException If 'moduleAttrs' argument is not provided.
	 * @throws InvalidArgumentException If 'attributePath' argument is not provided.
	 *
	 * @return bool True if preset has the attribute set (non-null), false otherwise.
	 */
	public static function preset_has_attribute( array $args ): bool {
		if ( ! isset( $args['moduleName'] ) ) {
			throw new InvalidArgumentException( 'The `moduleName` argument is required.' );
		}

		if ( ! isset( $args['moduleAttrs'] ) ) {
			throw new InvalidArgumentException( 'The `moduleAttrs` argument is required.' );
		}

		if ( ! isset( $args['attributePath'] ) ) {
			throw new InvalidArgumentException( 'The `attributePath` argument is required.' );
		}

		$module_name    = $args['moduleName'];
		$module_attrs   = $args['moduleAttrs'];
		$attribute_path = $args['attributePath'];

		// Check if module has a preset selected.
		$preset_id = $module_attrs['modulePreset'] ?? '';
		if ( empty( $preset_id ) || 'default' === $preset_id || '_initial' === $preset_id ) {
			return false;
		}

		try {
			// Get the selected preset.
			$selected_preset = self::get_selected_preset(
				[
					'moduleName'  => $module_name,
					'moduleAttrs' => $module_attrs,
				]
			);

			// If preset doesn't exist or is using default, return false.
			if ( ! $selected_preset->is_exist() || $selected_preset->as_default() ) {
				return false;
			}

			// Get preset attributes.
			$preset_attrs = $selected_preset->get_data_attrs();

			// Navigate the attribute path.
			$path_parts = explode( '.', $attribute_path );
			$current    = $preset_attrs;

			foreach ( $path_parts as $part ) {
				if ( ! is_array( $current ) || ! isset( $current[ $part ] ) ) {
					// Path doesn't exist in preset.
					return false;
				}
				$current = $current[ $part ];
			}

			// Check if the final value is non-null.
			return null !== $current;
		} catch ( \Exception $e ) {
			// If any error occurs, assume preset doesn't have the attribute.
			return false;
		}
	}
}
