'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ActionTone = 'default' | 'danger' | 'success';

interface RowActionItem {
  label: string;
  onClick: () => void;
  tone?: ActionTone;
  icon?: string;
  disabled?: boolean;
}

interface RowActionsMenuProps {
  items: RowActionItem[];
  align?: 'left' | 'right';
  buttonClassName?: string;
  menuClassName?: string;
}

const toneClass: Record<ActionTone, string> = {
  default: 'text-hw1-navy hover:bg-blue-50',
  danger: 'text-red-600 hover:bg-red-50',
  success: 'text-emerald-700 hover:bg-emerald-50',
};

export default function RowActionsMenu({
  items,
  align = 'right',
  buttonClassName = 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  menuClassName = '',
}: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useRef(`ram-${Math.random().toString(36).slice(2, 8)}`).current;
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: align === 'right' ? rect.right : rect.left,
    });
  }, [align]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) close();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const handleScroll = () => updatePosition();
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, close, updatePosition]);

  const dropdown = open && pos ? createPortal(
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      style={{
        position: 'fixed',
        top: pos.top,
        left: align === 'right' ? undefined : pos.left,
        right: align === 'right' ? (window.innerWidth - pos.left) : undefined,
        zIndex: 9999,
      }}
      className={`w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 transition-all duration-150 origin-top opacity-100 scale-100 ${menuClassName}`}
    >
      {items.map((item) => {
        const tone = item.tone ?? 'default';
        return (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              setOpen(false);
            }}
            disabled={item.disabled}
            className={`w-full text-left px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${toneClass[tone]}`}
          >
            {item.icon ? <span aria-hidden="true">{item.icon} </span> : ''}
            {item.label}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-lg leading-none ${buttonClassName}`}
        title="Ações"
        aria-label="Abrir menu de ações"
        aria-expanded={open}
        aria-controls={menuId}
      >
        ⋮
      </button>
      {dropdown}
    </div>
  );
}
