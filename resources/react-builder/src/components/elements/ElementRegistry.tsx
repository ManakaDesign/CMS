import React from 'react';
import type { Element, ElementType } from '../../types';
import { Section } from './Section';
import { Row } from './Row';
import { Column } from './Column';
import { Text } from './Text';
import { Heading } from './Heading';
import { Image } from './Image';
import { Button } from './Button';
import { Spacer } from './Spacer';
import { Divider } from './Divider';
import { Video } from './Video';
import { Code } from './Code';

interface ElementComponentProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const elementComponents: Record<ElementType, React.FC<ElementComponentProps>> = {
  section: Section,
  row: Row,
  column: Column,
  text: Text,
  heading: Heading,
  image: Image,
  button: Button,
  spacer: Spacer,
  divider: Divider,
  video: Video,
  code: Code,
};

export const getElementComponent = (type: ElementType): React.FC<ElementComponentProps> => {
  return elementComponents[type] || Text;
};

export const renderElement = (
  element: Element,
  props: Omit<ElementComponentProps, 'element'>
): React.ReactNode => {
  const Component = getElementComponent(element.type);
  return <Component element={element} {...props} />;
};
