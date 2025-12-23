import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SaveDesignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
}

export function SaveDesignDialog({ open, onOpenChange, onSave }: SaveDesignDialogProps) {
  const [designName, setDesignName] = useState('')

  const handleSave = () => {
    if (designName.trim()) {
      onSave(designName.trim())
      setDesignName('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Design</DialogTitle>
          <DialogDescription>
            Give your phone case design a name so you can find it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="design-name">Design Name</Label>
            <Input
              id="design-name"
              placeholder="My Awesome Case"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!designName.trim()}>
            Save Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
