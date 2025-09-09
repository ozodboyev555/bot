'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CaptchaData } from '@/types'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface CaptchaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  onSuccess: () => void
}

export function CaptchaModal({ open, onOpenChange, orderId, onSuccess }: CaptchaModalProps) {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null)
  const [solution, setSolution] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (open && orderId) {
      fetchCaptcha()
    }
  }, [open, orderId])

  const fetchCaptcha = async () => {
    try {
      setFetching(true)
      const response = await api.get(`/captcha/${orderId}`)
      setCaptchaData(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Captcha yuklanmadi')
      onOpenChange(false)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!solution.trim()) {
      toast.error('Captcha javobini kiriting')
      return
    }

    try {
      setLoading(true)
      await api.post(`/captcha/${orderId}/solve`, { solution })
      toast.success('Captcha muvaffaqiyatli yechildi!')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Captcha yechilmadi')
      // Fetch new captcha on error
      fetchCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setSolution('')
    fetchCaptcha()
  }

  if (fetching) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Captcha tasdiqlash</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Captcha rasmida ko'rsatilgan matnni kiriting:</Label>
            
            {captchaData?.imageUrl && (
              <div className="relative aspect-video border rounded-lg overflow-hidden">
                <Image
                  src={captchaData.imageUrl}
                  alt="Captcha"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {captchaData?.iframeUrl && (
              <div className="relative aspect-video border rounded-lg overflow-hidden">
                <iframe
                  src={captchaData.iframeUrl}
                  className="w-full h-full"
                  title="Captcha"
                />
              </div>
            )}

            <div className="flex space-x-2">
              <Input
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Captcha javobini kiriting"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                Yangilash
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={loading || !solution.trim()}
              className="flex-1"
            >
              {loading ? 'Yuborilmoqda...' : 'Tasdiqlash'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}