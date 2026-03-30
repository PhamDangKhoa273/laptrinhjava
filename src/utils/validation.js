import { ROLES } from './constants'

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/

export function validateRegisterForm(form) {
  const errors = {}

  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!form.email?.trim()) errors.email = 'Email is required.'
  if (!form.email?.includes('@')) errors.email = 'Email format is invalid.'
  if (!form.password || form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.trim())) errors.phoneNumber = 'Vietnamese phone number is invalid.'

  if (form.role === ROLES.FARM) {
    if (!form.farmName?.trim()) errors.farmName = 'Farm name is required.'
    if (!form.businessLicense?.trim()) errors.businessLicense = 'Business license is required for farm registration.'
    if (!form.farmAddress?.trim()) errors.farmAddress = 'Farm address is required.'
  }

  if (form.role === ROLES.RETAILER) {
    if (!form.companyName?.trim()) errors.companyName = 'Retailer company name is required.'
    if (!form.businessLicense?.trim()) errors.businessLicense = 'Business license is required for retailer registration.'
    if (!form.businessAddress?.trim()) errors.businessAddress = 'Business address is required.'
  }

  return errors
}

export function validateProfileForm(form, role) {
  const errors = {}

  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!form.email?.trim()) errors.email = 'Email is required.'
  if (form.email && !form.email.includes('@')) errors.email = 'Email format is invalid.'
  if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.trim())) errors.phoneNumber = 'Vietnamese phone number is invalid.'

  if (role === ROLES.FARM) {
    if (!form.farmName?.trim()) errors.farmName = 'Farm name is required.'
    if (!form.businessLicense?.trim()) errors.businessLicense = 'Business license is required.'
    if (!form.farmAddress?.trim()) errors.farmAddress = 'Farm address is required.'
  }

  if (role === ROLES.RETAILER) {
    if (!form.companyName?.trim()) errors.companyName = 'Company name is required.'
    if (!form.businessLicense?.trim()) errors.businessLicense = 'Business license is required.'
    if (!form.businessAddress?.trim()) errors.businessAddress = 'Business address is required.'
  }

  if (role === ROLES.DRIVER && !form.driverLicenseNumber?.trim()) {
    errors.driverLicenseNumber = 'Driver license number is required.'
  }

  if (role === ROLES.SHIPPING_MANAGER && !form.companyName?.trim()) {
    errors.companyName = 'Logistics company name is required.'
  }

  return errors
}
