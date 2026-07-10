import { useState, useRef, useCallback } from 'react'
import { Plus, Image, Type, Quote, Target, Trash2, Download, Palette, ZoomIn, ZoomOut, Move, Star } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { motion, AnimatePresence } from 'framer-motion'
import type { VisionBoard, VisionItem } from '../../types'

const BOARD_BACKGROUNDS = [
  { id: 'gradient-1', label: 'Deep Space', style: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'gradient-2', label: 'Sunset', style: 'linear-gradient(135deg, #f093fb, #f5576c, #4facfe)' },
  { id: 'gradient-3', label: 'Ocean', style: 'linear-gradient(135deg, #0575e6, #021b79)' },
  { id: 'gradient-4', label: 'Forest', style: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { id: 'gradient-5', label: 'Gold', style: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { id: 'dark', label: 'Dark', style: '#0f1117' },
]

const QUOTE_TEMPLATES = [
  '"The secret of getting ahead is getting started." — Mark Twain',
  '"Dream big. Start small. Act now."',
  '"Success is not final, failure is not fatal: it is the courage to continue that counts."',
  '"You are capable of more than you know."',
  '"Focus on the journey, not the destination."',
  '"Every day is a new opportunity to grow."',
]

export function VisionBoardView() {
  const { visionBoards, addVisionBoard, updateVisionBoard, deleteVisionBoard, addVisionItem, updateVisionItem, deleteVisionItem, settings } = useAppStore()
  const [activeBoardId, setActiveBoardId] = useState<string | null>(visionBoards[0]?.id || null)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [addingType, setAddingType] = useState<VisionItem['type'] | null>(null)
  const [newText, setNewText] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const activeBoard = visionBoards.find(b => b.id === activeBoardId)

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return
    addVisionBoard(newBoardName)
    setNewBoardName('')
    setShowNewBoard(false)
    // Set active to the newly created board
    setTimeout(() => {
      const boards = useAppStore.getState().visionBoards
      setActiveBoardId(boards[boards.length - 1]?.id || null)
    }, 100)
  }

  const handleAddImage = async () => {
    if (!activeBoardId) return
    const api = (window as any).electronAPI
    if (api) {
      const paths = await api.openFileDialog()
      if (paths && paths.length > 0) {
        paths.forEach((path: string, i: number) => {
          addVisionItem(activeBoardId, {
            type: 'image',
            content: `file://${path}`,
            x: 50 + i * 20,
            y: 50 + i * 20,
            width: 200,
            height: 150,
          })
        })
      }
    } else {
      // Browser fallback: use URL
      const url = prompt('Enter image URL:')
      if (url) {
        addVisionItem(activeBoardId, {
          type: 'image',
          content: url,
          x: 50,
          y: 50,
          width: 200,
          height: 150,
        })
      }
    }
  }

  const handleAddText = (type: VisionItem['type']) => {
    if (!activeBoardId || !newText.trim()) return
    addVisionItem(activeBoardId, {
      type,
      content: newText,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 250,
      height: 80,
      color: type === 'goal' ? '#6171f6' : type === 'quote' ? '#f97316' : '#ffffff',
      fontSize: type === 'goal' ? 18 : type === 'quote' ? 14 : 16,
      fontWeight: type === 'goal' ? '700' : '400',
    })
    setNewText('')
    setAddingType(null)
  }

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    const item = activeBoard?.items.find(i => i.id === itemId)
    if (!item) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDraggingId(itemId)
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId || !activeBoardId || !canvasRef.current) return
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - canvasRect.left - dragOffset.x) / zoom
    const y = (e.clientY - canvasRect.top - dragOffset.y) / zoom
    updateVisionItem(activeBoardId, draggingId, { x: Math.max(0, x), y: Math.max(0, y) })
  }, [draggingId, activeBoardId, dragOffset, zoom])

  const handleMouseUp = () => setDraggingId(null)

  const getBg = (bgId: string) => BOARD_BACKGROUNDS.find(b => b.id === bgId)?.style || '#0f1117'

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Star size={20} className="text-amber-400" />
            Vision Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Visualize your goals and dreams</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="btn-ghost p-2">
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="btn-ghost p-2">
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Board list + tools */}
        <div className="w-44 sm:w-56 border-r border-white/5 flex flex-col bg-surface-800 flex-shrink-0">
          {/* Boards */}
          <div className="p-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Boards</span>
              <button onClick={() => setShowNewBoard(true)} className="text-primary-400 hover:text-primary-300">
                <Plus size={14} />
              </button>
            </div>
            {showNewBoard && (
              <div className="mb-2">
                <input
                  className="input-field text-xs mb-1"
                  placeholder="Board name..."
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button onClick={handleCreateBoard} className="flex-1 text-xs bg-primary-600 text-white rounded-lg py-1">Create</button>
                  <button onClick={() => setShowNewBoard(false)} className="flex-1 text-xs bg-white/5 text-slate-400 rounded-lg py-1">Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              {visionBoards.map(board => (
                <div
                  key={board.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${activeBoardId === board.id ? 'bg-primary-600/20 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveBoardId(board.id)}
                >
                  <span className="text-xs truncate">{board.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteVisionBoard(board.id); if (activeBoardId === board.id) setActiveBoardId(null) }} className="text-slate-600 hover:text-red-400 ml-1">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              {visionBoards.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-2">No boards yet</p>
              )}
            </div>
          </div>

          {/* Add Items */}
          {activeBoard && (
            <div className="p-3 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Add Items</span>
              <div className="space-y-1">
                <button onClick={handleAddImage} className="btn-ghost w-full text-xs justify-start">
                  <Image size={14} /> Add Image
                </button>
                <button onClick={() => setAddingType('text')} className="btn-ghost w-full text-xs justify-start">
                  <Type size={14} /> Add Text
                </button>
                <button onClick={() => setAddingType('quote')} className="btn-ghost w-full text-xs justify-start">
                  <Quote size={14} /> Add Quote
                </button>
                <button onClick={() => setAddingType('goal')} className="btn-ghost w-full text-xs justify-start">
                  <Target size={14} /> Add Goal
                </button>
              </div>

              {addingType && (
                <div className="mt-2">
                  <textarea
                    className="input-field text-xs resize-none h-16 mb-1"
                    placeholder={addingType === 'quote' ? 'Enter your quote...' : addingType === 'goal' ? 'Enter your goal...' : 'Enter text...'}
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    autoFocus
                  />
                  {addingType === 'quote' && (
                    <div className="mb-1 space-y-0.5">
                      {QUOTE_TEMPLATES.slice(0, 3).map((q, i) => (
                        <button key={i} onClick={() => setNewText(q)} className="text-[10px] text-slate-500 hover:text-slate-300 text-left w-full truncate">
                          {q.substring(0, 40)}...
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => handleAddText(addingType)} className="flex-1 text-xs bg-primary-600 text-white rounded-lg py-1">Add</button>
                    <button onClick={() => { setAddingType(null); setNewText('') }} className="flex-1 text-xs bg-white/5 text-slate-400 rounded-lg py-1">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Background */}
          {activeBoard && (
            <div className="p-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Background</span>
              <div className="grid grid-cols-3 gap-1">
                {BOARD_BACKGROUNDS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => updateVisionBoard(activeBoard.id, { background: bg.id })}
                    className={`h-8 rounded-lg transition-all ${activeBoard.background === bg.id ? 'ring-2 ring-primary-400' : ''}`}
                    style={{ background: bg.style }}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative bg-surface-900">
          {!activeBoard ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Star size={48} className="text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">No board selected</h3>
              <p className="text-slate-600 text-sm mb-4">Create a vision board to visualize your goals</p>
              <button onClick={() => setShowNewBoard(true)} className="btn-primary">
                <Plus size={16} /> Create Board
              </button>
            </div>
          ) : (
            <div
              ref={canvasRef}
              className="w-full h-full overflow-auto"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="relative"
                style={{
                  width: `${1200 * zoom}px`,
                  height: `${800 * zoom}px`,
                  background: getBg(activeBoard.background),
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  minWidth: '100%',
                  minHeight: '100%',
                }}
              >
                {activeBoard.items.map(item => (
                  <VisionItemComponent
                    key={item.id}
                    item={item}
                    isDragging={draggingId === item.id}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                    onDelete={() => deleteVisionItem(activeBoard.id, item.id)}
                    onUpdate={(updates) => updateVisionItem(activeBoard.id, item.id, updates)}
                  />
                ))}

                {activeBoard.items.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center opacity-30">
                      <Star size={48} className="text-white mx-auto mb-2" />
                      <p className="text-white text-sm">Add images, text, quotes, and goals to your vision board</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VisionItemComponent({ item, isDragging, onMouseDown, onDelete, onUpdate }: {
  item: VisionItem
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onDelete: () => void
  onUpdate: (updates: Partial<VisionItem>) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.content)

  const handleDoubleClick = () => {
    if (item.type !== 'image') {
      setIsEditing(true)
      setEditText(item.content)
    }
  }

  const handleEditSave = () => {
    onUpdate({ content: editText })
    setIsEditing(false)
  }

  return (
    <div
      className={`absolute group select-none ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab z-10 hover:z-20'}`}
      style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Controls */}
      <div className="absolute -top-6 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="w-5 h-5 bg-red-500 rounded text-white flex items-center justify-center hover:bg-red-400"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => {
          e.stopPropagation()
          const startX = e.clientX
          const startY = e.clientY
          const startW = item.width
          const startH = item.height
          const onMove = (me: MouseEvent) => {
            onUpdate({ width: Math.max(80, startW + me.clientX - startX), height: Math.max(40, startH + me.clientY - startY) })
          }
          const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
          document.addEventListener('mousemove', onMove)
          document.addEventListener('mouseup', onUp)
        }}
      >
        <div className="w-full h-full border-b-2 border-r-2 border-white/40 rounded-br" />
      </div>

      {/* Content */}
      {item.type === 'image' ? (
        <img
          src={item.content}
          alt="Vision"
          className="w-full h-full object-cover rounded-xl border border-white/10 shadow-lg"
          draggable={false}
        />
      ) : isEditing ? (
        <textarea
          className="w-full h-full bg-black/50 text-white rounded-xl p-2 resize-none border border-primary-500 focus:outline-none text-sm"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleEditSave()}
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center rounded-xl p-3 shadow-lg border border-white/10 ${item.type === 'goal' ? 'bg-primary-600/30' : item.type === 'quote' ? 'bg-accent-500/20' : 'bg-white/10'}`}
        >
          <p
            className="text-center leading-relaxed"
            style={{
              color: item.color || '#ffffff',
              fontSize: `${item.fontSize || 14}px`,
              fontWeight: item.fontWeight || '400',
            }}
          >
            {item.type === 'quote' && <span className="text-2xl opacity-50 mr-1">"</span>}
            {item.content}
            {item.type === 'quote' && <span className="text-2xl opacity-50 ml-1">"</span>}
          </p>
        </div>
      )}
    </div>
  )
}
