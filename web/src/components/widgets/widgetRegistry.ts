import { FC } from 'react';
import { WidgetType } from '@/types/widget';

/**
 * Widget props interface - all widgets must conform to this
 */
export interface WidgetProps {
  config: any;
}

/**
 * Widget config form props - for rendering config forms in dialogs
 */
export interface WidgetConfigFormProps<T = any> {
  config: T;
  onChange: (config: T) => void;
}

/**
 * Widget module interface - defines the contract for each widget
 */
export interface WidgetModule<T = any> {
  /** Unique widget type identifier */
  type: WidgetType;

  /** Display label (i18n key) */
  label: string;

  /** Description (i18n key) */
  description: string;

  /** Default configuration */
  defaultConfig: T;

  /** Widget component */
  Component: FC<WidgetProps>;

  /** Configuration form component (optional) */
  ConfigForm?: FC<WidgetConfigFormProps<T>>;
}

/**
 * Widget Registry - Singleton pattern for managing widget types
 */
class WidgetRegistry {
  private static instance: WidgetRegistry;
  private registry: Map<WidgetType, WidgetModule>;

  private constructor() {
    this.registry = new Map();
  }

  public static getInstance(): WidgetRegistry {
    if (!WidgetRegistry.instance) {
      WidgetRegistry.instance = new WidgetRegistry();
    }
    return WidgetRegistry.instance;
  }

  /**
   * Register a widget module
   */
  public register(widget: WidgetModule): void {
    if (this.registry.has(widget.type)) {
      console.warn(`Widget type "${widget.type}" is already registered. Overwriting...`);
    }
    this.registry.set(widget.type, widget);
  }

  /**
   * Get a widget module by type
   */
  public get(type: WidgetType): WidgetModule | undefined {
    return this.registry.get(type);
  }

  /**
   * Get all registered widget modules
   */
  public getAll(): WidgetModule[] {
    return Array.from(this.registry.values());
  }

  /**
   * Check if a widget type is registered
   */
  public has(type: WidgetType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered widget types
   */
  public getTypes(): WidgetType[] {
    return Array.from(this.registry.keys());
  }
}

// Export singleton instance methods
const registryInstance = WidgetRegistry.getInstance();

export const registerWidget = (widget: WidgetModule) => registryInstance.register(widget);
export const getWidget = (type: WidgetType) => registryInstance.get(type);
export const getAllWidgets = () => registryInstance.getAll();
export const hasWidget = (type: WidgetType) => registryInstance.has(type);
export const getWidgetTypes = () => registryInstance.getTypes();