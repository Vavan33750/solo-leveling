import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  username?: string
}

export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, username?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0]
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email || '',
      username: profile?.username
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}