import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculateTax(subtotal: number, taxRate: number = 0.085): number {
  return subtotal * taxRate;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function calculateTotal(components: any[]): number {
  return components.reduce((total, component) => {
    // If the component has a totalCost property, use it
    if (component.totalCost) {
      return total + Number(component.totalCost);
    }
    
    // If not, calculate from quantity and unitCost
    if (component.quantity && component.unitCost) {
      return total + (Number(component.quantity) * Number(component.unitCost));
    }
    
    return total;
  }, 0);
}
