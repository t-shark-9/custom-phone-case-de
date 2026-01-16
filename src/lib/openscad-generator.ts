/**
 * OpenSCAD Parameter Generator
 * Generates .scad parameter files for phone case models
 * Based on the Phone_cover_base.scad template
 */

import { PhoneModelSpec, PHONE_MODELS } from './types'

/**
 * Generate OpenSCAD parameter file content for a phone model
 */
export function generateOpenScadParams(model: PhoneModelSpec): string {
  const params = `// Auto-generated OpenSCAD parameters for ${model.name}
// Generated from Apple Accessory Design Guidelines specifications
// Brand: ${model.brand} | Series: ${model.series}

// ============ Phone Dimensions (mm) ============
LENGTH = ${model.height.toFixed(2)};  // Phone height
WIDTH = ${model.width.toFixed(2)};    // Phone width  
HEIGHT = ${model.depth.toFixed(2)};   // Phone thickness
CORNER_RADIUS = ${model.cornerRadius.toFixed(2)};

// ============ Case Parameters ============
WALL_THICKNESS = 1.5;
BASEPLATE_THICKNESS = 1.2;
HOLDER_WIDTH = 1.5;
HOLDER_HEIGHT = 1.0;
SMOOTHER = 0.5;

// ============ Wall Lengths ============
WALL_TOP_TO_BOTTOM_LENGHT = ${model.height.toFixed(2)};
WALL_LEFT_TO_RIGHT_LENGHT = ${model.width.toFixed(2)};

// ============ Camera Cutout ============
CAMERA_HOLE = "yes";
CAMERA_TOP_OFFSET = ${model.cameraOffsetX.toFixed(2)};
CAMERA_LEFT_OFFSET = ${model.cameraOffsetY.toFixed(2)};
CAMERA_TOP_TO_BOTTOM_SIZE = ${model.cameraHeight.toFixed(2)};
CAMERA_LEFT_TO_RIGHT_SIZE = ${model.cameraWidth.toFixed(2)};
CAMERA_RADIUS = ${model.cameraCornerRadius.toFixed(2)};

// ============ Volume Button ============
VOLUME_BUTTON_HOLE = "yes";
VOLUME_BUTTON_SIDE = "Left";
VOLUME_BUTTON_SHAPE = "Roundy Rectangle";
VOLUME_BUTTON_OFFSET = ${model.volumeButtonOffset.toFixed(2)};
VOLUME_BUTTON_SIZE = ${model.volumeButtonLength.toFixed(2)};

// ============ Power Button ============
POWER_BUTTON_HOLE = "yes";
POWER_BUTTON_SIDE = "Right";
POWER_BUTTON_SHAPE = "Roundy Rectangle";
POWER_BUTTON_OFFSET = ${model.powerButtonOffset.toFixed(2)};
POWER_BUTTON_SIZE = ${model.powerButtonLength.toFixed(2)};

${model.hasActionButton ? `// ============ Action Button (iPhone 15 Pro+) ============
ACTION_BUTTON_HOLE = "yes";
ACTION_BUTTON_SIDE = "Left";
ACTION_BUTTON_SHAPE = "Roundy Rectangle";
ACTION_BUTTON_OFFSET = ${model.actionButtonOffset?.toFixed(2) || '0.00'};
ACTION_BUTTON_SIZE = 8.00;
` : '// No Action Button for this model'}

// ============ USB-C Port ============
USB_PLUG_HOLE = "yes";
USB_PLUG_SIDE = "Bottom";
USB_PLUG_SHAPE = "Roundy Rectangle";
USB_PLUG_OFFSET = ${model.usbPortOffset.toFixed(2)};
USB_PLUG_SIZE = 12.00;

// ============ Speakers ============
SPEAKER_1_HOLE = "yes";
SPEAKER_1_SIDE = "Bottom";
SPEAKER_1_SHAPE = "Roundy Rectangle";
SPEAKER_1_OFFSET = ${model.speakerLeftOffset.toFixed(2)};
SPEAKER_1_SIZE = 15.00;

SPEAKER_2_HOLE = "yes";
SPEAKER_2_SIDE = "Bottom";
SPEAKER_2_SHAPE = "Roundy Rectangle";
SPEAKER_2_OFFSET = ${model.speakerRightOffset.toFixed(2)};
SPEAKER_2_SIZE = 15.00;

// ============ No Headphone Jack (Modern iPhones) ============
HEADPHONE_JACK_HOLE = "no";
HEADPHONE_JACK_SIDE = "Bottom";
HEADPHONE_JACK_SHAPE = "Circular";
HEADPHONE_JACK_OFFSET = 0;
HEADPHONE_JACK_SIZE = 3.5;

// ============ No SD Card Slot ============
CARD_SLOT_HOLE = "no";
CARD_SLOT_SIDE = "Right";
CARD_SLOT_SHAPE = "Roundy Rectangle";
CARD_SLOT_OFFSET = 0;
CARD_SLOT_SIZE = 0;

// ============ No Fingerprint Sensor (Face ID) ============
FINGERPRINT_HOLE = "no";
FINGERPRINT_TOP_OFFSET = 0;
FINGERPRINT_LEFT_OFFSET = 0;
FINGERPRINT_TOP_TO_BOTTOM_SIZE = 0;
FINGERPRINT_LEFT_TO_RIGHT_SIZE = 0;
FINGERPRINT_RADIUS = 0;

// ============ Flash Cutout (included in camera) ============
FLASHLIGHT_HOLE = "no";
FLASHLIGHT_TOP_OFFSET = 0;
FLASHLIGHT_LEFT_OFFSET = 0;
FLASHLIGHT_TOP_TO_BOTTOM_SIZE = 0;
FLASHLIGHT_LEFT_TO_RIGHT_SIZE = 0;
FLASHLIGHT_RADIUS = 0;

// ============ Model Metadata ============
// Model ID: ${model.id}
// MagSafe: ${model.hasMagSafe ? 'Yes' : 'No'}
// Dynamic Island: ${model.hasDynamicIsland ? 'Yes' : 'No'}
// Action Button: ${model.hasActionButton ? 'Yes' : 'No'}
// Camera Control: ${model.hasCameraControl ? 'Yes' : 'No'}
`

  return params
}

/**
 * Generate filename for OpenSCAD parameter file
 */
export function getOpenScadFilename(model: PhoneModelSpec): string {
  return `${model.id}_param.scad`
}

/**
 * Generate all OpenSCAD parameter files as a map
 */
export function generateAllOpenScadParams(): Map<string, string> {
  const result = new Map<string, string>()
  
  for (const model of PHONE_MODELS) {
    const filename = getOpenScadFilename(model)
    const content = generateOpenScadParams(model)
    result.set(filename, content)
  }
  
  return result
}

/**
 * Get dimensions summary for display
 */
export function getDimensionsSummary(model: PhoneModelSpec): string {
  return `${model.width.toFixed(1)} × ${model.height.toFixed(1)} × ${model.depth.toFixed(1)} mm`
}

/**
 * Get features list for display
 */
export function getFeaturesList(model: PhoneModelSpec): string[] {
  const features: string[] = []
  if (model.hasMagSafe) features.push('MagSafe')
  if (model.hasDynamicIsland) features.push('Dynamic Island')
  if (model.hasActionButton) features.push('Action Button')
  if (model.hasCameraControl) features.push('Camera Control')
  return features
}
