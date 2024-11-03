/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/react-in-jsx-scope */
import { X, Maximize2 } from 'lucide-react'

const WindowControls: React.FC<{
  onClose: () => void
  onMaximize: () => void
}> = ({ onClose, onMaximize }) => (
  <div className="group absolute right-2 top-2 z-10 transition-opacity hover:opacity-100">
    <div className="flex">
      <button onClick={onMaximize} className="cursor-pointer bg-transparent p-1.5 transition-colors" title="Maximize">
        <Maximize2 className="size-3 text-neutral-400 hover:text-neutral-300" />
      </button>
      <button onClick={onClose} className="cursor-pointer bg-transparent p-1.5 transition-colors" title="Close">
        <X className="size-3 text-neutral-400 hover:text-neutral-300" />
      </button>
    </div>
  </div>
)

export default WindowControls
