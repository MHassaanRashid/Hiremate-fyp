"use client"

import { useState, useCallback, useEffect, memo } from "react"
import { 
  Award, Plus, Edit, Trash2, Calendar, 
  ExternalLink, CheckCircle, X, AlertCircle,
  Clock, Star, Shield, BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Certificate, ResumeStepProps } from "./types"

interface CertificatesComponentProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

interface CertificateFormData extends Omit<Certificate, 'id'> {}

// Common certificate providers
const COMMON_ISSUERS = [
  "Amazon Web Services (AWS)",
  "Microsoft Azure",
  "Google Cloud Platform",
  "Coursera",
  "edX",
  "Udacity",
  "LinkedIn Learning",
  "Pluralsight",
  "Udemy",
  "CompTIA",
  "Cisco",
  "Oracle",
  "Salesforce",
  "HubSpot",
  "PMI (Project Management Institute)",
  "Scrum Alliance",
  "ISACA",
  "ISC2",
  "Red Hat"
] as const

export const CertificatesComponent = memo<CertificatesComponentProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  const [isAddingCertificate, setIsAddingCertificate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CertificateFormData>({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
    verificationLink: '',
    status: 'active'
  })

  // Generate unique ID for new items
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Validation function
  const validateForm = useCallback(() => {
    const hasCertificates = data.certificates.length > 0
    onValidation?.(hasCertificates)
    return hasCertificates
  }, [data.certificates.length, onValidation])

  // Effect to run validation when data changes
  useEffect(() => {
    validateForm()
  }, [validateForm])

  // Check if certificate is expired
  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  // Check if certificate expires soon (within 30 days)
  const expiresSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiryDateObj = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDateObj <= thirtyDaysFromNow && expiryDateObj >= new Date()
  }

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      verificationLink: '',
      status: 'active'
    })
  }, [])

  const handleAddCertificate = useCallback(() => {
    setIsAddingCertificate(true)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleEditCertificate = useCallback((certificate: Certificate) => {
    setFormData({
      name: certificate.name,
      issuer: certificate.issuer,
      date: certificate.date,
      expiryDate: certificate.expiryDate || '',
      credentialId: certificate.credentialId || '',
      verificationLink: certificate.verificationLink || '',
      status: certificate.status
    })
    setEditingId(certificate.id)
    setIsAddingCertificate(true)
  }, [])

  const handleDeleteCertificate = useCallback((id: string) => {
    const updatedCertificates = data.certificates.filter(cert => cert.id !== id)
    onChange('certificates', updatedCertificates)
  }, [data.certificates, onChange])

  const handleSaveCertificate = useCallback(() => {
    // Validation
    if (!formData.name.trim() || !formData.issuer.trim() || !formData.date) {
      return
    }

    // Auto-detect status based on expiry date
    let status = formData.status
    if (formData.expiryDate) {
      if (isExpired(formData.expiryDate)) {
        status = 'expired'
      } else if (expiresSoon(formData.expiryDate)) {
        status = 'active' // Keep as active but will show warning
      }
    }

    const certificateData: Certificate = {
      ...formData,
      id: editingId || generateId(),
      status
    }

    let updatedCertificates: Certificate[]
    if (editingId) {
      updatedCertificates = data.certificates.map(cert => 
        cert.id === editingId ? certificateData : cert
      )
    } else {
      updatedCertificates = [...data.certificates, certificateData]
    }

    // Sort by date (most recent first)
    updatedCertificates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    onChange('certificates', updatedCertificates)
    setIsAddingCertificate(false)
    setEditingId(null)
    resetForm()
  }, [formData, editingId, data.certificates, onChange, resetForm])

  const handleCancelEdit = useCallback(() => {
    setIsAddingCertificate(false)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleFormChange = useCallback((field: keyof CertificateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    })
  }

  const getStatusIcon = (certificate: Certificate) => {
    if (isExpired(certificate.expiryDate)) {
      return <AlertCircle className="w-4 h-4 text-red-600" />
    }
    if (expiresSoon(certificate.expiryDate)) {
      return <Clock className="w-4 h-4 text-yellow-600" />
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />
  }

  const getStatusBadge = (certificate: Certificate) => {
    if (isExpired(certificate.expiryDate)) {
      return <Badge className="bg-red-600 text-xs">Expired</Badge>
    }
    if (expiresSoon(certificate.expiryDate)) {
      return <Badge className="bg-yellow-600 text-xs">Expires Soon</Badge>
    }
    return <Badge className="bg-green-600 text-xs">Active</Badge>
  }

  const isFormValid = formData.name.trim() && formData.issuer.trim() && formData.date

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Certifications & Achievements</h2>
        <p className="text-gray-600">Add your professional certifications and credentials</p>
      </div>

      {/* Statistics */}
      {data.certificates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.certificates.filter(c => !isExpired(c.expiryDate)).length}
              </div>
              <div className="text-sm text-green-700">Active Certificates</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.certificates.filter(c => expiresSoon(c.expiryDate)).length}
              </div>
              <div className="text-sm text-yellow-700">Expiring Soon</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.certificates.filter(c => isExpired(c.expiryDate)).length}
              </div>
              <div className="text-sm text-red-700">Expired</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Certificate Button */}
      {!isAddingCertificate && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAddCertificate}
            className="bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-700 hover:to-orange-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Certificate
          </Button>
        </div>
      )}

      {/* Certificate Form */}
      {isAddingCertificate && (
        <Card className="border-yellow-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              {editingId ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {editingId ? 'Edit Certificate' : 'Add New Certificate'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificateName">Certificate Name *</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="certificateName"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className="pl-10 bg-yellow-50/50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="issuer">Issuing Organization *</Label>
                <Input
                  id="issuer"
                  value={formData.issuer}
                  onChange={(e) => handleFormChange('issuer', e.target.value)}
                  placeholder="e.g., Amazon Web Services"
                  list="common-issuers"
                  className="bg-yellow-50/50"
                />
                <datalist id="common-issuers">
                  {COMMON_ISSUERS.map(issuer => (
                    <option key={issuer} value={issuer} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="pl-10 bg-yellow-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                    className="pl-10 bg-yellow-50/50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank if certificate doesn't expire</p>
              </div>

              <div>
                <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="credentialId"
                    value={formData.credentialId}
                    onChange={(e) => handleFormChange('credentialId', e.target.value)}
                    placeholder="e.g., ABC-123-DEF-456"
                    className="pl-10 bg-yellow-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="verificationLink">Verification URL (Optional)</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="verificationLink"
                    type="url"
                    value={formData.verificationLink}
                    onChange={(e) => handleFormChange('verificationLink', e.target.value)}
                    placeholder="https://verify-certificate.com"
                    className="pl-10 bg-yellow-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveCertificate}
                disabled={!isFormValid}
                className="bg-gradient-to-r from-yellow-600 to-orange-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates List */}
      {data.certificates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Your Certificates ({data.certificates.length})
          </h3>
          
          {data.certificates.map((certificate, index) => (
            <Card key={certificate.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {certificate.name}
                      </h4>
                      {getStatusIcon(certificate)}
                      {getStatusBadge(certificate)}
                    </div>
                    
                    <p className="text-yellow-600 font-medium mb-2">{certificate.issuer}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Issued: {formatDate(certificate.date)}
                      </span>
                      {certificate.expiryDate && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {isExpired(certificate.expiryDate) ? 'Expired: ' : 'Expires: '}
                          {formatDate(certificate.expiryDate)}
                        </span>
                      )}
                    </div>

                    {certificate.credentialId && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Credential ID: </span>
                        <span className="text-sm text-gray-600 font-mono">{certificate.credentialId}</span>
                      </div>
                    )}

                    {/* Verification Link */}
                    <div className="flex gap-3">
                      {certificate.verificationLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(certificate.verificationLink, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Verify Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCertificate(certificate)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCertificate(certificate.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.certificates.length === 0 && !isAddingCertificate && (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No certificates added yet</p>
          <p className="text-sm">Click "Add Certificate" to showcase your credentials</p>
        </div>
      )}
    </div>
  )
})

CertificatesComponent.displayName = 'CertificatesComponent'
