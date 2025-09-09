'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'

interface Setting {
  key: string
  value: string
  type: string
  isSecret: boolean
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(true)
      await api.patch(`/settings/${key}`, { value })
      toast.success('Sozlama yangilandi')
      fetchSettings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    )
  }

  const handleSave = (key: string) => {
    const setting = settings.find(s => s.key === key)
    if (setting) {
      updateSetting(key, setting.value)
    }
  }

  const getSettingsByCategory = (category: string) => {
    const categoryMap: { [key: string]: string[] } = {
      ersag: ['ERSAG_BASE_URL', 'ERSAG_REFERRAL_ID', 'ERSAG_API_KEY'],
      payment: ['PAYME_MERCHANT_ID', 'PAYME_SECRET_KEY', 'CLICK_MERCHANT_ID', 'CLICK_SECRET_KEY', 'UZCARD_MERCHANT_ID', 'UZCARD_SECRET_KEY'],
      sms: ['ESKIZ_EMAIL', 'ESKIZ_PASSWORD', 'SMS_FROM_NAME'],
    }
    
    return settings.filter(setting => 
      categoryMap[category]?.includes(setting.key)
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="ersag" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ersag">Ersag</TabsTrigger>
        <TabsTrigger value="payment">To'lov</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
      </TabsList>

      <TabsContent value="ersag" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ersag sozlamalari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getSettingsByCategory('ersag').map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {setting.key.replace(/_/g, ' ')}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id={setting.key}
                    type={setting.isSecret ? 'password' : 'text'}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={`${setting.key} qiymatini kiriting`}
                  />
                  <Button
                    onClick={() => handleSave(setting.key)}
                    disabled={saving}
                    size="sm"
                  >
                    Saqlash
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>To'lov sozlamalari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getSettingsByCategory('payment').map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {setting.key.replace(/_/g, ' ')}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id={setting.key}
                    type={setting.isSecret ? 'password' : 'text'}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={`${setting.key} qiymatini kiriting`}
                  />
                  <Button
                    onClick={() => handleSave(setting.key)}
                    disabled={saving}
                    size="sm"
                  >
                    Saqlash
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sms" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>SMS sozlamalari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getSettingsByCategory('sms').map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {setting.key.replace(/_/g, ' ')}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id={setting.key}
                    type={setting.isSecret ? 'password' : 'text'}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={`${setting.key} qiymatini kiriting`}
                  />
                  <Button
                    onClick={() => handleSave(setting.key)}
                    disabled={saving}
                    size="sm"
                  >
                    Saqlash
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}