
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Filter,
  BookOpen,
  FileText
} from "lucide-react";

const clauseCategories = [
  "All",
  "Payment",
  "Termination",
  "Intellectual Property",
  "Confidentiality",
  "Liability",
  "Dispute Resolution"
];

const savedClauses = [
  {
    id: 1,
    title: "Standard Confidentiality Clause",
    description: "Basic confidentiality terms for protecting sensitive business information",
    category: "Confidentiality",
    content: "The receiving party agrees to maintain in confidence all proprietary and confidential information disclosed by the disclosing party...",
    lastUsed: "2 days ago",
    usageCount: 15
  },
  {
    id: 2,
    title: "30-Day Termination Notice",
    description: "Standard termination clause requiring 30 days written notice",
    category: "Termination",
    content: "Either party may terminate this agreement upon thirty (30) days written notice to the other party...",
    lastUsed: "1 week ago",
    usageCount: 8
  },
  {
    id: 3,
    title: "IP Assignment Clause",
    description: "Assigns all intellectual property rights to the company",
    category: "Intellectual Property",
    content: "All work products, inventions, improvements, discoveries, and intellectual property created during the term of employment...",
    lastUsed: "3 days ago",
    usageCount: 12
  },
  {
    id: 4,
    title: "Monthly Payment Terms",
    description: "Standard monthly payment schedule and late fee provisions",
    category: "Payment",
    content: "Payment shall be made monthly on the last business day of each month. Late payments are subject to a 1.5% monthly fee...",
    lastUsed: "5 days ago",
    usageCount: 6
  },
  {
    id: 5,
    title: "Limitation of Liability",
    description: "Limits liability for indirect and consequential damages",
    category: "Liability",
    content: "In no event shall either party be liable for any indirect, incidental, special, or consequential damages...",
    lastUsed: "1 week ago",
    usageCount: 9
  }
];

const STORAGE_KEY = "legalflow_clause_library";

export const ClauseLibrary = () => {
  const [clauses, setClauses] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : savedClauses;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<any>(null);
  const [newClause, setNewClause] = useState({
    title: "",
    description: "",
    category: "",
    content: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clauses));
  }, [clauses]);

  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || clause.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddClause = () => {
    if (!newClause.title || !newClause.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and content fields.",
        variant: "destructive"
      });
      return;
    }

    if (editingClause) {
      setClauses(prev => prev.map(c =>
        c.id === editingClause.id
          ? { ...c, ...newClause, lastUsed: "Just now" }
          : c
      ));
      toast({
        title: "Clause Updated",
        description: `"${newClause.title}" has been updated.`,
      });
    } else {
      const id = Math.max(0, ...clauses.map(c => c.id)) + 1;
      const clauseWithId = {
        ...newClause,
        id,
        lastUsed: "Never",
        usageCount: 0
      };
      setClauses(prev => [clauseWithId, ...prev]);
      toast({
        title: "Clause Added",
        description: `"${newClause.title}" has been added to your library.`,
      });
    }

    closeModal();
  };

  const handleEditClause = (clause: any) => {
    setEditingClause(clause);
    setNewClause({
      title: clause.title,
      description: clause.description,
      category: clause.category,
      content: clause.content
    });
    setIsAddModalOpen(true);
  };

  const handleCopyClause = (clause: any) => {
    navigator.clipboard.writeText(clause.content);
    toast({
      title: "Copied to Clipboard",
      description: `"${clause.title}" content has been copied.`,
    });
  };

  const handleDeleteClause = (clause: any) => {
    setClauses(prev => prev.filter(c => c.id !== clause.id));
    toast({
      title: "Clause Deleted",
      description: `"${clause.title}" has been removed from your library.`,
    });
  };

  const handleAddToDocument = (clause: any) => {
    toast({
      title: "Added to Document",
      description: `"${clause.title}" will be available in your next document.`,
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingClause(null);
    setNewClause({ title: "", description: "", category: "", content: "" });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Clause Library</h1>
        <p className="text-lg text-gray-600">
          Your saved clauses live here. Reuse them across multiple documents.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {clauseCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Clause
        </Button>
      </div>

      {/* Clauses Grid */}
      {filteredClauses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClauses.map((clause) => (
            <Card key={clause.id} className="hover-scale hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {clause.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm mb-3">{clause.description}</p>
                    <Badge variant="secondary">{clause.category}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {clause.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Used {clause.usageCount} times</span>
                  <span>Last used {clause.lastUsed}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToDocument(clause)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Add to Document
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyClause(clause)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClause(clause)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClause(clause)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="hover-scale hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== "All"
                ? "No clauses match your filters"
                : "No saved clauses yet"
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search or category filter"
                : "Create reusable clauses to speed up document creation"
              }
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Clause
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Clause Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingClause ? 'Edit Clause' : 'Create New Clause'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Clause Title *</Label>
                <Input
                  id="title"
                  value={newClause.title}
                  onChange={(e) => setNewClause(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Standard Confidentiality Clause"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newClause.description}
                  onChange={(e) => setNewClause(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this clause covers"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newClause.category}
                  onChange={(e) => setNewClause(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Confidentiality, Payment, Termination"
                />
              </div>

              <div>
                <Label htmlFor="content">Clause Content *</Label>
                <Textarea
                  id="content"
                  value={newClause.content}
                  onChange={(e) => setNewClause(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the full legal text of the clause..."
                  rows={8}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddClause}
                  className="flex-1"
                  disabled={!newClause.title || !newClause.content}
                >
                  {editingClause ? 'Update Clause' : 'Create Clause'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
