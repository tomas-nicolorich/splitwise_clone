import prisma from './lib/prisma.js'
import { supabaseAdmin } from './lib/supabase-admin.js'
import { serializeBigInt, syncSequence } from './lib/db-utils.js'

export default async function handler(req, res) {
  const params = { ...req.query, ...req.body }
  const { operation } = params

  try {
    switch (operation) {
      case 'me': {
        const { auth_id } = params
        if (!auth_id) return res.status(401).json({ error: 'Unauthorized' })

        let user = await prisma.Users.findFirst({
          where: { auth_id }
        })

        if (!user) {
          // Auto-create user if they exist in Auth but not in our public schema
          // We can't easily get the email here without an extra Supabase call,
          // but we can use a placeholder name which SetupProfileModal will then prompt to change.
          try {
            await syncSequence('Users')
            user = await prisma.Users.create({
              data: {
                auth_id: auth_id,
                name: 'New User'
              }
            })
          } catch (createError) {
            console.error('Error auto-creating user:', createError)
            return res.status(500).json({ error: 'Failed to create user record' })
          }
        }

        const mappedUser = {
          id: user.id.toString(),
          name: user.name
        }
        return res.status(200).json(serializeBigInt(mappedUser))
      }
      case 'invite': {
        const { email } = req.body || {}
        if (!email) return res.status(400).json({ error: 'Email is required' })

        // Check if user already exists in auth
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) {
          console.error('List users error:', listError)
        }

        const existingAuthUser = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

        let invitedUser;
        if (existingAuthUser) {
          invitedUser = existingAuthUser
        } else {
          const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173'}/login`
          })

          if (error) {
            console.error('Supabase Invite Error:', error.message)
            return res.status(500).json({ error: error.message })
          }
          invitedUser = data.user
        }

        return res.status(200).json({ success: true, user: invitedUser })
      }
      case 'updateMe': {
        const { data, auth_id } = params
        if (!auth_id) return res.status(400).json({ error: 'auth_id is required' })

        const currentUser = await prisma.Users.findFirst({ where: { auth_id } })
        if (!currentUser) return res.status(404).json({ error: 'User not found' })

        const updatedUser = await prisma.Users.update({
          where: { id: currentUser.id },
          data: {
            name: data.full_name || data.display_name || currentUser.name
          }
        })

        // Also update Supabase metadata if name changed
        if (data.full_name) {
          await supabaseAdmin.auth.admin.updateUserById(auth_id, {
            user_metadata: { full_name: data.full_name }
          })
        }

        const mappedUser = {
          id: updatedUser.id.toString(),
          name: updatedUser.name
        }
        return res.status(200).json(serializeBigInt(mappedUser))
      }
      case 'logout':
        return res.status(200).json({ success: true })
      default:
        return res.status(400).json({ error: `Invalid operation: ${operation}` })
    }
  } catch (error) {
    console.error('Auth API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
