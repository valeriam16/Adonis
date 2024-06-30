import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Address from 'App/Models/Address';
import axios from 'axios';

export default class AuthController {

    public async register({ request, response }: HttpContextContract) {
        try {
            await request.validate({
                schema: schema.create({
                    name: schema.string([
                        rules.required(),
                        rules.maxLength(80),
                    ]),
                    lastname: schema.string([
                        rules.required(),
                        rules.maxLength(80),
                    ]),
                    age: schema.number([
                        rules.required(),
                    ]),
                    birthdate: schema.date({}, [rules.required()]),
                    email: schema.string([
                        rules.required(),
                        rules.email(),
                        rules.maxLength(80),
                        rules.unique({ table: 'users', column: 'email' })
                    ]),
                    phone: schema.string([
                        rules.required(),
                        rules.maxLength(15),
                        rules.unique({ table: 'users', column: 'phone' })
                    ]),
                    nickname: schema.string([
                        rules.required(),
                        rules.maxLength(20),
                        rules.unique({ table: 'users', column: 'nickname' })
                    ]),
                    password: schema.string([
                        rules.required(),
                        rules.minLength(8),
                        rules.maxLength(255),
                        rules.confirmed()
                    ]),
                }),
            });

            const recaptchaToken = request.input('recaptchaToken');
            const recaptchaSecretKey = '6LejC-gpAAAAALNYN6yWZlVCrFc3x69pZ6u0syMt';

            const verificationResponse = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`
            );

            if (!verificationResponse.data.success) {
                return response.status(400).json({
                    msg: 'Verificación de reCAPTCHA fallida',
                });
            }

            const user = new User();
            user.name = request.input('name');
            user.lastname = request.input('lastname');
            user.age = request.input('age');
            user.birthdate = request.input('birthdate');
            user.email = request.input('email');
            user.phone = request.input('phone');
            user.nickname = request.input('nickname');
            user.password = request.input('password');
            const role = await Role.findByOrFail('slug', 'support')
            user.roleId = role.id;
            await user.save();

            console.log(user.toJSON())

            return response.status(200).json({
                Mensaje: ("Usuario " + user.nickname + " registrado de manera exitosa."),
                User: user,
            });

        } catch (error) {
            return response.status(400).json({
                msg: 'Errores de validación',
                errors: error.messages,
            });
        }
    }

    public async register2({ request, response }: HttpContextContract) {
        try {
            await request.validate({
                schema: schema.create({
                    name: schema.string([
                        rules.required(),
                        rules.maxLength(80),
                    ]),
                    lastname: schema.string([
                        rules.required(),
                        rules.maxLength(80),
                    ]),
                    age: schema.number([
                        rules.required(),
                    ]),
                    birthdate: schema.date({}, [rules.required()]),
                    email: schema.string([
                        rules.required(),
                        rules.email(),
                        rules.maxLength(80),
                        rules.unique({ table: 'users', column: 'email' })
                    ]),
                    phone: schema.string([
                        rules.required(),
                        rules.maxLength(15),
                        rules.unique({ table: 'users', column: 'phone' })
                    ]),
                    nickname: schema.string([
                        rules.required(),
                        rules.maxLength(20),
                        rules.unique({ table: 'users', column: 'nickname' })
                    ]),
                    password: schema.string([
                        rules.required(),
                        rules.minLength(8),
                        rules.maxLength(255),
                        rules.confirmed()
                    ]),
                }),
            });

            const user = new User();
            user.name = request.input('name');
            user.lastname = request.input('lastname');
            user.age = request.input('age');
            user.birthdate = request.input('birthdate');
            user.email = request.input('email');
            user.phone = request.input('phone');
            user.nickname = request.input('nickname');
            user.password = request.input('password');
            const role = await Role.findByOrFail('slug', 'support')
            user.roleId = role.id;
            await user.save();

            console.log(user.toJSON())

            return response.status(200).json({
                Mensaje: ("Usuario " + user.nickname + " registrado de manera exitosa."),
                User: user,
            });
        } catch (error) {
            return response.status(400).json({
                msg: 'Errores de validación',
                errors: error.messages,
            });
        }
    }

    public async login({ request, auth, response }: HttpContextContract) {
        const { login_identifier, password } = request.only(['login_identifier', 'password'])

        try {
            const token = await auth.use('api').attempt(login_identifier, password)
            return response.json({ token })
        } catch {
            return response.badRequest('Credenciales incorrectas')
        }
    }

    public async index({ response }: HttpContextContract) {
        const users = await User.all()

        return response.json(users)
    }

    public async getUser({ auth }: HttpContextContract) {
        // Obtener el usuario autenticado
        const user = auth.user!
        return user;
    }

    public async addAddress({ response, request, auth }: HttpContextContract) {
        try {
            // Validar la solicitud
            const addressSchema = schema.create({
                street: schema.string([
                    rules.required(),
                    rules.maxLength(50),
                ]),
                suburb: schema.string([
                    rules.required(),
                    rules.maxLength(50),
                ]),
                city: schema.string([
                    rules.required(),
                    rules.maxLength(50),
                ]),
                state: schema.string([
                    rules.required(),
                    rules.maxLength(50),
                ]),
                country: schema.string([
                    rules.required(),
                    rules.maxLength(50),
                ]),
                zip_code: schema.number([
                    rules.required(),
                ]),
                latitude: schema.number([rules.required()]),
                longitude: schema.number([rules.required()])
            })

            const payload = await request.validate({ schema: addressSchema })

            // Crear nueva dirección y asociarla con el usuario autenticado
            const address = new Address()
            address.street = payload.street
            address.suburb = payload.suburb
            address.city = payload.city
            address.state = payload.state
            address.country = payload.country
            address.zipCode = payload.zip_code
            address.latitude = payload.latitude
            address.longitude = payload.longitude
            address.userId = auth.user!.id  // Asocia la dirección con el usuario actual

            console.warn('Datos a guardar:', {
                street: address.street,
                suburb: address.suburb,
                city: address.city,
                state: address.state,
                country: address.country,
                zipCode: address.zipCode,
                latitude: address.latitude,
                longitude: address.longitude,
                userId: address.userId
            })

            await address.save()

            // Devolver la respuesta con la nueva dirección
            return response.status(200).json({
                message: "Dirección creada de manera exitosa.",
                address,
            })
        } catch (error) {
            console.error('Error:', error)
            return response.status(400).json({
                message: 'Errores de validación',
                errors: error.messages,
            })
        }
    }

    /* public async getAddress({ response, auth }: HttpContextContract) {
        // Obtener el usuario autenticado
        const user = auth.user!

        // Cargar la relación 'address'
        await user.load('address')

        if (!user.address) {
            return response.status(400).json({
                msg: 'No tienes una dirección registrada.'
            })
        }

        // Devolver la dirección del usuario
        return user.address
    } */

    public async getAddress({ response, auth }: HttpContextContract) {
        try {
            // Obtener el usuario autenticado
            const user = auth.user!

            // Cargar todas las direcciones asociadas con el usuario
            await user.load('address')

            // Comprobar si el usuario tiene direcciones registradas
            if (user.address.length === 0) {
                return response.status(400).json({
                    Mensaje: 'No tienes direcciones registradas.'
                })
            }

            // Devolver las direcciones del usuario
            return response.status(200).json({
                Mensaje: ("Direcciones del user " + user.nickname + " obtenidas exitosamente."),
                Addresses: user.address
            })
        } catch (error) {
            console.error('Error:', error)
            return response.status(500).json({
                Mensaje: 'Ocurrió un error al obtener las direcciones.',
                Error: error.message
            })
        }
    }

    public async addresses({ response }: HttpContextContract) {
        // Obtener todos los usuarios con sus direcciones
        const usersWithAddresses = await User.query().preload('address')

        return response.status(200).json({
            Mensaje: "Información de usuarios y direcciones obtenida correctamente.",
            UsersWithAddresses: usersWithAddresses,
        })
    }

    public async logout({ auth, response }: HttpContextContract) {
        try {
            await auth.use('api').logout()
            console.log(response.status);
            return response.status(200).json({
                msg: 'Sesión cerrada exitosamente'
            })
        } catch (error) {
            console.log(response.status);
            return response.status(400).json({
                msg: 'Error al intentar cerrar sesión',
                error: error.message
            })
        }
    }

}
