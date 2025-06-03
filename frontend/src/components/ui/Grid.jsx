// frontend/src/components/ui/Grid.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Grid = React.forwardRef(({ 
  children,
  className,
  templateColumns,
  templateRows,
  gap = '4',
  rowGap,
  columnGap,
  columns,
  rows,
  ...props 
}, ref) => {
  // Common column patterns
  const columnsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  // Common row patterns
  const rowsMap = {
    1: 'grid-rows-1',
    2: 'grid-rows-2',
    3: 'grid-rows-3',
    4: 'grid-rows-4',
    5: 'grid-rows-5',
    6: 'grid-rows-6',
  };

  // Gap mapping
  const gapMap = {
    '0': 'gap-0',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
    '8': 'gap-8',
  };

  const gridStyles = [];
  
  if (columns) {
    gridStyles.push(columnsMap[columns] || `grid-cols-${columns}`);
  }
  
  if (rows) {
    gridStyles.push(rowsMap[rows] || `grid-rows-${rows}`);
  }

  if (templateColumns) {
    gridStyles.push(`grid-cols-[${templateColumns}]`);
  }

  if (templateRows) {
    gridStyles.push(`grid-rows-[${templateRows}]`);
  }

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        ...gridStyles,
        gapMap[gap] || `gap-${gap}`,
        rowGap && `row-gap-${rowGap}`,
        columnGap && `col-gap-${columnGap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

export default Grid;