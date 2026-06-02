'use client';

import { useState, useEffect } from 'react';
import { addCompareId, removeCompareId, isCompareSelected } from './CompareBar';

export default function CompareToggle({ id }: { id: string }) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(isCompareSelected(id));
    const handler = () => setSelected(isCompareSelected(id));
    window.addEventListener('compare-changed', handler);
    return () => window.removeEventListener('compare-changed', handler);
  }, [id]);

  function toggle() {
    if (selected) {
      removeCompareId(id);
    } else {
      addCompareId(id);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        selected
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600'
      }`}
    >
      {selected ? '✓ 已选' : '+ 对比'}
    </button>
  );
}
