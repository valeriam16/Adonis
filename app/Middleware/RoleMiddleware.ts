import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RoleMiddleware {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, roles: string[]) {
    try {
      await auth.check()
    } catch {
      return response.unauthorized({ message: 'No tienes permiso para acceder a esta ruta' })
    }

    const user = auth.user!

    if (!user) {
      return response.unauthorized({ message: 'No tienes permiso para acceder a esta ruta' })
    }

    // Cargar la relación 'role'
    await user.load('role')
  // Cargar la relación 'address'
    await user.load('address')

    console.log(user.toJSON())

    if (!user.role || !roles.includes(user.role.slug)) {
      return response.unauthorized({ message: 'No tienes permiso para acceder a esta ruta' })
    }
    
    await next()
  }
}
