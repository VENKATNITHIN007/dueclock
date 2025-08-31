"use client"
import { useFetchUser } from "@/hooks/user/useFetchUser"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserFormDialog } from "@/components/dialogs/UserFormDialog"

export default function ProfilePage() {
  const { data: user, isLoading } = useFetchUser()

  if (isLoading) return <p>Loading profile...</p>
  if (!user) return <p>Failed to load profile ❌</p>

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Profile Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image || ""} alt={user.name} />
          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.phoneNumber && (
            <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <UserFormDialog user={user} />
    </div>
  )
}