'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      })

      const response = await api.get(`/users?${params}`)
      const data = response.data
      
      setUsers(data.users || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await api.delete(`/users/${userId}/deactivate`)
        toast.success('Foydalanuvchi deaktivlashtirildi')
      } else {
        await api.post(`/users/${userId}/activate`)
        toast.success('Foydalanuvchi aktivlashtirildi')
      }
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi')
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      CUSTOMER: 'secondary',
      ADMIN: 'default',
      SUPER_ADMIN: 'destructive',
    } as const

    const labels = {
      CUSTOMER: 'Mijoz',
      ADMIN: 'Admin',
      SUPER_ADMIN: 'Super Admin',
    }

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'Faol' : 'Nofaol'}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Foydalanuvchi qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Button onClick={fetchUsers} variant="outline">
          Yangilash
        </Button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Foydalanuvchilar topilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email || user.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ro'yxatdan o'tgan: {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.isActive)}
                    </div>
                  </div>
                </div>

                {user.ersagId && (
                  <div className="space-y-2 mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm">Ersag ma'lumotlari:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {user.ersagId}
                      </div>
                      <div>
                        <span className="font-medium">Login:</span> {user.ersagLogin}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    ID: {user.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Deaktivlashtirish' : 'Aktivlashtirish'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Oldingi
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Keyingi
          </Button>
        </div>
      )}
    </div>
  )
}