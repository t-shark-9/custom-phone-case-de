import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Trash, 
  PencilSimple,
  MagnifyingGlass,
  FolderOpen,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Design } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface SavedDesignsGalleryProps {
  onBack: () => void
  onLoadDesign: (design: Design) => void
}

export function SavedDesignsGallery({ onBack, onLoadDesign }: SavedDesignsGalleryProps) {
  const [designs, setDesigns] = useKV<Design[]>('saved-designs', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [designToDelete, setDesignToDelete] = useState<string | null>(null)

  const filteredDesigns = (designs || []).filter(design =>
    design.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp)

  const handleDeleteClick = (designId: string) => {
    setDesignToDelete(designId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (designToDelete) {
      setDesigns((currentDesigns) => 
        (currentDesigns || []).filter(d => d.id !== designToDelete)
      )
      toast.success('Design deleted successfully')
      setDesignToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleLoadDesign = (design: Design) => {
    onLoadDesign(design)
    toast.success(`"${design.name}" loaded`, {
      description: 'Continue editing your design'
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft size={20} />
              Back to Designer
            </Button>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FolderOpen size={32} weight="duotone" className="text-primary" />
                My Designs
              </h1>
              <p className="text-muted-foreground">
                {filteredDesigns.length} {filteredDesigns.length === 1 ? 'design' : 'designs'} saved
              </p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredDesigns.length === 0 ? (
          <Card className="p-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                {searchQuery ? (
                  <MagnifyingGlass size={48} weight="duotone" className="text-muted-foreground" />
                ) : (
                  <Sparkle size={48} weight="duotone" className="text-muted-foreground" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? 'No designs found' : 'No saved designs yet'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Start creating your first custom phone case design'
                }
              </p>
              <Button onClick={onBack} size="lg" className="gap-2">
                <PencilSimple size={20} />
                {searchQuery ? 'Clear Search' : 'Start Designing'}
              </Button>
            </motion.div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDesigns.map((design, index) => (
                <motion.div
                  key={design.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    delay: index * 0.05
                  }}
                >
                  <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <div 
                      className="relative aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center cursor-pointer"
                      onClick={() => handleLoadDesign(design)}
                    >
                      <div 
                        className="w-2/3 h-5/6 rounded-lg shadow-xl transition-transform group-hover:scale-105"
                        style={{ 
                          backgroundColor: design.caseColor,
                          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLoadDesign(design)
                          }}
                        >
                          <PencilSimple size={16} />
                          Edit Design
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate mb-1">
                            {design.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(design.timestamp)}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(design.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {design.parts.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {design.parts.length} part{design.parts.length !== 1 && 's'}
                          </Badge>
                        )}
                        {design.images.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {design.images.length} image{design.images.length !== 1 && 's'}
                          </Badge>
                        )}
                        {design.strokes.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Drawn
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your design.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
