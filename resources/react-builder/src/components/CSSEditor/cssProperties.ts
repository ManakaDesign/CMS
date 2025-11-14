// Common CSS properties for autocomplete
export const CSS_PROPERTIES = [
  // Display & Layout
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
  'z-index', 'visibility', 'opacity',
  
  // Flexbox
  'flex', 'flex-direction', 'flex-wrap', 'flex-flow',
  'justify-content', 'align-items', 'align-content', 'align-self',
  'flex-grow', 'flex-shrink', 'flex-basis', 'order', 'gap',
  
  // Grid
  'grid', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'grid-column', 'grid-row', 'grid-area', 'grid-gap', 'grid-column-gap', 'grid-row-gap',
  
  // Box Model
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  
  // Border
  'border', 'border-width', 'border-style', 'border-color', 'border-radius',
  'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-right-radius', 'border-bottom-left-radius',
  'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  
  // Background
  'background', 'background-color', 'background-image', 'background-position',
  'background-size', 'background-repeat', 'background-origin', 'background-clip',
  'background-attachment', 'background-blend-mode',
  
  // Typography
  'color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style',
  'font-variant', 'line-height', 'letter-spacing', 'word-spacing',
  'text-align', 'text-decoration', 'text-transform', 'text-indent',
  'text-overflow', 'text-shadow', 'white-space', 'word-wrap', 'word-break',
  'vertical-align',
  
  // Shadows & Effects
  'box-shadow', 'filter', 'backdrop-filter',
  
  // Transforms & Animations
  'transform', 'transform-origin', 'transition', 'transition-property',
  'transition-duration', 'transition-timing-function', 'transition-delay',
  'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
  'animation-delay', 'animation-iteration-count', 'animation-direction',
  'animation-fill-mode', 'animation-play-state',
  
  // Lists & Tables
  'list-style', 'list-style-type', 'list-style-position', 'list-style-image',
  'table-layout', 'border-collapse', 'border-spacing', 'caption-side',
  'empty-cells',
  
  // Other
  'cursor', 'pointer-events', 'user-select', 'resize', 'content',
  'quotes', 'counter-reset', 'counter-increment',
].sort();

// Properties that accept color values
export const COLOR_PROPERTIES = [
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-shadow',
  'box-shadow',
];
