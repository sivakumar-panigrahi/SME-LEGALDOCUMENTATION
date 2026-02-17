import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarIcon, Eye, Save, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { IS_TESTING, ALLOWED_EMAIL, validateTestingEmail, getTestingMessage } from "@/config/env";

interface DocumentFormProps {
  template: any;
  onPreview: (document: any) => void;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 1, name: "Parties", description: "Who's involved" },
  { id: 2, name: "Terms", description: "Dates & Payment" },
  { id: 3, name: "Clauses", description: "Legal provisions" },
  { id: 4, name: "Review", description: "Final check" }
];

const availableClauses = [
  {
    id: "confidentiality",
    title: "Confidentiality Clause",
    description: "Protects sensitive business information from disclosure",
    required: true
  },
  {
    id: "non-compete",
    title: "Non-Compete Agreement",
    description: "Restricts working with competitors during and after employment",
    required: false
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property Rights",
    description: "Defines ownership of work created during engagement",
    required: true
  },
  {
    id: "termination",
    title: "Termination Clause",
    description: "Conditions under which the agreement can be terminated",
    required: true
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution",
    description: "Process for handling disagreements and legal disputes",
    required: false
  }
];

export const DocumentForm = ({ template, onPreview }: DocumentFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Parties
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    employeeName: "",
    employeeEmail: "",
    employeeAddress: "",
    
    // Terms
    startDate: null,
    endDate: null,
    salary: "",
    paymentFrequency: "",
    position: "",
    department: "",
    
    // Clauses
    selectedClauses: ["confidentiality", "intellectual-property", "termination"],
    customClause: ""
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  const validateTestingEmailAddress = (email: string): boolean => {
    if (!IS_TESTING) return true;
    return validateTestingEmail(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length > 0 && /^[a-zA-Z\s'-]+$/.test(name);
  };

  const validateSalary = (salary: string): boolean => {
    // Remove common currency symbols and commas
    const cleanSalary = salary.replace(/[$,\s]/g, '');
    const salaryNumber = parseFloat(cleanSalary);
    return !isNaN(salaryNumber) && salaryNumber > 0;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        // Company validation
        if (!formData.companyName.trim()) {
          newErrors.companyName = "Company name is required";
        } else if (!validateName(formData.companyName)) {
          newErrors.companyName = "Please enter a valid company name";
        }

        if (!formData.companyEmail.trim()) {
          newErrors.companyEmail = "Company email is required";
        } else if (!validateEmail(formData.companyEmail)) {
          newErrors.companyEmail = "Please enter a valid email address";
        } else if (!validateTestingEmailAddress(formData.companyEmail)) {
          newErrors.companyEmail = getTestingMessage();
        }

        // Employee validation
        if (!formData.employeeName.trim()) {
          newErrors.employeeName = "Employee name is required";
        } else if (!validateName(formData.employeeName)) {
          newErrors.employeeName = "Please enter a valid name (letters, spaces, hyphens, apostrophes only)";
        }

        if (!formData.employeeEmail.trim()) {
          newErrors.employeeEmail = "Employee email is required";
        } else if (!validateEmail(formData.employeeEmail)) {
          newErrors.employeeEmail = "Please enter a valid email address";
        } else if (!validateTestingEmailAddress(formData.employeeEmail)) {
          newErrors.employeeEmail = getTestingMessage();
        }
        break;

      case 2:
        if (!formData.position.trim()) {
          newErrors.position = "Position title is required";
        }

        if (!formData.startDate) {
          newErrors.startDate = "Start date is required";
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (formData.startDate < today) {
            newErrors.startDate = "Start date cannot be in the past";
          }
        }

        if (!formData.salary.trim()) {
          newErrors.salary = "Salary is required";
        } else if (!validateSalary(formData.salary)) {
          newErrors.salary = "Please enter a valid salary amount (numbers only)";
        }

        if (!formData.paymentFrequency) {
          newErrors.paymentFrequency = "Payment frequency is required";
        }

        // Validate end date if provided
        if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
          newErrors.endDate = "End date must be after start date";
        }
        break;

      case 3:
        // Check if at least one required clause is selected
        const requiredClauses = availableClauses.filter(c => c.required).map(c => c.id);
        const hasAllRequiredClauses = requiredClauses.every(id => formData.selectedClauses.includes(id));
        
        if (!hasAllRequiredClauses) {
          newErrors.selectedClauses = "All required clauses must be selected";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleClause = (clauseId: string) => {
    const clause = availableClauses.find(c => c.id === clauseId);
    if (clause?.required) return; // Can't toggle required clauses
    
    setFormData(prev => ({
      ...prev,
      selectedClauses: prev.selectedClauses.includes(clauseId)
        ? prev.selectedClauses.filter(id => id !== clauseId)
        : [...prev.selectedClauses, clauseId]
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before proceeding.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { saveDocument, loading: documentLoading } = useDocuments();

  const handlePreview = () => {
    if (validateStep(currentStep)) {
      const document = {
        template,
        formData,
        createdAt: new Date(),
        status: "Draft"
      };
      onPreview(document);
    } else {
      toast({
        title: "Validation Error",
        description: "Please review and fix all errors before previewing the document.",
        variant: "destructive"
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const docData = {
        template_name: template?.name || 'Unknown Template',
        form_data: formData,
        status: 'draft' as const,
      };
      
      const documentId = await saveDocument(docData);
      if (documentId) {
        toast({
          title: "Draft Saved",
          description: "Your document draft has been saved successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const renderFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      return (
        <div className="flex items-center space-x-1 text-destructive text-sm mt-1">
          <AlertCircle className="h-4 w-4" />
          <span>{errors[fieldName]}</span>
        </div>
      );
    }
    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {IS_TESTING && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Testing Mode Active</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Emails can only be sent to: <strong>{ALLOWED_EMAIL}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData("companyName", e.target.value)}
                    placeholder="Your company name appears in the contract heading"
                    className={cn("h-11", errors.companyName && "border-destructive")}
                  />
                  {renderFieldError("companyName")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-sm font-medium">
                    Company Email * {IS_TESTING && <span className="text-yellow-600 text-xs">(Testing: use {ALLOWED_EMAIL})</span>}
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => updateFormData("companyEmail", e.target.value)}
                    placeholder={IS_TESTING ? ALLOWED_EMAIL : "company@example.com"}
                    className={cn("h-11", errors.companyEmail && "border-destructive")}
                  />
                  {renderFieldError("companyEmail")}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="companyAddress" className="text-sm font-medium">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => updateFormData("companyAddress", e.target.value)}
                  placeholder="Full business address"
                  rows={3}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Employee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) => updateFormData("employeeName", e.target.value)}
                    placeholder="Employee full legal name"
                    className={cn("h-11", errors.employeeName && "border-destructive")}
                  />
                  {renderFieldError("employeeName")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeEmail" className="text-sm font-medium">
                    Email Address * {IS_TESTING && <span className="text-yellow-600 text-xs">(Testing: use {ALLOWED_EMAIL})</span>}
                  </Label>
                  <Input
                    id="employeeEmail"
                    type="email"
                    value={formData.employeeEmail}
                    onChange={(e) => updateFormData("employeeEmail", e.target.value)}
                    placeholder={IS_TESTING ? ALLOWED_EMAIL : "employee@example.com"}
                    className={cn("h-11", errors.employeeEmail && "border-destructive")}
                  />
                  {renderFieldError("employeeEmail")}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="employeeAddress" className="text-sm font-medium">Home Address</Label>
                <Textarea
                  id="employeeAddress"
                  value={formData.employeeAddress}
                  onChange={(e) => updateFormData("employeeAddress", e.target.value)}
                  placeholder="Full residential address"
                  rows={3}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Employment Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position Title *
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => updateFormData("position", e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className={cn("h-11", errors.position && "border-destructive")}
                  />
                  {renderFieldError("position")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateFormData("department", e.target.value)}
                    placeholder="e.g., Engineering"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Duration & Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !formData.startDate && "text-muted-foreground",
                          errors.startDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => updateFormData("startDate", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {renderFieldError("startDate")}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !formData.endDate && "text-muted-foreground",
                          errors.endDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : "Ongoing employment"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => updateFormData("endDate", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {renderFieldError("endDate")}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-sm font-medium">
                    Annual Salary *
                  </Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => updateFormData("salary", e.target.value)}
                    placeholder="e.g., $75,000 or 75000"
                    className={cn("h-11", errors.salary && "border-destructive")}
                  />
                  {renderFieldError("salary")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency" className="text-sm font-medium">
                    Payment Frequency *
                  </Label>
                  <Select 
                    value={formData.paymentFrequency} 
                    onValueChange={(value) => updateFormData("paymentFrequency", value)}
                  >
                    <SelectTrigger className={cn("h-11", errors.paymentFrequency && "border-destructive")}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderFieldError("paymentFrequency")}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Legal Clauses</h3>
              <p className="text-muted-foreground mb-6">Toggle clauses you want to include in your document</p>
              
              {errors.selectedClauses && (
                <div className="mb-4">
                  {renderFieldError("selectedClauses")}
                </div>
              )}
              
              <div className="space-y-4">
                {availableClauses.map((clause) => (
                  <Card key={clause.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={clause.id}
                        checked={formData.selectedClauses.includes(clause.id)}
                        onCheckedChange={() => toggleClause(clause.id)}
                        disabled={clause.required}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={clause.id} className="font-medium">
                            {clause.title}
                          </Label>
                          {clause.required && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{clause.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customClause" className="text-sm font-medium">Additional Custom Clause</Label>
              <Textarea
                id="customClause"
                value={formData.customClause}
                onChange={(e) => updateFormData("customClause", e.target.value)}
                placeholder="Add any specific terms or conditions..."
                rows={4}
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Review Your Document</h3>
              <p className="text-muted-foreground mb-6">Please review all the information before generating your document.</p>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Parties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Company:</p>
                        <p>{formData.companyName || "Not specified"}</p>
                        <p>{formData.companyEmail || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Employee:</p>
                        <p>{formData.employeeName || "Not specified"}</p>
                        <p>{formData.employeeEmail || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Terms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Position:</p>
                        <p>{formData.position || "Not specified"}</p>
                        <p className="font-medium mt-2">Salary:</p>
                        <p>{formData.salary || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Start Date:</p>
                        <p>{formData.startDate ? format(formData.startDate, "PPP") : "Not specified"}</p>
                        <p className="font-medium mt-2">Payment:</p>
                        <p>{formData.paymentFrequency || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selected Clauses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.selectedClauses.map(clauseId => {
                        const clause = availableClauses.find(c => c.id === clauseId);
                        return clause ? (
                          <div key={clauseId} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">{clause.title}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
          Create {template?.name}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Fill out the form below to generate your professional legal document.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center min-w-0">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.id}
                </div>
                <div className="ml-3 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 md:w-16 h-0.5 mx-2 md:mx-4 flex-shrink-0",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="mb-6 md:mb-8">
        <CardContent className="p-4 md:p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="w-full md:w-auto h-11"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <Button 
            variant="ghost" 
            className="w-full md:w-auto h-11"
            onClick={handleSaveDraft}
            disabled={documentLoading}
          >
            {documentLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>

          {currentStep === steps.length ? (
            <Button onClick={handlePreview} className="bg-primary hover:bg-primary/90 w-full md:w-auto h-11">
              <Eye className="h-4 w-4 mr-2" />
              Preview Document
            </Button>
          ) : (
            <Button onClick={nextStep} className="w-full md:w-auto h-11">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
