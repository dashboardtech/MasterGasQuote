import React, { useState } from "react";
import { ChevronRight, ChevronDown, Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Component } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ComponentTreeProps {
  components: Component[];
  onAddSubcomponent?: (parentId: number) => void;
  onViewDetails?: (component: Component) => void;
}

interface ComponentNodeProps {
  component: Component;
  subComponents: Component[];
  level: number;
  onAddSubcomponent?: (parentId: number) => void;
  onViewDetails?: (component: Component) => void;
  getChildrenOf: (parentId: number) => Component[];
}

const ComponentNode: React.FC<ComponentNodeProps> = ({
  component,
  subComponents,
  level,
  onAddSubcomponent,
  onViewDetails,
  getChildrenOf
}) => {
  const [expanded, setExpanded] = useState(level <= 1);
  const hasChildren = subComponents.length > 0;
  
  return (
    <div className="component-node">
      <div 
        className={cn(
          "flex items-center py-2 px-2 hover:bg-muted/40 rounded-md transition-colors",
          level > 0 ? "ml-6" : ""
        )}
      >
        <div
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={cn(
            "mr-1 cursor-pointer text-muted-foreground",
            !hasChildren && "invisible"
          )}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        
        <div 
          onClick={() => onViewDetails && onViewDetails(component)}
          className="flex-1 flex items-center cursor-pointer"
        >
          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">{component.name}</span>
          <Badge variant="outline" className="ml-2 capitalize text-xs">
            {component.type}
          </Badge>
          <span className="ml-auto text-sm text-muted-foreground">
            {formatCurrency(parseFloat(component.unitCost))} × {component.quantity}
          </span>
        </div>
        
        {onAddSubcomponent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddSubcomponent(component.id);
            }}
            className="ml-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Sub
          </Button>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div className="pl-2 border-l ml-3 mt-1 mb-1 border-dashed border-muted-foreground/20">
          {subComponents.map((subComponent) => (
            <ComponentNode
              key={subComponent.id}
              component={subComponent}
              subComponents={getChildrenOf(subComponent.id)}
              level={level + 1}
              onAddSubcomponent={onAddSubcomponent}
              onViewDetails={onViewDetails}
              getChildrenOf={getChildrenOf}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  components,
  onAddSubcomponent,
  onViewDetails
}) => {
  // Organize components into a tree structure
  const rootComponents = components.filter(c => !c.parentId);
  
  // Function to get children of a component
  const getChildrenOf = (parentId: number) => {
    return components.filter(c => c.parentId === parentId);
  };
  
  return (
    <div className="component-tree border rounded-md p-4 bg-background">
      {rootComponents.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No components found</p>
        </div>
      ) : (
        rootComponents.map((component) => (
          <ComponentNode
            key={component.id}
            component={component}
            subComponents={getChildrenOf(component.id)}
            level={0}
            onAddSubcomponent={onAddSubcomponent}
            onViewDetails={onViewDetails}
            getChildrenOf={getChildrenOf}
          />
        ))
      )}
    </div>
  );
};