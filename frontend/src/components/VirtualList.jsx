// Virtual scrolling component for large lists
import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useVirtualScroll } from '../utils/performance';

const VirtualList = memo(({
  items = [],
  renderItem,
  itemHeight = 80,
  height = 400,
  className = '',
  overscan = 5,
  onScroll,
  getItemId = (item, index) => index
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex
  } = useMemo(() => {
    const containerHeight = height;
    const startIdx = Math.floor(scrollTop / itemHeight);
    const endIdx = Math.min(
      startIdx + Math.ceil(containerHeight / itemHeight) + overscan * 2,
      items.length
    );
    const actualStartIdx = Math.max(0, startIdx - overscan);

    return {
      visibleItems: items.slice(actualStartIdx, endIdx).map((item, index) => ({
        ...item,
        index: actualStartIdx + index,
        offsetY: (actualStartIdx + index) * itemHeight
      })),
      totalHeight: items.length * itemHeight,
      startIndex: actualStartIdx,
      endIndex: endIdx
    };
  }, [items, itemHeight, height, scrollTop, overscan]);

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item) => (
          <div
            key={getItemId(item, item.index)}
            style={{
              position: 'absolute',
              top: item.offsetY,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, item.index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

export default VirtualList;