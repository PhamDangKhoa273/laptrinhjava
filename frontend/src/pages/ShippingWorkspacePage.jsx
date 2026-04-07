import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createDriver, createVehicle, getDrivers, getVehicles, updateDriver, updateVehicle } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers'

const initialDriverForm = {
  driverCode: '',
  licenseNo: '',
  userId: '',
  status: 'ACTIVE',
}

const initialVehicleForm = {
  plateNo: '',
  vehicleType: '',
  capacity: '',
  status: 'ACTIVE',
}

export function ShippingWorkspacePage() {
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [driverForm, setDriverForm] = useState(initialDriverForm)
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingDriver, setSavingDriver] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [driverData, vehicleData] = await Promise.all([getDrivers(), getVehicles()])
      setDrivers(Array.isArray(driverData) ? driverData : [])
      setVehicles(Array.isArray(vehicleData) ? vehicleData : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load logistics data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleDriverChange(event) {
    const { name, value } = event.target
    setDriverForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleVehicleChange(event) {
    const { name, value } = event.target
    setVehicleForm((prev) => ({ ...prev, [name]: value }))
  }

  function fillDriver(driver) {
    setSelectedDriverId(String(driver.driverId))
    setDriverForm({
      driverCode: driver.driverCode || '',
      licenseNo: driver.licenseNo || '',
      userId: String(driver.userId || ''),
      status: driver.status || 'ACTIVE',
    })
  }

  function fillVehicle(vehicle) {
    setSelectedVehicleId(String(vehicle.vehicleId))
    setVehicleForm({
      plateNo: vehicle.plateNo || '',
      vehicleType: vehicle.vehicleType || '',
      capacity: vehicle.capacity || '',
      status: vehicle.status || 'ACTIVE',
    })
  }

  async function submitDriver(event) {
    event.preventDefault()
    if (savingDriver) return

    setSavingDriver(true)
    setError('')
    setSuccess('')

    try {
      if (selectedDriverId) {
        await updateDriver(Number(selectedDriverId), {
          licenseNo: driverForm.licenseNo.trim(),
          status: driverForm.status.trim(),
        })
      } else {
        await createDriver({
          driverCode: driverForm.driverCode.trim(),
          licenseNo: driverForm.licenseNo.trim(),
          userId: Number(driverForm.userId),
          status: driverForm.status.trim(),
        })
      }
      setSuccess(selectedDriverId ? 'Driver updated successfully.' : 'Driver created successfully.')
      setSelectedDriverId('')
      setDriverForm(initialDriverForm)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save driver.'))
    } finally {
      setSavingDriver(false)
    }
  }

  async function submitVehicle(event) {
    event.preventDefault()
    if (savingVehicle) return

    setSavingVehicle(true)
    setError('')
    setSuccess('')

    try {
      if (selectedVehicleId) {
        await updateVehicle(Number(selectedVehicleId), {
          vehicleType: vehicleForm.vehicleType.trim(),
          capacity: Number(vehicleForm.capacity),
          status: vehicleForm.status.trim(),
        })
      } else {
        await createVehicle({
          plateNo: vehicleForm.plateNo.trim(),
          vehicleType: vehicleForm.vehicleType.trim(),
          capacity: Number(vehicleForm.capacity),
          status: vehicleForm.status.trim(),
        })
      }
      setSuccess(selectedVehicleId ? 'Vehicle updated successfully.' : 'Vehicle created successfully.')
      setSelectedVehicleId('')
      setVehicleForm(initialVehicleForm)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save vehicle.'))
    } finally {
      setSavingVehicle(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shipping workspace</p>
          <h2>Drivers and vehicles</h2>
          <p>Create and manage logistics resources directly against backend TV2 APIs.</p>
        </div>
      </div>

      {loading ? <div className="glass-card">Loading drivers and vehicles...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>{selectedDriverId ? 'Update driver' : 'Create driver'}</h3>
          <form className="form-grid" onSubmit={submitDriver}>
            <div className="grid-two">
              <TextInput label="Driver code" name="driverCode" value={driverForm.driverCode} onChange={handleDriverChange} disabled={Boolean(selectedDriverId)} required />
              <TextInput label="License number" name="licenseNo" value={driverForm.licenseNo} onChange={handleDriverChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Target user ID" name="userId" value={driverForm.userId} onChange={handleDriverChange} disabled={Boolean(selectedDriverId)} required />
              <TextInput label="Status" name="status" value={driverForm.status} onChange={handleDriverChange} />
            </div>
            <Button type="submit" disabled={savingDriver}>{savingDriver ? 'Saving...' : selectedDriverId ? 'Update driver' : 'Create driver'}</Button>
          </form>

          <h3 className="top-gap">Existing drivers</h3>
          <div className="form-grid">
            {drivers.length === 0 ? <p>No drivers yet.</p> : null}
            {drivers.map((driver) => (
              <div key={driver.driverId} className="business-card">
                <div>
                  <strong>{driver.driverCode}</strong>
                  <p>License: {driver.licenseNo}</p>
                  <p>User ID: {driver.userId}</p>
                  <p>Status: {driver.status}</p>
                </div>
                <Button variant="secondary" onClick={() => fillDriver(driver)}>Edit</Button>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>{selectedVehicleId ? 'Update vehicle' : 'Create vehicle'}</h3>
          <form className="form-grid" onSubmit={submitVehicle}>
            <div className="grid-two">
              <TextInput label="Plate number" name="plateNo" value={vehicleForm.plateNo} onChange={handleVehicleChange} disabled={Boolean(selectedVehicleId)} required />
              <TextInput label="Vehicle type" name="vehicleType" value={vehicleForm.vehicleType} onChange={handleVehicleChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Capacity" name="capacity" value={vehicleForm.capacity} onChange={handleVehicleChange} required />
              <TextInput label="Status" name="status" value={vehicleForm.status} onChange={handleVehicleChange} />
            </div>
            <Button type="submit" disabled={savingVehicle}>{savingVehicle ? 'Saving...' : selectedVehicleId ? 'Update vehicle' : 'Create vehicle'}</Button>
          </form>

          <h3 className="top-gap">Existing vehicles</h3>
          <div className="form-grid">
            {vehicles.length === 0 ? <p>No vehicles yet.</p> : null}
            {vehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className="business-card">
                <div>
                  <strong>{vehicle.plateNo}</strong>
                  <p>Type: {vehicle.vehicleType}</p>
                  <p>Capacity: {vehicle.capacity}</p>
                  <p>Status: {vehicle.status}</p>
                </div>
                <Button variant="secondary" onClick={() => fillVehicle(vehicle)}>Edit</Button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
