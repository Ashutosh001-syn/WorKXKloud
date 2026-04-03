import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const RESIZE_HIT_AREA = 20
const RESIZE_TOP_OFFSET = 16
const RESIZE_BOTTOM_OFFSET = 16

export default function SortableDashboardSection({
  bodyClassName = '',
  children,
  className = '',
  dragDisabled = false,
  gridClassName = 'col-span-12',
  headerActions,
  headerClassName = '',
  id,
  isResizing = false,
  onResizeStart,
  title,
  titleClassName = '',
}) {
  const [showResizeIndicator, setShowResizeIndicator] = useState(false)
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: dragDisabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  }

  function handleMouseMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const distanceFromTop = event.clientY - bounds.top
    const distanceFromBottom = bounds.bottom - event.clientY
    const isNearRightEdge =
      bounds.right - event.clientX <= RESIZE_HIT_AREA &&
      distanceFromTop >= RESIZE_TOP_OFFSET &&
      distanceFromBottom >= RESIZE_BOTTOM_OFFSET

    setShowResizeIndicator(isNearRightEdge)
  }

  function handleMouseLeave() {
    if (!isResizing) {
      setShowResizeIndicator(false)
    }
  }

  function handleResizeMouseDown(event) {
    setShowResizeIndicator(true)
    onResizeStart(event)
  }

  return (
    <div ref={setNodeRef} style={style} className={`w-full ${gridClassName}`}>
      <article
        className={[
          'relative overflow-hidden rounded-[8px] border border-[#e5edf4] bg-[#f9fbfd] shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition duration-200',
          isDragging ? 'scale-[1.01] shadow-[0_16px_40px_rgba(15,23,42,0.12)]' : '',
          className,
        ].join(' ')}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          ref={setActivatorNodeRef}
          className={[
            'flex cursor-grab select-none items-center justify-between gap-3 border-b border-[#e7eef5] px-3 py-3 active:cursor-grabbing',
            headerClassName,
          ].join(' ')}
          {...attributes}
          {...listeners}
        >
          <h3 className={['text-[13px] font-semibold text-[#202020]', titleClassName].join(' ')}>
            {title}
          </h3>

          <div className="flex items-center gap-2" onPointerDown={(event) => event.stopPropagation()}>
            {headerActions}
          </div>
        </div>

        <div className={bodyClassName}>{children}</div>

        <div
          aria-hidden="true"
          className={[
            'pointer-events-none absolute bottom-3 right-1.5 top-3 w-0.5 rounded-full bg-[#4a82d8] transition duration-150',
            showResizeIndicator || isResizing ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />

        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden w-5 cursor-ew-resize md:block"
          onMouseDown={handleResizeMouseDown}
          onMouseEnter={() => setShowResizeIndicator(true)}
          onMouseLeave={handleMouseLeave}
        />
      </article>
    </div>
  )
}
