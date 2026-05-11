import { ROLES } from './constants'

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/

export function validateRegisterForm(form) {
  const errors = {}

  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!form.email?.trim()) errors.email = 'Email is required.'
  if (form.email && !form.email.includes('@')) errors.email = 'Email format is invalid.'
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  if (!form.password || form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (!passwordRegex.test(form.password)) {
    errors.password = 'Password must include uppercase, lowercase, and numeric characters.'
  }
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.trim())) errors.phoneNumber = 'Vietnamese phone number is invalid.'
  if (!form.role) errors.role = 'Account type is required.'

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
