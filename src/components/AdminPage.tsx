import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Download,
  Eye,
  Trash,
  MagnifyingGlass,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Lock,
  FileZip,
  Image,
  Cube
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Order } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminPageProps {
  onBack: () => void
}

// Simple password protection (in production, use proper auth)
const ADMIN_PASSWORD = 'casecanvas2026'

export function AdminPage({ onBack }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('admin-orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      toast.success('Welcome to Admin Panel')
    } else {
      toast.error('Incorrect password')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)
    localStorage.setItem('admin-orders', JSON.stringify(updatedOrders))
    toast.success(`Order status updated to ${newStatus}`)
  }

  const deleteOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    
    const updatedOrders = orders.filter(order => order.id !== orderId)
    setOrders(updatedOrders)
    localStorage.setItem('admin-orders', JSON.stringify(updatedOrders))
    setSelectedOrder(null)
    toast.success('Order deleted')
  }

  const downloadDesignFile = (order: Order, itemIndex: number) => {
    const item = order.items[itemIndex]
    const design = item.design
    
    // Create a comprehensive design file
    const designData = {
      orderNumber: order.orderNumber,
      customer: order.customer,
      phoneModel: design.phoneModel,
      caseColor: design.caseColor,
      caseTexture: design.caseTexture,
      parts: design.parts,
      decals: design.decals,
      strokes: design.strokes,
      images: design.images,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `order-${order.orderNumber}-design-${itemIndex + 1}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Design file downloaded')
  }

  const downloadAllDesigns = (order: Order) => {
    order.items.forEach((_, index) => {
      setTimeout(() => downloadDesignFile(order, index), index * 500)
    })
  }

  const downloadThumbnail = (order: Order, itemIndex: number) => {
    const item = order.items[itemIndex]
    const thumbnail = item.design.thumbnail
    
    if (!thumbnail) {
      toast.error('No thumbnail available')
      return
    }
    
    const a = document.createElement('a')
    a.href = thumbnail
    a.download = `order-${order.orderNumber}-thumbnail-${itemIndex + 1}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    toast.success('Thumbnail downloaded')
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'shipped': return 'bg-purple-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'processing': return <Package size={16} />
      case 'shipped': return <Truck size={16} />
      case 'delivered': return <CheckCircle size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Enter password to access admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Store
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  // Order detail view
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </Button>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Order #{selectedOrder.orderNumber}</h1>
                <p className="text-muted-foreground">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                {getStatusIcon(selectedOrder.status)}
                <span className="ml-1 capitalize">{selectedOrder.status}</span>
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer.fullName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer.email}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="space-y-1 text-sm">
                  <p>{selectedOrder.customer.address}</p>
                  <p>{selectedOrder.customer.zipCode} {selectedOrder.customer.city}</p>
                  <p>{selectedOrder.customer.state}, {selectedOrder.customer.country}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Items */}
            <h3 className="font-semibold mb-4">Order Items ({selectedOrder.items.length})</h3>
            <div className="space-y-4 mb-6">
              {selectedOrder.items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.design.thumbnail ? (
                        <img 
                          src={item.design.thumbnail} 
                          alt={item.design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Cube size={32} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.design.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.design.phoneModel} • Color: {item.design.caseColor}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × €{item.price.toFixed(2)}
                      </p>
                      
                      {/* Design stats */}
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {item.design.parts?.length > 0 && (
                          <span>{item.design.parts.length} 3D parts</span>
                        )}
                        {item.design.decals?.length > 0 && (
                          <span>{item.design.decals.length} decals</span>
                        )}
                        {item.design.strokes?.length > 0 && (
                          <span>{item.design.strokes.length} strokes</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadDesignFile(selectedOrder, index)}
                      >
                        <Download size={14} className="mr-1" />
                        JSON
                      </Button>
                      {item.design.thumbnail && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadThumbnail(selectedOrder, index)}
                        >
                          <Image size={14} className="mr-1" />
                          PNG
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-muted rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>€{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>€{selectedOrder.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>€{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>€{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => downloadAllDesigns(selectedOrder)}>
                <FileZip size={18} className="mr-2" />
                Download All Designs
              </Button>
              
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <Button 
                variant="destructive" 
                onClick={() => deleteOrder(selectedOrder.id)}
              >
                <Trash size={18} className="mr-2" />
                Delete Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Orders list
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <ArrowLeft size={20} className="mr-2" />
              Back to Store
            </Button>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage orders and download design files</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {orders.length} Orders
          </Badge>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by order #, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 
                ? 'Orders will appear here when customers make purchases'
                : 'No orders match your search criteria'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {order.items[0]?.design.thumbnail ? (
                          <img 
                            src={order.items[0].design.thumbnail} 
                            alt="Order preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Cube size={24} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">#{order.orderNumber}</h3>
                          <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.customer.fullName} • {order.customer.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('de-DE')} • {order.items.length} item(s)
                        </p>
                      </div>

                      {/* Total & Actions */}
                      <div className="text-right">
                        <p className="font-bold text-lg">€{order.total.toFixed(2)}</p>
                        <Button size="sm" variant="ghost" className="mt-1">
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
