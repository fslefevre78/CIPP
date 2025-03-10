import React, { useState } from 'react'
import { CAlert, CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { RFFCFormInput } from 'src/components/forms'
import { CippTable } from 'src/components/tables'
import { TenantSelector } from 'src/components/utilities'
import { CSVReader } from 'react-papaparse'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CAlert color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CAlert>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const AddAPDevice = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [autopilotData, setAutopilotdata] = useState(false)
  const tableColumns = [
    {
      name: 'serialNumber',
      selector: (row) => row['SerialNumber'],
      sortable: true,
    },
    {
      name: 'Device Manufacturer',
      selector: (row) => row['oemManufacturerName'],
      sortable: true,
    },
    {
      name: 'Device Model',
      selector: (row) => row['modelName'],
      sortable: true,
    },
    {
      name: 'Windows Product ID',
      selector: (row) => row['productKey'],
      sortable: true,
    },
    {
      name: 'Hardware Hash',
      selector: (row) => row['hardwareHash'],
      sortable: true,
      width: '200px',
    },
    {
      name: 'Remove',
      button: true,
      cell: (row, index) => {
        return (
          <CButton onClick={() => handleRemove(row)} size="sm" variant="ghost" color="danger">
            <FontAwesomeIcon icon={faTrash} />
          </CButton>
        )
      },
    },
  ]

  const handleOnDrop = (data) => {
    const importdata = data.map((item) => {
      return {
        //Device serial number,Windows product ID,Hardware hash,Manufacturer name,Device Model
        SerialNumber: item.data['Device serial number'],
        productKey: item.data['Windows product ID'],
        hardwareHash: item.data['Hardware hash'],
        oemManufacturerName: item.data['Manufacturer name'],
        modelName: item.data['Device Model'],
      }
    })
    setAutopilotdata(importdata)
    // console.log(importdata)
  }

  const handleOnError = (err, file, inputElem, reason) => {
    //set upload error
  }
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const handleSubmit = async (values) => {
    const shippedValues = {
      TenantFilter: tenantDomain,
      autopilotData,
      ...values,
    }
    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/AddAPDevice', values: shippedValues })
  }
  const addRowtoData = (values) => {
    setAutopilotdata((prevState) => {
      if (prevState) {
        return [values, ...prevState]
      } else {
        return [values]
      }
    })
  }
  const handleRemove = async (itemindex) => {
    //alert(JSON.stringify(values, null, 2))
    //find arr index, delete from state.
    //console.log(itemindex)
    let RemovedItems = autopilotData.filter((item) => item !== itemindex)
    setAutopilotdata((prevState) => {
      return RemovedItems
    })
  }
  return (
    <CippWizard onSubmit={handleSubmit} wizardTitle="Add Autopilot Device Wizard">
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenant to add an Autopilot device to"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants">{(props) => <TenantSelector />}</Field>
        <Error name="selectedTenants" />
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Enter Device Information"
        description="Enter the Autopilot device information"
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Enter autopilot information</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <p>
            As a partner, you can register devices to Windows Autopilot using any one of these
            methods: Hardware Hash (available from OEM or on-device script) Combination of
            Manufacturer, Device Model, Device Serial Number Windows Product Key ID.
          </p>
          <p>You can also upload a CSV file if your vendor has supplied you with one.</p>
        </div>
        <CCol xs={'auto'}>
          <CSVReader
            onDrop={handleOnDrop}
            onError={handleOnError}
            config={{ header: true, skipEmptyLines: true }}
          >
            <span>Drop CSV file here or click to upload.</span>
          </CSVReader>
        </CCol>
        <br></br>
        <CRow>
          <CCol xs={'auto'}>
            <RFFCFormInput autoFocus name="SerialNumber" label="Serial Number" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="oemManufacturerName" label="Device Manufacturer" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="modelName" label="Device Model" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="productKey" label="Windows Product ID" type="text" />
          </CCol>
          <CCol xs={'auto'}>
            <RFFCFormInput name="hardwareHash" label="Hardware Hash" type="text" />
          </CCol>
          <CCol xs={'auto'} className="align-self-end">
            <FormSpy>
              {(props) => {
                /* eslint-disable react/prop-types */
                return (
                  <>
                    <CButton
                      onClick={() => addRowtoData(props.values)}
                      name="addButton"
                      className="mb-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add
                    </CButton>
                  </>
                )
              }}
            </FormSpy>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            {autopilotData && (
              <CippTable
                reportName="none"
                tableProps={{ subheader: false }}
                data={autopilotData}
                columns={tableColumns}
              />
            )}
          </CCol>
        </CRow>

        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Offboarding Settings"
        description="Add a tag, group, or other info to this request"
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Choose options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CCol md={6}>
            <RFFCFormInput
              name="GroupName"
              label="Group Name"
              type="text"
              placeholder="Leave blank"
            />
          </CCol>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="mb-4">Confirm and apply</h5>
          <hr className="my-4" />
          {postResults.isFetching && (
            <CCallout color="info">
              <CSpinner>Loading</CSpinner>
            </CCallout>
          )}
          {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
          {autopilotData && (
            <CippTable
              reportName="none"
              tableProps={{ subheader: false }}
              data={autopilotData}
              columns={tableColumns}
            />
          )}
        </center>
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AddAPDevice
