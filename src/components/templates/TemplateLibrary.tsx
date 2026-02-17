
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Users, Briefcase, Shield, ArrowRight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateLibraryProps {
  onSelectTemplate: (template: any) => void;
}

const templates = [
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Protect confidential information in business relationships",
    icon: Shield,
    category: "Legal Protection",
    estimatedTime: "5 minutes",
    fields: ["Parties", "Confidential Information", "Term", "Obligations"]
  },
  {
    id: "employment",
    name: "Employment Agreement",
    description: "Comprehensive employment contracts with terms and conditions",
    icon: Users,
    category: "HR & Employment",
    estimatedTime: "8 minutes",
    fields: ["Employee Details", "Position", "Compensation", "Benefits", "Termination"]
  },
  {
    id: "service-contract",
    name: "Service Contract",
    description: "Professional service agreements for consultants and agencies",
    icon: Briefcase,
    category: "Business",
    estimatedTime: "10 minutes",
    fields: ["Scope of Work", "Timeline", "Payment Terms", "Deliverables"]
  },
  {
    id: "consulting",
    name: "Consulting Agreement",
    description: "Independent contractor and consulting arrangements",
    icon: FileText,
    category: "Business",
    estimatedTime: "7 minutes",
    fields: ["Consultant Info", "Services", "Fees", "Intellectual Property"]
  },
  {
    id: "freelance",
    name: "Freelance Contract",
    description: "Simple agreements for freelance and project-based work",
    icon: Users,
    category: "Freelance",
    estimatedTime: "6 minutes",
    fields: ["Project Details", "Timeline", "Payment", "Ownership Rights"]
  },
  {
    id: "partnership",
    name: "Partnership Agreement",
    description: "Legal framework for business partnerships and joint ventures",
    icon: Briefcase,
    category: "Business",
    estimatedTime: "12 minutes",
    fields: ["Partners", "Capital", "Profit Sharing", "Management", "Exit Terms"]
  }
];

export const TemplateLibrary = ({ onSelectTemplate }: TemplateLibraryProps) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    name: "",
    description: "",
    category: "",
    estimatedTime: "",
    fields: ""
  });
  const { toast } = useToast();

  const handleCustomTemplate = () => {
    if (!customTemplate.name || !customTemplate.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the template name and description.",
        variant: "destructive"
      });
      return;
    }

    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: customTemplate.name,
      description: customTemplate.description,
      icon: FileText,
      category: customTemplate.category || "Custom",
      estimatedTime: customTemplate.estimatedTime || "10 minutes",
      fields: customTemplate.fields.split(',').map(field => field.trim()).filter(Boolean)
    };

    toast({
      title: "Custom Template Created",
      description: `"${customTemplate.name}" template has been created.`,
    });

    setIsCustomModalOpen(false);
    setCustomTemplate({ name: "", description: "", category: "", estimatedTime: "", fields: "" });
    onSelectTemplate(newTemplate);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Choose a smart template to get started
        </h1>
        <p className="text-lg text-gray-600">
          Select from our professionally crafted legal document templates designed for common business needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          
          return (
            <Card key={template.id} className="hover-scale hover:shadow-lg transition-all duration-200 border-0 shadow-sm group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{template.category}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Est. time: {template.estimatedTime}</span>
                  <span>{template.fields.length} sections</span>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => onSelectTemplate(template)}
                  className="w-full group-hover:shadow-md transition-all"
                >
                  Use Template
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 mb-4">Need something specific?</p>
        <Button variant="outline" onClick={() => setIsCustomModalOpen(true)}>
          Request Custom Template
        </Button>
      </div>

      {/* Custom Template Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Custom Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={customTemplate.name}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Partnership Agreement"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={customTemplate.description}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template is for..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={customTemplate.category}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Business, Legal, HR"
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input
                  id="estimatedTime"
                  value={customTemplate.estimatedTime}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  placeholder="e.g., 15 minutes"
                />
              </div>
              
              <div>
                <Label htmlFor="fields">Required Fields (comma-separated)</Label>
                <Input
                  id="fields"
                  value={customTemplate.fields}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, fields: e.target.value }))}
                  placeholder="e.g., Company Name, Partner Details, Terms"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCustomModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCustomTemplate}
                  className="flex-1"
                  disabled={!customTemplate.name || !customTemplate.description}
                >
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
