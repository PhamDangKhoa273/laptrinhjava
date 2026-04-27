import { useEffect, useMemo, useState } from 'react'
import '../../retailer-workspace.css'
import '../../transaction-hardening.css'
import { Button } from '../../components/Button.jsx'
import { TextAreaField } from '../../components/TextAreaField.jsx'
import { TextInput } from '../../components/TextInput.jsx'
import { createRetailer, getMyRetailer, updateRetailer } from '../../services/businessService'
import { getPublicListings } from '../../services/listingService.js'
import { uploadDeliveryProofFile } from '../../services/mediaService.js'
import {
  cancelOrder,
  confirmOrderDelivery,
  createOrder,
  createReport,
  getMyNotifications,
  getOrderById,
  getOrderStatusHistory,
  getOrdersV2,
  getRetailerShipments,
  markNotificationRead,
  payOrderDeposit,
} from '../../services/workflowService.js'
import { getErrorMessage } from '../../utils/helpers'

export { Button, TextAreaField, TextInput }
export {
  createRetailer,
  getMyRetailer,
  updateRetailer,
  getPublicListings,
  uploadDeliveryProofFile,
  cancelOrder,
  confirmOrderDelivery,
  createOrder,
  createReport,
  getMyNotifications,
  getOrderById,
  getOrderStatusHistory,
  getOrdersV2,
  getRetailerShipments,
  markNotificationRead,
  payOrderDeposit,
  getErrorMessage,
}
