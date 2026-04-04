import { ROLES } from './constants'

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/

export function validateRegisterForm(form) {
  const errors = {}

  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!form.email?.trim()) errors.email = 'Email is required.'
  if (form.email && !form.email.includes('@')) errors.email = 'Email format is invalid.'
  if (!form.password || form.password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.trim())) errors.phoneNumber = 'Vietnamese phone number is invalid.'

  return errors
}

export function validateProfileForm(form, role) {
  const errors = {}

  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!form.email?.trim()) errors.email = 'Email is required.'
  if (form.email && !form.email.includes('@')) errors.email = 'Email format is invalid.'
  if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.trim())) errors.phoneNumber = 'Vietnamese phone number is invalid.'

  if (role === ROLES.DRIVER && form.driverLicenseNumber && !form.driverLicenseNumber.trim()) {
    errors.driverLicenseNumber = 'Driver license number is invalid.'
  }

  return errors
}
