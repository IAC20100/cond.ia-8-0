import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Maximize2, X } from 'lucide-react';

export function SortableTile({ 
  id, 
  children, 
  className, 
  onResize, 
  onClose, 
  isEditMode
}: { 
  id: string, 
  children: React.ReactNode, 
  className: string, 
  onResize: (e: React.MouseEvent) => void, 
  onClose: (e: React.MouseEvent) => void, 
  isEditMode: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: !isEditMode 
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} relative group transition-all duration-300 ${
        isEditMode ? 'hover:ring-4 hover:ring-white/30 hover:ring-inset hover:scale-[1.02] hover:z-40 hover:shadow-2xl cursor-grab active:cursor-grabbing' : ''
      }`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {/* Edit Controls - Only visible on hover when in edit mode */}
      {isEditMode && (
        <>
          {/* Drag Handle Icon - Visual cue */}
          <div 
            className="absolute top-2 left-2 p-2 bg-black/80 text-white rounded-xl z-50 shadow-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResize(e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 bg-black/80 hover:bg-black text-white rounded-xl transition-all border border-white/20 shadow-xl active:scale-90"
              title="Alterar Tamanho"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose(e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl transition-all border border-white/20 shadow-xl active:scale-90"
              title="Ocultar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {children}
    </div>
  );
}
